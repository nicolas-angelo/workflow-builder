'use client'

import { useTheme } from 'next-themes'
import { useChatStatus } from '@ai-sdk-tools/store'
import {
  Background,
  Controls,
  ReactFlow,
  ConnectionLineType,
} from '@xyflow/react'
import type { EdgeTypes, NodeTypes } from '@xyflow/react'
import { Connection as ConnectionLine } from '@/components/ai-elements/connection'
import { NodeEditorPanel } from '@/components/workflow/node-editor-panel'
import { NodeSelectorPanel } from '@/components/workflow/node-selector-panel'
import {
  useCanvasActions,
  useCanvas,
  useCanvasDnd,
} from '@/hooks/workflow/use-canvas'
import { WORKFLOW_TOOL_DESCRIPTIONS } from '@/lib/tools'

interface CanvasProps {
  nodeTypes: NodeTypes
  edgeTypes: EdgeTypes
}

export function Canvas({ nodeTypes, edgeTypes }: CanvasProps) {
  const { theme } = useTheme()
  const status = useChatStatus()

  const { onDragOver, onDrop } = useCanvasDnd()
  const { onConnect, onNodesChange, onEdgesChange } = useCanvasActions()
  const { nodes, edges, selectedNodes } = useCanvas()

  const isLoading = status === 'streaming' || status === 'submitted'

  return (
    <ReactFlow
      colorMode={theme === 'dark' ? 'dark' : 'light'}
      connectionLineComponent={ConnectionLine as any}
      connectionLineType={ConnectionLineType.SmoothStep}
      edges={edges}
      edgesFocusable={!isLoading}
      edgeTypes={edgeTypes}
      elementsSelectable={!isLoading}
      fitView
      nodes={nodes}
      nodesConnectable={!isLoading}
      nodesDraggable={!isLoading}
      nodesFocusable={!isLoading}
      nodeTypes={nodeTypes}
      onConnect={onConnect}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onEdgesChange={onEdgesChange}
      onNodesChange={onNodesChange}
    >
      <Background />
      <Controls />
      <NodeSelectorPanel />

      {selectedNodes.length === 1 && (
        <NodeEditorPanel
          nodeId={selectedNodes[0].id}
          toolDescriptions={WORKFLOW_TOOL_DESCRIPTIONS}
        />
      )}
    </ReactFlow>
  )
}
