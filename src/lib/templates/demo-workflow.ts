import type { FlowEdge, FlowNode } from '@/lib/workflow/types'

export const DEMO_WORKFLOW: {
  nodes: FlowNode[]
  edges: FlowEdge[]
} = {
  nodes: [
    {
      id: 'start-node',
      type: 'start',
      position: {
        x: 0,
        y: 0,
      },
      data: {
        sourceType: {
          type: 'text',
        },
      },
      measured: {
        width: 163,
        height: 58,
      },
      selected: false,
      dragging: false,
    },
  ],
  edges: [],
}
