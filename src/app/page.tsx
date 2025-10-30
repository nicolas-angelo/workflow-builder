'use client'

import { useCallback, useEffect, useState } from 'react'
import type { DragEvent } from 'react'

import { useTheme } from 'next-themes'
import { shallow } from 'zustand/shallow'
import { Workflow } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useOnSelectionChange,
  useReactFlow,
} from '@xyflow/react'
import type { EdgeTypes, NodeTypes } from '@xyflow/react'

import { useChat } from '@ai-sdk/react'
import { TriggerChatTransport } from '@/lib/trigger/use-chat'
import { triggerTask } from '@/actions'
// import { DefaultChatTransport } from 'ai'

import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  AppHeader,
  AppHeaderIcon,
  AppHeaderSeparator,
  AppHeaderTitle,
} from '@/components/app-header'
import {
  AppLayout,
  AppLayoutInset,
  AppLayoutSidebar,
} from '@/components/app-layout'
import { Chat } from '@/components/chat'
import { NodeEditorPanel } from '@/components/node-editor-panel'
import { NodeSelectorPanel } from '@/components/node-selector-panel'
import { TemplateSelector } from '@/components/template-selector'
import { ThemeToggle } from '@/components/theme-toggle'
import { ValidationStatus } from '@/components/validation-status'
import { AgentNode } from '@/components/workflow/agent-node'
import { EndNode } from '@/components/workflow/end-node'
import { WaitNode } from '@/components/workflow/wait-node'
import { IfElseNode } from '@/components/workflow/if-else-node'
import { NoteNode } from '@/components/workflow/note-node'
import { StartNode } from '@/components/workflow/start-node'
import { StatusEdge } from '@/components/workflow/status-edge'
import { DEFAULT_TEMPLATE, getTemplateById } from '@/lib/templates'
import { WORKFLOW_TOOL_DESCRIPTIONS } from '@/lib/tools'
import type { WorkflowUIMessage } from '@/lib/workflow/messages'
import type { FlowNode } from '@/lib/workflow/types'
import { useWorkflow } from '@/hooks/workflow/use-workflow'
import '@xyflow/react/dist/style.css'

const nodeTypes: NodeTypes = {
  start: StartNode,
  agent: AgentNode,
  end: EndNode,
  'if-else': IfElseNode,
  wait: WaitNode,
  note: NoteNode,
}

const edgeTypes: EdgeTypes = {
  status: StatusEdge,
}

export function Flow() {
  const { theme } = useTheme()
  const store = useWorkflow(
    store => ({
      nodes: store.nodes,
      edges: store.edges,
      onNodesChange: store.onNodesChange,
      onEdgesChange: store.onEdgesChange,
      onConnect: store.onConnect,
      createNode: store.createNode,
      initializeWorkflow: store.initializeWorkflow,
      updateNode: store.updateNode,
    }),
    shallow
  )

  const [selectedNodes, setSelectedNodes] = useState<FlowNode[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    DEFAULT_TEMPLATE.id
  )

  const { messages, sendMessage, status, stop, setMessages } =
    useChat<WorkflowUIMessage>({
      transport: new TriggerChatTransport({
        triggerTask,
      }),
      onData: dataPart => {
        if (dataPart.type === 'data-node-execution-state') {
          store.updateNode({
            id: dataPart.data.nodeId,
            nodeType: dataPart.data.nodeType,
            data: dataPart.data.data,
          })
        }
        if (dataPart.type === 'data-node-execution-status') {
          store.updateNode({
            id: dataPart.data.nodeId,
            nodeType: dataPart.data.nodeType,
            data: { status: dataPart.data.status },
          })

          if (dataPart.data.status === 'error' && dataPart.data.error) {
            console.error(
              `Node ${dataPart.data.nodeId} error:`,
              dataPart.data.error
            )
          }
        }
      },
    })
  // useChat<WorkflowUIMessage>({
  //   transport: new DefaultChatTransport({
  //     api: '/api/workflow',
  //   }),
  //   onData: dataPart => {
  //     if (dataPart.type === 'data-node-execution-state') {
  //       store.updateNode({
  //         id: dataPart.data.nodeId,
  //         nodeType: dataPart.data.nodeType,
  //         data: dataPart.data.data,
  //       })
  //     }
  //     if (dataPart.type === 'data-node-execution-status') {
  //       store.updateNode({
  //         id: dataPart.data.nodeId,
  //         nodeType: dataPart.data.nodeType,
  //         data: { status: dataPart.data.status },
  //       })

  //       if (dataPart.data.status === 'error' && dataPart.data.error) {
  //         console.error(
  //           `Node ${dataPart.data.nodeId} error:`,
  //           dataPart.data.error
  //         )
  //       }
  //     }
  //   },
  // })

  const isLoading = status === 'streaming' || status === 'submitted'

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(nodes as FlowNode[])
    },
  })

  const handleTemplateSelect = (templateId: string) => {
    const template = getTemplateById(templateId)
    if (template) {
      setSelectedTemplateId(templateId)
      store.initializeWorkflow({
        nodes: template.nodes,
        edges: template.edges,
      })
      // Reset chat messages when switching templates
      setMessages([])
    }
  }

  useEffect(() => {
    store.initializeWorkflow({
      nodes: DEFAULT_TEMPLATE.nodes,
      edges: DEFAULT_TEMPLATE.edges,
    })
  }, [])

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

      store.createNode(type, position)
    },
    [screenToFlowPosition, store.createNode]
  )

  return (
    <AppLayout>
      <AppLayoutInset>
        <AppHeader>
          <AppHeaderIcon>
            <Workflow />
          </AppHeaderIcon>
          <AppHeaderTitle className="ml-2">
            Workflow Builder
          </AppHeaderTitle>
          <AppHeaderSeparator />
          <TemplateSelector
            className="hidden lg:flex"
            onTemplateSelect={handleTemplateSelect}
            selectedTemplateId={selectedTemplateId}
          />
          <AppHeaderSeparator />
          <ThemeToggle />
          <ValidationStatus />
          <SidebarTrigger className="ml-auto" />
          <UserButton />
        </AppHeader>

        <ReactFlow
          colorMode={theme === 'dark' ? 'dark' : 'light'}
          edges={store.edges}
          edgesFocusable={!isLoading}
          edgeTypes={edgeTypes}
          elementsSelectable={!isLoading}
          fitView
          nodes={store.nodes}
          nodesConnectable={!isLoading}
          nodesDraggable={!isLoading}
          nodesFocusable={!isLoading}
          nodeTypes={nodeTypes}
          onConnect={store.onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onEdgesChange={store.onEdgesChange}
          onNodesChange={store.onNodesChange}
        >
          <Background />
          <Controls />
          {/* <MiniMap /> */}
          <NodeSelectorPanel />

          {selectedNodes.length === 1 && (
            <NodeEditorPanel
              nodeId={selectedNodes[0].id}
              toolDescriptions={WORKFLOW_TOOL_DESCRIPTIONS}
            />
          )}
        </ReactFlow>
      </AppLayoutInset>
      <AppLayoutSidebar>
        <Chat
          messages={messages}
          selectedTemplateId={selectedTemplateId}
          sendMessage={sendMessage}
          setMessages={setMessages}
          status={status}
          stop={stop}
        />
      </AppLayoutSidebar>
    </AppLayout>
  )
}

export default function Page() {
  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  )
}
