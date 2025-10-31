import { type Node, type NodeProps, Position } from '@xyflow/react'
import { Bot, ChevronDown, Trash } from 'lucide-react'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { SchemaEditorDialog } from '@/components/editor/schema-editor'
import { SchemaPreview } from '@/components/editor/schema-preview'
import { ModelSelector } from '@/components/workflow/model-selector'
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
import { WORKFLOW_TOOLS, type WorkflowToolId } from '@/lib/tools'
import type {
  NodeOutput,
  NodeStatus,
  ValidationError,
} from '@/lib/workflow/types'
import { useWorkflow } from '@/hooks/workflow/use-workflow'
import { idToReadableText } from '@/lib/id-to-readable-text'
import type { workflowModelID } from '@/lib/workflow/models'

export type AgentNodeData = {
  name: string
  model: workflowModelID
  systemPrompt: string
  status: NodeStatus
  selectedTools: WorkflowToolId[]
  sourceType: NodeOutput
  hideResponseInChat: boolean
  excludeFromConversation: boolean
  maxSteps: number
  validationErrors?: ValidationError[]
}

export type AgentNode = Node<AgentNodeData, 'agent'>

export interface AgentNodeProps extends NodeProps<AgentNode> {}

export function AgentNode({
  selected,
  data,
  deletable,
  id,
}: AgentNodeProps) {
  const deleteNode = useWorkflow(state => state.deleteNode)
  const canConnectHandle = useWorkflow(store => store.canConnectHandle)

  const validationErrors =
    data.validationErrors?.map(error => ({
      message: error.message,
    })) || []

  const isSourceConnectable = canConnectHandle({
    nodeId: id,
    handleId: 'result',
    type: 'source',
  })
  const isTargetConnectable = canConnectHandle({
    nodeId: id,
    handleId: 'prompt',
    type: 'target',
  })

  return (
    <BaseNode
      className={cn('flex flex-col p-0', {
        'border-orange-500': data.status === 'processing',
        'border-red-500': data.status === 'error',
      })}
      selected={selected}
      style={{ width: 182 }}
    >
      <NodeHeader className="m-0">
        <NodeHeaderIcon>
          <Bot />
        </NodeHeaderIcon>
        <NodeHeaderTitle>Agent</NodeHeaderTitle>
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
      <div className="max-w-[200px] truncate p-2 pt-0 pl-4 text-left text-muted-foreground text-sm">
        {data.name}
      </div>

      <BaseHandle
        id="prompt"
        isConnectable={isTargetConnectable}
        position={Position.Top}
        type="target"
      />

      <BaseHandle
        id="result"
        isConnectable={isSourceConnectable}
        position={Position.Bottom}
        type="source"
      />
    </BaseNode>
  )
}

