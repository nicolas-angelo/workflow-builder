import type { ComponentProps, ReactNode } from 'react'
import type { VariantProps } from 'class-variance-authority'
import {
  AlertCircle,
  CheckCircleIcon,
  CircleDashed,
  Play,
} from 'lucide-react'
import { Badge, type badgeVariants } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { idToReadableText } from '@/lib/id-to-readable-text'

// Wrapper component
export function NodeExecutionStatus({
  className,
  ...props
}: ComponentProps<'div'>) {
  return <div className={cn('max-w-full', className)} {...props} />
}

// Header component
export function NodeExecutionStatusHeader({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5',
        className
      )}
      {...props}
    />
  )
}

// Icon component with status-aware styling
export function NodeExecutionStatusIcon({
  status,
  className,
  ...props
}: ComponentProps<'svg'> & {
  status: 'idle' | 'running' | 'processing' | 'success' | 'error'
}) {
  switch (status) {
    case 'idle':
      return (
        <CircleDashed
          className={cn('size-3.5 text-muted-foreground', className)}
          {...props}
        />
      )
    case 'running':
    case 'processing':
      return (
        <Play
          className={cn('size-3.5 animate-pulse text-blue-500', className)}
          {...props}
        />
      )
    case 'success':
      return (
        <CheckCircleIcon
          className={cn('size-3.5 text-green-500', className)}
          {...props}
        />
      )
    case 'error':
      return (
        <AlertCircle
          className={cn('size-3.5 text-red-500', className)}
          {...props}
        />
      )
  }
}

// Content container
export function NodeExecutionStatusContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-1 items-center gap-2', className)}>
      {children}
    </div>
  )
}

// Name component
export function NodeExecutionStatusName({
  nodeId,
  capitalize = true,
  className,
}: {
  nodeId: string
  capitalize?: boolean
  className?: string
}) {
  return (
    <span className={cn('font-medium text-sm', className)}>
      {idToReadableText(nodeId, { capitalize })}
    </span>
  )
}

// Badge component with status-aware variants
export function NodeExecutionStatusBadge({
  status,
  className,
  ...props
}: ComponentProps<'div'> & {
  status: 'idle' | 'running' | 'processing' | 'success' | 'error'
}) {
  const getStatusBadgeVariant = (): VariantProps<
    typeof badgeVariants
  >['variant'] => {
    switch (status) {
      case 'idle':
        return 'outline'
      case 'running':
      case 'processing':
        return 'default'
      case 'success':
        return 'secondary'
      case 'error':
        return 'destructive'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Idle'
      case 'running':
        return 'Running'
      case 'processing':
        return 'Processing'
      case 'success':
        return 'Success'
      case 'error':
        return 'Error'
    }
  }

  return (
    <Badge
      className={cn('h-4 px-1.5 py-0 text-xs', className)}
      variant={getStatusBadgeVariant()}
      {...props}
    >
      {getStatusText()}
    </Badge>
  )
}

// Node type label
export function NodeExecutionStatusType({
  nodeType,
  capitalize = true,
  className,
  ...props
}: ComponentProps<'span'> & {
  nodeType: string
  capitalize?: boolean
}) {
  return (
    <span
      className={cn('text-muted-foreground text-xs', className)}
      {...props}
    >
      {idToReadableText(nodeType, { capitalize })} node
    </span>
  )
}

// Error display component
export function NodeExecutionStatusError({
  className,
  ...props
}: ComponentProps<'p'>) {
  return (
    <div
      className={cn(
        'mt-1 rounded-md bg-red-50 px-2 py-1 dark:bg-red-950/20',
        className
      )}
    >
      <p className="text-red-600 text-xs dark:text-red-400" {...props} />
    </div>
  )
}
