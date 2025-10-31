'use client'

import { useMemo } from 'react'
import { generateId } from 'ai'
import { useChat } from '@ai-sdk-tools/store'
import { Provider as ChatProvider } from '@ai-sdk-tools/store'

import { ReactFlowProvider } from '@xyflow/react'
import { TriggerChatTransport } from '@/lib/trigger/use-chat'
import { triggerTask } from '@/actions'
import {
  AppLayout,
  AppLayoutInset,
  AppLayoutSidebar,
} from '@/components/workflow/app-layout'
import { TemplatesProvider } from '@/components/workflow/templates'
import { WorkflowHeader } from '@/components/workflow/header'
import { Canvas } from '@/components/workflow/canvas'
import { Chat } from '@/components/workflow/chat'

import nodeTypes from '@/components/workflow/nodes'
import edgeTypes from '@/components/workflow/edges'

import { WORKFLOW_TEMPLATES } from '@/lib/templates'
import type {
  WorkflowUIMessage,
  WorkflowAIDataPart,
} from '@/lib/workflow/messages'
import { useWorkflow } from '@/hooks/workflow/use-workflow'
import '@xyflow/react/dist/style.css'

export function Flow({ chatId }: { chatId: string }) {
  const updateNode = useWorkflow(store => store.updateNode)

  const { messages, sendMessage, status, stop, setMessages } =
    useChat<WorkflowUIMessage>({
      id: chatId,
      transport: new TriggerChatTransport({
        triggerTask,
      }),
      onData: dataPart => {
        if (dataPart.type === 'data-node-execution-state') {
          updateNode({
            id: dataPart.data.nodeId,
            nodeType: dataPart.data.nodeType,
            data: dataPart.data.data,
          })
        }
        if (dataPart.type === 'data-node-execution-status') {
          updateNode({
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

  // useDataPart<WorkflowAIDataPart['node-execution-state']>(
  //   'node-execution-state',
  //   {
  //     onData: dataPart => {
  //       updateNode({
  //         id: dataPart.data.nodeId,
  //         nodeType: dataPart.data.nodeType,
  //         data: dataPart.data.data,
  //       })
  //     },
  //   }
  // )
  // useDataPart<WorkflowAIDataPart['node-execution-status']>(
  //   'node-execution-status',
  //   {
  //     onData: dataPart => {
  //       updateNode({
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
  //     },
  //   }
  // )

  return (
    <AppLayout>
      <AppLayoutInset>
        <WorkflowHeader />
        <Canvas edgeTypes={edgeTypes} nodeTypes={nodeTypes} />
      </AppLayoutInset>
      <AppLayoutSidebar>
        <Chat
          messages={messages}
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
  const chatId = useMemo(() => generateId(), [])
  return (
    <div className="h-screen w-screen">
      <ReactFlowProvider>
        <ChatProvider initialMessages={[]} key={chatId}>
          <TemplatesProvider templates={WORKFLOW_TEMPLATES}>
            <Flow chatId={chatId} />
          </TemplatesProvider>
        </ChatProvider>
      </ReactFlowProvider>
    </div>
  )
}