export function AgentNodePanel({
  node,
  toolDescriptions,
}: {
  node: AgentNode
  toolDescriptions: Record<WorkflowToolId, string>
}) {
  const updateNode = useWorkflow(state => state.updateNode)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 font-medium text-sm">Configuration</h4>
        <div className="space-y-3">
          <div>
            <label
              className="mb-1 block font-medium text-xs"
              htmlFor={`name-${node.id}`}
            >
              Name
            </label>
            <Input
              className="text-xs"
              id={`name-${node.id}`}
              onChange={e => {
                updateNode({
                  id: node.id,
                  nodeType: 'agent',
                  data: {
                    name: e.target.value,
                  },
                })
              }}
              placeholder="Enter agent name..."
              value={node.data.name}
            />
          </div>
          <div>
            <label
              className="mb-1 block font-medium text-xs"
              htmlFor={`model-${node.id}`}
            >
              Model
            </label>
            <ModelSelector
              onChange={model => {
                updateNode({
                  id: node.id,
                  nodeType: 'agent',
                  data: {
                    model,
                  },
                })
              }}
              value={node.data.model}
            />
          </div>
          <div>
            <div className="mb-2 block font-medium text-xs">Tools</div>
            <div className="space-y-2 rounded-md border border-input bg-background p-3">
              {WORKFLOW_TOOLS.map(toolId => {
                const isSelected = node.data.selectedTools.includes(toolId)

                return (
                  <div className="flex items-start gap-2" key={toolId}>
                    <Checkbox
                      checked={isSelected}
                      id={`tool-${toolId}-${node.id}`}
                      onCheckedChange={checked => {
                        const newSelectedTools = checked
                          ? [...node.data.selectedTools, toolId]
                          : node.data.selectedTools.filter(
                              t => t !== toolId
                            )

                        updateNode({
                          id: node.id,
                          nodeType: 'agent',
                          data: {
                            selectedTools: newSelectedTools,
                          },
                        })
                      }}
                    />
                    <label
                      className="flex cursor-pointer flex-col gap-0.5"
                      htmlFor={`tool-${toolId}-${node.id}`}
                    >
                      <span className="font-medium text-xs leading-none">
                        {idToReadableText(toolId)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {toolDescriptions[toolId]}
                      </span>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <label
              className="mb-1 block font-medium text-xs"
              htmlFor={`outputType-${node.id}`}
            >
              Output Type
            </label>
            <Select
              onValueChange={(value: 'text' | 'structured') => {
                updateNode({
                  id: node.id,
                  nodeType: 'agent',
                  data: {
                    sourceType:
                      value === 'text'
                        ? { type: 'text' }
                        : {
                            type: 'structured',
                            schema: null,
                          },
                  },
                })
              }}
              value={node.data.sourceType.type}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select output type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="structured">Structured</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {node.data.sourceType.type === 'structured' && (
            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="font-medium text-xs">JSON Schema</div>
              </div>
              <SchemaEditorDialog
                onSave={schema => {
                  updateNode({
                    id: node.id,
                    nodeType: 'agent',
                    data: {
                      sourceType: {
                        type: 'structured',
                        schema,
                      },
                    },
                  })
                }}
                schema={node.data.sourceType.schema}
              />
              {node.data.sourceType.schema && (
                <div className="mt-2">
                  <SchemaPreview schema={node.data.sourceType.schema} />
                </div>
              )}
            </div>
          )}
          <div>
            <label
              className="mb-1 block font-medium text-xs"
              htmlFor={`prompt-${node.id}`}
            >
              System Prompt
            </label>
            <Textarea
              className="nodrag min-h-[80px] resize-none text-xs"
              id={`prompt-${node.id}`}
              onChange={e => {
                updateNode({
                  id: node.id,
                  nodeType: 'agent',
                  data: {
                    systemPrompt: e.target.value,
                  },
                })
              }}
              placeholder="Enter system prompt..."
              value={node.data.systemPrompt}
            />
          </div>
        </div>
      </div>

      <div>
        <Collapsible onOpenChange={setAdvancedOpen} open={advancedOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/50">
            <h4 className="font-medium text-sm">Advanced</h4>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                advancedOpen ? 'rotate-180' : ''
              }`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-3">
            <div className="flex items-center justify-between">
              <label
                className="font-medium text-xs"
                htmlFor={`hideResponse-${node.id}`}
              >
                Hide response in chat
              </label>
              <Switch
                checked={node.data.hideResponseInChat ?? false}
                id={`hideResponse-${node.id}`}
                onCheckedChange={checked => {
                  updateNode({
                    id: node.id,
                    nodeType: 'agent',
                    data: {
                      hideResponseInChat: checked,
                    },
                  })
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <label
                className="font-medium text-xs"
                htmlFor={`excludeConversation-${node.id}`}
              >
                Exclude from conversation history
              </label>
              <Switch
                checked={node.data.excludeFromConversation ?? false}
                id={`excludeConversation-${node.id}`}
                onCheckedChange={checked => {
                  updateNode({
                    id: node.id,
                    nodeType: 'agent',
                    data: {
                      excludeFromConversation: checked,
                    },
                  })
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <label
                className="font-medium text-xs"
                htmlFor={`maxSteps-${node.id}`}
              >
                Max steps
              </label>
              <Input
                className="h-8 w-16 text-xs"
                id={`maxSteps-${node.id}`}
                max="50"
                min="1"
                onChange={e => {
                  const value = Number.parseInt(e.target.value, 10)
                  if (!Number.isNaN(value) && value >= 1 && value <= 50) {
                    updateNode({
                      id: node.id,
                      nodeType: 'agent',
                      data: {
                        maxSteps: value,
                      },
                    })
                  }
                }}
                type="number"
                value={node.data.maxSteps ?? 5}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
