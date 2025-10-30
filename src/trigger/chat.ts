import { metadata, task } from '@trigger.dev/sdk/v3'
import { createUIMessageStream } from 'ai'
import { executeWorkflow } from '@/lib/workflow/executor'
import type { WorkflowUIMessage } from '@/lib/workflow/messages'
import type { FlowEdge, FlowNode } from '@/lib/workflow/types'

type WorkflowPayload = {
  chatId: string
  trigger: 'submit-message' | 'regenerate-message'
  messages: WorkflowUIMessage[]
  body: {
    nodes: FlowNode[]
    edges: FlowEdge[]
  }
}

export const chatTask = task<'chat', WorkflowPayload>({
  id: 'chat',
  run: async ({ chatId, messages, body, trigger }) => {
    const { nodes, edges } = body

    const stream = createUIMessageStream<WorkflowUIMessage>({
      execute: ({ writer }) =>
        executeWorkflow({ nodes, edges, messages, writer }),
    })

    await metadata.stream('chat', stream)

    return { success: true, chatId: chatId }
  },
})
