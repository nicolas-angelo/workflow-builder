import { type Node, type NodeProps, Position } from '@xyflow/react'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BaseHandle } from '@/components/workflow/primitives/base-handle'
import { BaseNode } from '@/components/workflow/primitives/base-node'
import {
  NodeHeader,
  NodeHeaderActions,
  NodeHeaderIcon,
  NodeHeaderStatus,
  NodeHeaderTitle,
} from '@/components/workflow/primitives/node-header'
import type {
  NodeStatus,
  TextNodeOutput,
  ValidationError,
} from '@/lib/workflow/types'
import { useWorkflow } from '@/hooks/workflow/use-workflow'

export type StartNodeData = {
  status?: NodeStatus
  sourceType: TextNodeOutput
  validationErrors?: ValidationError[]
}

export type StartNode = Node<StartNodeData, 'start'>

export interface StartNodeProps extends NodeProps<StartNode> {}

export function StartNode({ id, selected, data }: StartNodeProps) {
  const canConnectHandle = useWorkflow(store => store.canConnectHandle)

  const validationErrors =
    data.validationErrors?.map(error => ({
      message: error.message,
    })) || []

  const isHandleConnectable = canConnectHandle({
    nodeId: id,
    handleId: 'message',
    type: 'source',
  })

  return (
    <BaseNode
      className={cn('flex flex-col p-2', {
        'border-orange-500': data.status === 'processing',
        'border-red-500': data.status === 'error',
      })}
      selected={selected}
    >
      <NodeHeader className="m-0">
        <NodeHeaderIcon>
          <Play />
        </NodeHeaderIcon>
        <NodeHeaderTitle>Start</NodeHeaderTitle>
        <NodeHeaderActions>
          <NodeHeaderStatus
            errors={validationErrors}
            status={data.status}
          />
        </NodeHeaderActions>
      </NodeHeader>

      <BaseHandle
        id="message"
        isConnectable={isHandleConnectable}
        position={Position.Bottom}
        type="source"
      />
    </BaseNode>
  )
}

export function StartNodePanel({ node: _node }: { node: StartNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 font-medium text-sm">Start Node</h4>
        <p className="text-gray-600 text-xs">
          This node initiates the workflow execution.
        </p>
      </div>
    </div>
  )
}
