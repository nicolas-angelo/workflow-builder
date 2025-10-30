import {
  jsonSchema,
  Output,
  smoothStream,
  stepCountIs,
  streamText,
  type Tool,
  type ModelMessage,
  type UIMessageStreamWriter,
} from 'ai'
import type { NodeExecutionResult, ExecutionResult } from './_types'
import { getWorkflowTools, type WorkflowToolId } from '@/lib/tools'
import type { WorkflowUIMessage } from '@/lib/workflow/messages'
import { workflowModel } from '@/lib/workflow/models'
import type { FlowEdge, FlowNode } from '@/lib/workflow/types'
import { isNodeOfType } from '@/lib/workflow/types'

/**
 * Execute an agent node
 * Runs the AI agent and routes to the next node
 */
export async function executeAgentNode({
  node,
  edges,
  accumulatedMessages,
  writer,
}: {
  node: FlowNode
  edges: FlowEdge[]
  accumulatedMessages: ModelMessage[]
  writer: UIMessageStreamWriter<WorkflowUIMessage>
}): Promise<NodeExecutionResult> {
  'use step'

  if (!isNodeOfType(node, 'agent')) {
    throw new Error(`Node ${node.id} is not an agent node`)
  }

  let output: Parameters<typeof streamText>[0]['experimental_output']

  if (node.data.sourceType.type === 'structured') {
    const schema = node.data.sourceType.schema

    if (!schema) {
      throw new Error('Schema is required for structured output')
    }

    const jsonSchemaValue = jsonSchema(schema)
    output = Output.object({
      schema: jsonSchemaValue,
    })
  }

  const tools = getWorkflowTools()
  const agentTools: Partial<Record<WorkflowToolId, Tool>> = {}

  for (const toolId of node.data.selectedTools) {
    const matchedTool = tools[toolId as WorkflowToolId]
    if (matchedTool) {
      agentTools[toolId as WorkflowToolId] = matchedTool
    }
  }

  const streamResult = streamText({
    model: workflowModel.languageModel(node.data.model),
    system: node.data.systemPrompt,
    messages: accumulatedMessages,
    tools: agentTools,
    stopWhen: stepCountIs(node.data.maxSteps ?? 5),
    experimental_transform: smoothStream(),
    experimental_output: output,
  })

  if (!node.data.hideResponseInChat) {
    writer.merge(
      streamResult.toUIMessageStream({
        sendStart: false,
        sendFinish: false,
      })
    )
  }

  const response = await streamResult.response
  const text = await streamResult.text

  let structured: unknown
  if (node.data.sourceType.type === 'structured') {
    try {
      structured = JSON.parse(text)
    } catch (e) {
      console.error('Failed to parse structured output:', e)
    }
  }

  if (!node.data.excludeFromConversation) {
    accumulatedMessages.push(...response.messages)
  }

  const result: ExecutionResult = {
    text,
    structured,
    nodeType: 'agent',
    messages: response.messages,
  }

  const outgoingEdge = edges.find(edge => edge.source === node.id)
  const nextNodeId = outgoingEdge ? outgoingEdge.target : null

  writer.write({
    type: 'data-node-execution-state',
    id: node.id,
    data: {
      nodeId: node.id,
      nodeType: node.type,
      data: node.data,
    },
  })

  return { result, nextNodeId }
}
