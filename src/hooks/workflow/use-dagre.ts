'use client'

import { useCallback, useState, useEffect } from 'react'
import { shallow } from 'zustand/shallow'
import { useNodesInitialized, useReactFlow, useStore } from '@xyflow/react'
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
  edges: FlowEdge[]
) => {
  dagreGraph.setGraph({ rankdir: 'TB' })

  edges.forEach(edge => dagreGraph.setEdge(edge.source, edge.target))
  nodes.forEach(node => {
    const { nodeWidth, nodeHeight } = getNodeDimensions(node)
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  dagre.layout(dagreGraph)

  const newNodes = nodes.map(node => {
    const { x, y } = dagreGraph.node(node.id)
    const { nodeWidth, nodeHeight } = getNodeDimensions(node)
    const newNode = {
      ...node,
      targetPosition: 'top',
      sourcePosition: 'bottom',
      position: {
        x: x - nodeWidth / 2,
        y: y - nodeHeight / 2,
      },
    } as FlowNode

    return newNode
  })

  return { nodes: newNodes, edges }
}

export function useDagre() {
  const [viewIsFit, setViewIsFit] = useState(false)
  const [initialLayoutFinished, setInitialLayoutFinished] = useState(false)
  const [nodesPositioned, setNodesPositioned] = useState(false)

  const nodesInitialized = useNodesInitialized()

  const store = useWorkflow(
    store => ({
      nodes: store.nodes,
      edges: store.edges,
      intializeWorkflow: store.initializeWorkflow,
    }),
    shallow
  )

  const { nodes, edges, intializeWorkflow } = store
  const { fitView } = useReactFlow()

  useEffect(() => {
    if (nodes[0]?.width) {
      // if nodes exist and nodes are not positioned
      if (nodes.length > 0 && !nodesPositioned) {
        const layouted = getLayoutedElements(nodes, edges)
        intializeWorkflow({ nodes: layouted.nodes, edges: layouted.edges })
        setNodesPositioned(true)

        // fit view
        window.requestAnimationFrame(() => {
          fitView({ duration: 1000 })
        })
        setViewIsFit(true)
      }
    }
  }, [nodesPositioned, nodes, edges, intializeWorkflow, fitView])
}
