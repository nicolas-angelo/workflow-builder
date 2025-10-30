'use client'

import { PricingTable } from '@clerk/nextjs'

export default function PricingPage() {
  return (
    <div className="flex h-dvh flex-col bg-background py-12 sm:px-6 lg:px-8">
      <div className="flex h-full flex-col items-center justify-center sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl px-4">
          <PricingTable
            appearance={{
              elements: {
                pricingTableCard: 'border border-gray-200',
              },
            }}
            for="user"
          />
        </div>
      </div>
    </div>
  )
}
