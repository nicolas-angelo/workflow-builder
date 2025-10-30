import type { UIMessageStreamWriter } from 'ai'
import type { NodeExecutionResult, ExecutionResult } from './_types'
import type {
  WorkflowUIMessage,
  WorkflowUIMessageChunk,
} from '@/lib/workflow/messages'
import type { FlowNode } from '@/lib/workflow/types'
import { isNodeOfType } from '@/lib/workflow/types'

/**
 * Execute an end node
 * End nodes don't perform any action and signal workflow completion
 */
export function executeEndNode(
  node: FlowNode,
  writer: UIMessageStreamWriter<WorkflowUIMessage>
): NodeExecutionResult {
  if (!isNodeOfType(node, 'end')) {
    throw new Error(`Node ${node.id} is not an end node`)
  }

  const result: ExecutionResult = {
    text: 'end',
    nodeType: 'end',
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

  writer.write({
    type: 'finish',
  })

  return { result, nextNodeId: null }
}
