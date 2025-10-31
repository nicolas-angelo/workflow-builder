'use client'

import { useEffect } from 'react'
import {
  type Node,
  type NodeProps,
  Position,
  useUpdateNodeInternals,
  useReactFlow,
} from '@xyflow/react'
import { GitBranch, Plus, Trash } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ConditionEditor } from '@/components/editor/condition-editor'
import { BaseNode } from '@/components/workflow/primitives/base-node'
import { BaseHandle } from '@/components/workflow/primitives/base-handle'
import { LabeledHandle } from '@/components/workflow/primitives/labeled-handle'
import {
  NodeHeader,
  NodeHeaderAction,
  NodeHeaderActions,
  NodeHeaderIcon,
  NodeHeaderStatus,
  NodeHeaderTitle,
} from '@/components/workflow/primitives/node-header'
import type { NodeStatus, ValidationError } from '@/lib/workflow/types'
import { getAvailableVariables } from '@/lib/workflow/variables'
import { useWorkflow } from '@/hooks/workflow/use-workflow'

export type IfElseNodeData = {
  status?: NodeStatus
  dynamicSourceHandles: {
    id: string
    label: string | null
    condition: string
  }[]
  validationErrors?: ValidationError[]
}

export type IfElseNode = Node<IfElseNodeData, 'if-else'>

export interface IfElseNodeProps extends NodeProps<IfElseNode> {}

export function IfElseNode({
  selected,
  data,
  deletable,
  id,
}: IfElseNodeProps) {
  const deleteNode = useWorkflow(state => state.deleteNode)

  const validationErrors =
    data.validationErrors?.map(error => ({
      message: error.message,
    })) || []

  return (
    <BaseNode
      className={cn('flex flex-col p-0', {
        'border-orange-500': data.status === 'processing',
        'border-red-500': data.status === 'error',
      })}
      selected={selected}
      style={{ width: 182 }}
    >
      <div className="col-span-1 flex flex-col gap-2">
        <BaseHandle id="input" position={Position.Top} type="target" />
      </div>
      <NodeHeader className="m-0">
        <NodeHeaderIcon>
          <GitBranch />
        </NodeHeaderIcon>
        <NodeHeaderTitle>If/Else</NodeHeaderTitle>
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
      <Separator />
      <div className="flex w-full justify-around pt-2 text-sm">
        <div className="flex">
          {data.dynamicSourceHandles.map(handle => {
            const displayText = handle.label || handle.condition || '-'
            const isPlaceholder = !handle.label && !handle.condition
            return (
              <BaseHandle
                id={handle.id}
                key={handle.id}
                // labelClassName={cn(
                //   'max-w-56 truncate',
                //   isPlaceholder ? 'text-muted-foreground' : ''
                // )}
                position={Position.Bottom}
                title={''}
                type="source"
              />
            )
          })}
        </div>
      </div>
      <LabeledHandle
        id="else"
        labelClassName="max-w-32 truncate ml-auto"
        position={Position.Right}
        title="Else"
        type="source"
      />
    </BaseNode>
  )
}

export function IfElseNodePanel({ node }: { node: IfElseNode }) {
  const updateNode = useWorkflow(state => state.updateNode)
  const nodes = useWorkflow(state => state.nodes)
  const edges = useWorkflow(state => state.edges)
  const updateNodeInternals = useUpdateNodeInternals()

  // Get available variables for this node
  const availableVariables = useMemo(
    () => getAvailableVariables(node.id, nodes, edges),
    [node.id, nodes, edges]
  )
  const addSourceHandle = () => {
    updateNode({
      id: node.id,
      nodeType: 'if-else',
      data: {
        dynamicSourceHandles: [
          ...node.data.dynamicSourceHandles,
          {
            id: nanoid(),
            label: null,
            condition: '',
          },
        ],
      },
    })
    updateNodeInternals(node.id)
  }

  const updateSourceHandle = (
    handleId: string,
    updates: { label?: string | null; condition?: string }
  ) => {
    updateNode({
      id: node.id,
      nodeType: 'if-else',
      data: {
        dynamicSourceHandles: node.data.dynamicSourceHandles.map(handle =>
          handle.id === handleId ? { ...handle, ...updates } : handle
        ),
      },
    })
  }

  const removeSourceHandle = (handleId: string) => {
    updateNode({
      id: node.id,
      nodeType: 'if-else',
      data: {
        dynamicSourceHandles: node.data.dynamicSourceHandles.filter(
          handle => handle.id !== handleId
        ),
      },
    })
    updateNodeInternals(node.id)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-gray-600 text-xs">
          This node routes execution based on a condition. The "If" output
          executes when the condition is true, and the "Else" output
          executes when the condition is false.
        </p>
      </div>

      <div>
        <h4 className="mb-3 font-medium text-sm">Conditions</h4>
        <Separator className="my-2" />
        <div className="space-y-4">
          {node.data.dynamicSourceHandles.map((handle, index) => (
            <div className="space-y-3" key={handle.id}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  Condition {index + 1}
                </span>
                {node.data.dynamicSourceHandles.length > 1 && (
                  <Button
                    onClick={() => removeSourceHandle(handle.id)}
                    size="icon-sm"
                    variant="destructive"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label
                    className="mb-1 block text-gray-600 text-xs"
                    htmlFor={`label-${handle.id}`}
                  >
                    Label
                  </label>
                  <Input
                    className="h-8 text-sm"
                    id={`label-${handle.id}`}
                    onChange={e =>
                      updateSourceHandle(handle.id, {
                        label: e.target.value || null,
                      })
                    }
                    placeholder="Enter label (optional)"
                    value={handle.label || ''}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-gray-600 text-xs"
                    htmlFor={`condition-${handle.id}`}
                  >
                    Condition
                  </label>
                  <ConditionEditor
                    availableVariables={availableVariables}
                    onChange={value =>
                      updateSourceHandle(handle.id, {
                        condition: value,
                      })
                    }
                    placeholder="Enter condition expression"
                    value={handle.condition}
                  />
                </div>
              </div>
              {index < node.data.dynamicSourceHandles.length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <Button className="w-full" onClick={addSourceHandle} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Condition
        </Button>
      </div>
    </div>
  )
}
