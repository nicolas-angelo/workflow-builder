'use client'

import dynamic from 'next/dynamic'
import { Save } from 'lucide-react'
import {
  AppHeader,
  AppHeaderSeparator,
} from '@/components/workflow/app-header'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { TemplateSelector } from '@/components/workflow/templates'
import { ThemeToggle } from '@/components/theme-toggle'
import { ValidationStatus } from '@/components/workflow/validation-status'
import { useWorkflow } from '@/hooks/workflow/use-workflow'

const UserButton = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.UserButton),
  {
    ssr: false,
  }
)

function SaveWorkflowButton() {
  const nodes = useWorkflow(store => store.nodes)
  const edges = useWorkflow(store => store.edges)

  const saveWorkflow = () => {
    console.log({ nodes, edges })
  }
  return (
    <Button onClick={saveWorkflow} size="icon" variant="ghost">
      <Save />
    </Button>
  )
}

export function WorkflowHeader() {
  return (
    <AppHeader>
      <Avatar className="border-2 border-border p-1">
        <AvatarImage className="block dark:hidden" src="/mark-light.png" />
        <AvatarImage className="hidden dark:block" src="/mark-dark.png" />
      </Avatar>
      <AppHeaderSeparator />
      <TemplateSelector className="hidden lg:flex" />
      <ValidationStatus />
      <div className="ml-auto flex items-center gap-2">
        <SaveWorkflowButton />
        <ThemeToggle />
        <SidebarTrigger />
        <AppHeaderSeparator />
        <UserButton />
      </div>
    </AppHeader>
  )
}
