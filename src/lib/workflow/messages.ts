import type {
  InferUITools,
  ToolUIPart,
  UIMessage,
  UIMessageChunk,
} from 'ai'
import type { getWorkflowTools } from '@/lib/tools'
import type { FlowNode, NodeStatus } from '@/lib/workflow/types'

/////////////////////
// AI UI Messages //
/////////////////////

type WorkflowAIMetadata = Record<string, unknown>

export type WorkflowAIDataPart = {
  'node-execution-status': {
    nodeId: string
    nodeType: FlowNode['type']
    name?: string
    status: NodeStatus
    error?: string
  }
  'node-execution-state': {
    nodeId: string
    nodeType: FlowNode['type']
    data: FlowNode['data']
  }
}

export type WorkflowUIMessageChunk = UIMessageChunk<
  WorkflowAIMetadata,
  WorkflowAIDataPart
>

type WorkflowAgentToolSet = ReturnType<typeof getWorkflowTools>
type WorkflowAITools = InferUITools<WorkflowAgentToolSet>

export type WorkflowAIToolUIPart = ToolUIPart<WorkflowAITools>

export type WorkflowUIMessage = UIMessage<
  WorkflowAIMetadata,
  WorkflowAIDataPart,
  WorkflowAITools
>
