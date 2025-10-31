'use client'

import { useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { useWorkflow } from '@/hooks/workflow/use-workflow'
import type { FlowNode, FlowEdge } from '@/lib/workflow/types'
import dagre from '@dagrejs/dagre'

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(
  () => ({})
)

const getNodeDimensions = (node: FlowNode) => {
  const nodeWidth = 182
  const nodeHeight = node.measured?.height ?? 58
  return { nodeWidth, nodeHeight }
}

export const getLayoutedElements = (
  nodes: FlowNode[],
  edges: FlowEdge[],
  direction = 'TB'
) => {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach(node => {
    const { nodeWidth, nodeHeight } = getNodeDimensions(node)
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const newNodes = nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const { nodeWidth, nodeHeight } = getNodeDimensions(node)
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    } as FlowNode

    return newNode
  })

  return { nodes: newNodes, edges }
}

// export function useDagre() {
//   const { nodes, edges } = useWorkflow(store => store.getWorkflowData())
//   const { fitView } = useReactFlow()

//   const layout = useCallback(() => {
//     fitView()
//   }, [fitView])
// }
