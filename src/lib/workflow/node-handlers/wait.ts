import type { UIMessageStreamWriter } from 'ai'
import type { NodeExecutionResult, ExecutionResult } from './_types'
import type {
  WorkflowUIMessage,
  WorkflowUIMessageChunk,
} from '@/lib/workflow/messages'
import type { FlowEdge, FlowNode } from '@/lib/workflow/types'
import { isNodeOfType } from '@/lib/workflow/types'

/**
 * Execute a wait node
 * Waits for a specified amount of time and routes to the appropriate next node
 */

export async function executeWaitNode({
  node,
  edges,
  writer,
}: {
  node: FlowNode
  edges: FlowEdge[]
  writer: UIMessageStreamWriter<WorkflowUIMessage>
}): Promise<NodeExecutionResult> {
  if (!isNodeOfType(node, 'wait')) {
    throw new Error(`Node ${node.id} is not a wait node`)
  }

  const timeout = Math.max(0, Number(node.data?.timeout ?? 0))

  const result: ExecutionResult = {
    text: 'wait',
    nodeType: 'wait',
  }

  const outgoingEdge = edges.find(edge => edge.source === node.id)
  const nextNodeId = outgoingEdge ? outgoingEdge.target : null

  // Emit an initial state
  node.data.countdown = timeout
  node.data.status = 'processing'

  writer.write({
    type: 'data-node-execution-state',
    id: node.id,
    data: {
      nodeId: node.id,
      nodeType: node.type,
      data: node.data,
    },
  })

  const start = Date.now()
  let interval: ReturnType<typeof setInterval> | null = null

  try {
    await new Promise<void>(resolve => {
      // Edge case: zero/negative timeout — resolve immediately
      if (timeout <= 0) return resolve()

      interval = setInterval(() => {
        const elapsed = Date.now() - start
        const remaining = Math.max(0, timeout - elapsed)

        writer.write({
          type: 'data-node-execution-state',
          id: node.id,
          data: {
            nodeId: node.id,
            nodeType: node.type,
            data: { ...node.data, countdown: remaining },
          },
        })

        if (remaining <= 0) {
          if (interval) {
            clearInterval(interval)
            interval = null
          }
          resolve()
        }
      }, 100)
    })
  } finally {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
    // Final state: clear the countdown from UI
    node.data.countdown = null
    writer.write({
      type: 'data-node-execution-state',
      id: node.id,
      data: {
        nodeId: node.id,
        nodeType: node.type,
        data: node.data,
      },
    })
  }

  return { result, nextNodeId }
}
