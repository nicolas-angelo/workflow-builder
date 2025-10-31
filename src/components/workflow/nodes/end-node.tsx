import { type Node, type NodeProps, Position } from '@xyflow/react'
import { Square, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
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
import type { NodeStatus, ValidationError } from '@/lib/workflow/types'
import { useWorkflow } from '@/hooks/workflow/use-workflow'

export type EndNodeData = {
  status?: NodeStatus
  validationErrors?: ValidationError[]
}

export type EndNode = Node<EndNodeData, 'end'>

export interface EndNodeProps extends NodeProps<EndNode> {}

export function EndNode({ selected, data, deletable, id }: EndNodeProps) {
  const deleteNode = useWorkflow(state => state.deleteNode)
  const canConnectHandle = useWorkflow(store => store.canConnectHandle)

  const validationErrors =
    data.validationErrors?.map(error => ({
      message: error.message,
    })) || []

  const isTargetConnectable = canConnectHandle({
    nodeId: id,
    handleId: 'input',
    type: 'target',
  })

  return (
    <BaseNode
      className={cn('flex flex-col p-2', {
        'border-orange-500': data.status === 'processing',
        'border-red-500': data.status === 'error',
      })}
      selected={selected}
      style={{ width: 182 }}
    >
      <NodeHeader className="m-0">
        <NodeHeaderIcon>
          <Square />
        </NodeHeaderIcon>
        <NodeHeaderTitle>End</NodeHeaderTitle>
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

      <BaseHandle
        id="input"
        isConnectable={isTargetConnectable}
        position={Position.Top}
        type="target"
      />
    </BaseNode>
  )
}

export function EndNodePanel({ node: _node }: { node: EndNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 font-medium text-sm">End Node</h4>
        <p className="text-gray-600 text-xs">
          This node terminates the workflow execution.
        </p>
      </div>
    </div>
  )
}
