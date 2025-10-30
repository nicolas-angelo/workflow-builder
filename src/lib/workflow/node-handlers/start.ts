import type { UIMessageStreamWriter } from 'ai'
import type { NodeExecutionResult, ExecutionResult } from './_types'
import type {
  WorkflowUIMessage,
  WorkflowUIMessageChunk,
} from '@/lib/workflow/messages'
import type { FlowEdge, FlowNode } from '@/lib/workflow/types'
import { isNodeOfType } from '@/lib/workflow/types'

/**
 * Execute a start node
 * Start nodes don't perform any action, just route to the next node
 */
export function executeStartNode({
  node,
  edges,
  writer,
}: {
  node: FlowNode
  edges: FlowEdge[]
  writer: UIMessageStreamWriter<WorkflowUIMessage>
}): NodeExecutionResult {
  if (!isNodeOfType(node, 'start')) {
    throw new Error(`Node ${node.id} is not a start node`)
  }

  const result: ExecutionResult = {
    text: 'start',
    nodeType: 'start',
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
