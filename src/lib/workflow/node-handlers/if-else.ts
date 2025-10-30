import jexl from 'jexl'
import type { UIMessageStreamWriter } from 'ai'
import type { NodeExecutionResult, ExecutionResult } from './_types'
import type { WorkflowUIMessage } from '@/lib/workflow/messages'
import type { FlowEdge, FlowNode } from '@/lib/workflow/types'
import { isNodeOfType } from '@/lib/workflow/types'

/**
 * Execute an if-else node
 * Evaluates conditions and routes to the appropriate next node
 */
export function executeIfElseNode({
  node,
  edges,
  executionMemory,
  previousNodeId,
  writer,
}: {
  node: FlowNode
  edges: FlowEdge[]
  executionMemory: Record<string, ExecutionResult>
  previousNodeId: string
  writer: UIMessageStreamWriter<WorkflowUIMessage>
}): NodeExecutionResult {
  if (!isNodeOfType(node, 'if-else')) {
    throw new Error(`Node ${node.id} is not an if-else node`)
  }

  const result: ExecutionResult = {
    text: 'if-else-routing',
    nodeType: 'if-else',
  }

  const context = executionMemory[previousNodeId]

  let nextNodeId: string | null = null

  if (context) {
    for (const handle of node.data.dynamicSourceHandles) {
      if (!handle.condition || handle.condition.trim() === '') {
        continue
      }

      try {
        const jexlContext = {
          input: context.structured ? context.structured : context.text,
        }

        const conditionResult = jexl.evalSync(
          handle.condition,
          jexlContext
        )

        if (conditionResult) {
          const outgoingEdge = edges.find(
            edge =>
              edge.source === node.id && edge.sourceHandle === handle.id
          )

          if (outgoingEdge) {
            nextNodeId = outgoingEdge.target
            break
          }
        }
      } catch (error) {
        console.error(
          `Error evaluating condition: ${handle.condition}`,
          error
        )
      }
    }

    if (!nextNodeId) {
      const elseEdge = edges.find(
        edge => edge.source === node.id && edge.sourceHandle === 'else'
      )
      nextNodeId = elseEdge ? elseEdge.target : null
    }
  }

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
