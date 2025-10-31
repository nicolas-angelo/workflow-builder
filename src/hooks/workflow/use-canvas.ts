'use client'

import { useState, useCallback, useEffect } from 'react'
import type { DragEvent } from 'react'
import { shallow } from 'zustand/shallow'
import {
  useReactFlow,
  useOnSelectionChange,
  useNodesInitialized,
} from '@xyflow/react'
import { getLayoutedElements } from '@/hooks/workflow/use-dagre'
import { useWorkflow } from '@/hooks/workflow/use-workflow'
import type { FlowNode } from '@/lib/workflow/types'

export function useCanvasDnd() {
  const createNode = useWorkflow(store => store.createNode)
  const { screenToFlowPosition } = useReactFlow()

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData(
        'application/reactflow'
      ) as FlowNode['type']

      if (!type) {
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      createNode(type, position)
    },
    [screenToFlowPosition, createNode]
  )
  return {
    onDragOver,
    onDrop,
  }
}

export function useCanvasActions() {
  const store = useWorkflow(
    store => ({
      onNodesChange: store.onNodesChange,
      onEdgesChange: store.onEdgesChange,
      onConnect: store.onConnect,
      createNode: store.createNode,
      initializeWorkflow: store.initializeWorkflow,
      updateNode: store.updateNode,
    }),
    shallow
  )

  return {
    onConnect: store.onConnect,
    onNodesChange: store.onNodesChange,
    onEdgesChange: store.onEdgesChange,
    createNode: store.createNode,
    initializeWorkflow: store.initializeWorkflow,
    updateNode: store.updateNode,
  }
}

export function useCanvas() {
  const nodesInitialized = useNodesInitialized()
  const [initialLayoutFinished, setInitialLayoutFinished] = useState(false)
  const [selectedNodes, setSelectedNodes] = useState<FlowNode[]>([])

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

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges)

    intializeWorkflow({ nodes: layouted.nodes, edges: layouted.edges })

    window.requestAnimationFrame(async () => {
      await fitView({ duration: 1000 })
      if (!initialLayoutFinished) {
        setInitialLayoutFinished(true)
      }
    })
  }, [nodes, edges, intializeWorkflow, initialLayoutFinished])

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(nodes as FlowNode[])
    },
  })

  useEffect(() => {
    if (nodesInitialized && !initialLayoutFinished) {
      onLayout()
    }
  }, [nodesInitialized, initialLayoutFinished])

  useEffect(() => {
    console.log('nodes', nodes.length)
  }, [nodes])

  return {
    nodes: store.nodes,
    edges: store.edges,
    selectedNodes,
  }
}
