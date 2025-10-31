import { Panel } from '@xyflow/react'
import { AgentNodePanel } from '@/components/workflow/nodes/agent-node'
import { EndNodePanel } from '@/components/workflow/nodes/end-node'
import { IfElseNodePanel } from '@/components/workflow/nodes/if-else-node'
import { WaitNodePanel } from '@/components/workflow/nodes/wait-node'
import { StartNodePanel } from '@/components/workflow/nodes/start-node'
import type { WorkflowToolId } from '@/lib/tools'
import type { FlowNode } from '@/lib/workflow/types'
import { useWorkflow } from '@/hooks/workflow/use-workflow'

export function NodeEditorPanel({
  nodeId,
  toolDescriptions,
}: {
  nodeId: FlowNode['id']
  toolDescriptions: Record<WorkflowToolId, string>
}) {
  const node = useWorkflow(state => state.getNodeById(nodeId))
  if (!node) {
    return <NodeEditorPanelNotFound />
  }

  if (node.type === 'note') {
    return null
  }

  return (
    <Panel
      className="max-h-[calc(100vh-5rem)] w-96 overflow-y-auto rounded-lg border bg-card p-4 shadow-md"
      position="top-right"
    >
      <h3 className="mb-3 font-semibold text-sm capitalize">
        {node.type} Node
      </h3>
      <NodeEditorContent node={node} toolDescriptions={toolDescriptions} />
    </Panel>
  )
}

function NodeEditorContent({
  node,
  toolDescriptions,
}: {
  node: FlowNode
  toolDescriptions: Record<WorkflowToolId, string>
}) {
  switch (node.type) {
    case 'agent':
      return (
        <AgentNodePanel node={node} toolDescriptions={toolDescriptions} />
      )
    case 'wait':
      return <WaitNodePanel node={node} />
    case 'end':
      return <EndNodePanel node={node} />
    case 'if-else':
      return <IfElseNodePanel node={node} />
    case 'start':
      return <StartNodePanel node={node} />
  }
}

function NodeEditorPanelNotFound() {
  return (
    <Panel
      className="max-h-[calc(100vh-4rem)] w-96 overflow-y-auto rounded-lg border bg-card p-4 shadow-md"
      position="top-right"
    >
      <div>Node not found</div>
    </Panel>
  )
}
