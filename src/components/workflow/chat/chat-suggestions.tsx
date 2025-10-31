'use client'

import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function ChatSuggestions({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 px-2 py-2', className)}
      {...props}
    />
  )
}

function ChatSuggestionsTitle({
  className,
  ...props
}: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'font-medium text-muted-foreground text-xs',
        className
      )}
      {...props}
    />
  )
}

function ChatSuggestionsList({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} {...props} />
  )
}

interface ChatSuggestionProps extends ComponentProps<typeof Button> {
  onSuggestionClick?: (suggestion: string) => void
}

function ChatSuggestion({
  className,
  children,
  onSuggestionClick,
  onClick,
  ...props
}: ChatSuggestionProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onSuggestionClick && typeof children === 'string') {
      onSuggestionClick(children)
    }
    onClick?.(e)
  }

  return (
    <Button
      className={cn(
        'h-auto justify-start whitespace-normal px-3 py-2 text-left font-normal text-xs',
        'hover:bg-accent/50 hover:text-accent-foreground',
        'transition-colors',
        className
      )}
      onClick={handleClick}
      size="sm"
      variant="outline"
      {...props}
    >
      {children}
    </Button>
  )
}

export {
  ChatSuggestions,
  ChatSuggestionsTitle,
  ChatSuggestionsList,
  ChatSuggestion,
}
