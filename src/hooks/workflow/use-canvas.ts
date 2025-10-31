'use client'

import { useState, useCallback, useEffect } from 'react'
import type { DragEvent } from 'react'
import { shallow } from 'zustand/shallow'
import { useReactFlow, useOnSelectionChange } from '@xyflow/react'
import { useDagre } from '@/hooks/workflow/use-dagre'
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
  useDagre()
  const [selectedNodes, setSelectedNodes] = useState<FlowNode[]>([])

  const store = useWorkflow(
    store => ({
      nodes: store.nodes,
      edges: store.edges,
    }),
    shallow
  )

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(nodes as FlowNode[])
    },
  })

  return {
    nodes: store.nodes,
    edges: store.edges,
    selectedNodes,
  }
}
