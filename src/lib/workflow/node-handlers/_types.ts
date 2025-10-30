import type { ModelMessage } from 'ai'
import type { FlowNode } from '@/lib/workflow/types'

export type ExecutionResult = {
  text: string
  structured?: unknown // For structured outputs from agents
  nodeType: FlowNode['type']
  messages?: ModelMessage[]
}

export type NodeExecutionResult = {
  result: ExecutionResult
  nextNodeId: string | null
}
