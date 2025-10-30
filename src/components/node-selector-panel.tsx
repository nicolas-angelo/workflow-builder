'use client'

import { Bot, FileText, GitBranch, Square, Hourglass } from 'lucide-react'
import { Panel } from '@xyflow/react'
import { useAuth, SignedIn } from '@clerk/nextjs'
import { CheckoutButton } from '@clerk/nextjs/experimental'
import { Button } from '@/components/ui/button'

const PLAN_ID = 'cplan_34n8ii6YeGkBlQlyMDUdobp1F3I'
const PLAN_PERIOD = 'month'

const nodeTypes = [
  {
    type: 'agent',
    label: 'Agent',
    icon: Bot,
    premium: false,
  },
  {
    type: 'if-else',
    label: 'If/Else',
    icon: GitBranch,
    premium: false,
  },
  {
    type: 'wait',
    label: 'Wait',
    icon: Hourglass,
    premium: true,
  },
  {
    type: 'note',
    label: 'Note',
    icon: FileText,
    premium: false,
  },
  {
    type: 'end',
    label: 'End',
    icon: Square,
    premium: false,
  },
]

export function NodeSelectorPanel() {
  const { has } = useAuth()
  const hasPremium = has?.({ feature: 'user:premium_templates' }) ?? false

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Panel
      className="w-64 rounded-lg border bg-card p-4 shadow-md"
      position="top-left"
    >
      <div className="flex flex-col gap-2">
        <h3 className="mb-2 font-semibold text-sm">Add Nodes</h3>

        <SignedIn>
          <div className="flex flex-col gap-2">
            {nodeTypes.map(nodeType =>
              nodeType.premium && !hasPremium ? (
                <CheckoutButton
                  checkoutProps={{
                    portalId: 'clerk-portal',
                    // portalRoot: document?.body ?? undefined,
                    onClose: () => {
                      console.log('Checkout closed')
                    },
                  }}
                  for="user"
                  key={nodeType.type}
                  planId={PLAN_ID}
                  planPeriod={PLAN_PERIOD}
                >
                  <Button
                    className="cursor-grab justify-between text-left"
                    variant="outline"
                  >
                    <span className="flex items-center gap-2">
                      <nodeType.icon />
                      {nodeType.label}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Premium
                    </span>
                  </Button>
                </CheckoutButton>
              ) : (
                <Button
                  className="cursor-grab justify-between text-left"
                  draggable={true}
                  key={nodeType.type}
                  onDragStart={e => onDragStart(e, nodeType.type)}
                  variant="outline"
                >
                  <span className="flex items-center gap-2">
                    <nodeType.icon />
                    {nodeType.label}
                  </span>
                </Button>
              )
            )}
          </div>
        </SignedIn>
      </div>
    </Panel>
  )
}
