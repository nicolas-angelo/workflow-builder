import {
  convertToModelMessages,
  type ModelMessage,
  type UIMessageStreamWriter,
} from 'ai'
import type {
  NodeExecutionResult,
  ExecutionResult,
} from './node-handlers/_types'
import type { WorkflowUIMessage } from '@/lib/workflow/messages'
import type { FlowEdge, FlowNode } from '@/lib/workflow/types'
import { isNodeOfType } from '@/lib/workflow/types'
import { validateWorkflow } from '@/lib/workflow/validation'

// Node handlers
import {
  executeStartNode,
  executeAgentNode,
  executeIfElseNode,
  executeEndNode,
  executeWaitNode,
} from './node-handlers'

/**
 * Main workflow execution function
 */
export async function executeWorkflow({
  nodes,
  edges,
  messages,
  writer,
}: {
  nodes: FlowNode[]
  edges: FlowEdge[]
  messages: WorkflowUIMessage[]
  writer: UIMessageStreamWriter<WorkflowUIMessage>
}): Promise<void> {
  const validation = validateWorkflow(nodes, edges)

  if (!validation.valid) {
    console.error('Workflow validation failed:', validation.errors)
    const errorMessages = validation.errors
      .map(e => `- ${e.message}`)
      .join('\n')
    throw new Error(`Workflow validation failed:\n${errorMessages}`)
  }

  if (validation.warnings.length > 0) {
    console.warn('Workflow warnings:', validation.warnings)
  }

  const startNode = nodes.find(node => isNodeOfType(node, 'start'))
  if (!startNode) {
    throw new Error('No start node found')
  }

  const executionMemory: Record<string, ExecutionResult> = {}
  const initialMessages = convertToModelMessages(messages)
  const accumulatedMessages: ModelMessage[] = initialMessages

  let currentNodeId: string | null = startNode.id
  let previousNodeId: string = startNode.id
  let stepCount = 0
  const MAX_STEPS = 100
  const executionPath: string[] = [currentNodeId]

  while (currentNodeId) {
    if (stepCount++ > MAX_STEPS) {
      throw new Error(
        'Execution exceeded maximum steps (possible infinite loop)'
      )
    }

    const node = nodes.find(n => n.id === currentNodeId)
    if (!node) {
      throw new Error(`Node ${currentNodeId} not found`)
    }

    if (isNodeOfType(node, 'note')) {
      throw new Error(
        `Note node ${currentNodeId} found, but should not be executed`
      )
    }

    let executionResult: NodeExecutionResult

    const nodeName = node.type === 'agent' ? node.data.name : node.id

    try {
      writer.write({
        type: 'data-node-execution-status',
        id: node.id,
        data: {
          nodeId: node.id,
          nodeType: node.type,
          name: nodeName,
          status: 'processing',
        },
      })

      switch (true) {
        case isNodeOfType(node, 'start'):
          executionResult = executeStartNode({ node, edges, writer })
          break
        case isNodeOfType(node, 'agent'):
          executionResult = await executeAgentNode({
            node,
            edges,
            accumulatedMessages,
            writer,
          })
          break
        case isNodeOfType(node, 'if-else'):
          executionResult = executeIfElseNode({
            node,
            edges,
            executionMemory,
            previousNodeId,
            writer,
          })
          break
        case isNodeOfType(node, 'end'):
          executionResult = executeEndNode(node, writer)
          break
        case isNodeOfType(node, 'wait'):
          executionResult = await executeWaitNode({
            node,
            edges,
            writer,
          })
          break
        default:
          const exhaustiveCheck: never = node
          throw new Error(`Unknown node type: ${exhaustiveCheck}`)
      }

      writer.write({
        type: 'data-node-execution-status',
        id: node.id,
        data: {
          nodeId: node.id,
          nodeType: node.type,
          name: nodeName,
          status: 'success',
        },
      })

      executionMemory[node.id] = executionResult.result

      previousNodeId = currentNodeId
      currentNodeId = executionResult.nextNodeId

      if (currentNodeId) {
        executionPath.push(currentNodeId)
      }
    } catch (error) {
      writer.write({
        type: 'data-node-execution-status',
        id: node.id,
        data: {
          nodeId: node.id,
          nodeType: node.type,
          name: nodeName,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      throw error
    }

    if (!currentNodeId) {
      break
    }
  }
}
