'use client'

import { ForwardRefExoticComponent, RefAttributes } from 'react'
import { LucideProps } from 'lucide-react'
import { CheckoutButton } from '@clerk/nextjs/experimental'
import { Button } from '@/components/ui/button'

type NodeType = {
  type: string
  label: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
}

interface NodeSelectorButtonProps {
  nodeType: NodeType
  planId: string
  planPeriod: 'month' | 'annual'
}

export function NodeSelectorCheckoutButton({
  nodeType,
  planId,
  planPeriod,
}: NodeSelectorButtonProps) {
  return (
    <CheckoutButton
      checkoutProps={{
        portalId: 'clerk-portal',
        portalRoot: document?.body ?? undefined,
        onClose: () => {
          console.log('Checkout closed')
        },
      }}
      for="user"
      key={nodeType.type}
      planId={planId}
      planPeriod={planPeriod}
    >
      <Button
        className="cursor-grab justify-between text-left"
        variant="outline"
      >
        <span className="flex items-center gap-2">
          <nodeType.icon />
          {nodeType.label}
        </span>
        <span className="text-muted-foreground text-xs">Premium</span>
      </Button>
    </CheckoutButton>
  )
}
