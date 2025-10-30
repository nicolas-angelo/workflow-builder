import { useEffect } from 'react'
import { type Node, type NodeProps, Position } from '@xyflow/react'
import { Hourglass, Trash } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { BaseHandle } from '@/components/workflow/primitives/base-handle'
import { BaseNode } from '@/components/workflow/primitives/base-node'
import {
  NodeHeader,
  NodeHeaderAction,
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
import { cn } from '@/lib/utils'

export type WaitNodeData = {
  status?: NodeStatus
  timeout: number
  countdown?: number | null
  validationErrors?: ValidationError[]
}

export type WaitNode = Node<WaitNodeData, 'wait'>

export interface WaitNodeProps extends NodeProps<WaitNode> {}

export function WaitNode({
  id,
  selected,
  data,
  deletable,
}: WaitNodeProps) {
  const canConnectHandle = useWorkflow(store => store.canConnectHandle)
  const deleteNode = useWorkflow(state => state.deleteNode)

  const validationErrors =
    data.validationErrors?.map(error => ({
      message: error.message,
    })) || []

  const isSourceConnectable = canConnectHandle({
    nodeId: id,
    handleId: 'endTimeout',
    type: 'source',
  })
  const isTargetConnectable = canConnectHandle({
    nodeId: id,
    handleId: 'startTimeout',
    type: 'target',
  })

  useEffect(() => {
    console.log('data', data)
  }, [data])

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
          <Hourglass />
        </NodeHeaderIcon>
        <NodeHeaderTitle>Wait</NodeHeaderTitle>
        <NodeHeaderActions>
          <NodeHeaderStatus
            errors={validationErrors}
            status={data.status}
          />
          {deletable && (
            <NodeHeaderAction
              label="Delete node"
              onClick={() => deleteNode(id)}
              variant="ghost"
            >
              <Trash />
            </NodeHeaderAction>
          )}
        </NodeHeaderActions>
      </NodeHeader>
      <div className="text max-w-[200px] truncate p-2 pt-0 pl-4 text-left text-muted-foreground">
        {data.countdown ? `${data.countdown}ms` : `${data.timeout}ms`}
      </div>
      <BaseHandle
        id="startTimeout"
        isConnectable={isTargetConnectable}
        position={Position.Left}
        type="target"
      />
      <BaseHandle
        id="endTimeout"
        isConnectable={isSourceConnectable}
        position={Position.Right}
        type="source"
      />
    </BaseNode>
  )
}

export function WaitNodePanel({ node: node }: { node: WaitNode }) {
  const updateNode = useWorkflow(state => state.updateNode)
  return (
    <div className="space-y-4">
      <div>
        <p className="text-gray-600 text-xs">
          This node waits for a specified amount of time before continuing.
        </p>
        <h4 className="my-2 font-medium text-sm">Configuration</h4>
        <div className="space-y-3">
          <div>
            <label
              className="mb-1 block font-medium text-xs"
              htmlFor={`timeout-${node.id}`}
            >
              Timeout
            </label>
            <Input
              className="text-xs"
              id={`timeout-${node.id}`}
              onChange={e => {
                updateNode({
                  id: node.id,
                  nodeType: 'wait',
                  data: {
                    timeout: Number(e.target.value),
                  },
                })
              }}
              placeholder="Enter agent name..."
              type="number"
              value={node.data.timeout}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
