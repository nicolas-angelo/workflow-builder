import { ChevronRight, SparklesIcon, UserIcon } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { MarkdownContent } from '@/components/workflow/chat/markdown-content'

function ChatMessage({ className, ...props }: ComponentProps<'div'>) {
  return (
    <TooltipProvider>
      <div
        className={cn(
          'group/chat-message relative flex w-full gap-2.5 rounded-md px-3 py-2 hover:bg-muted/50',
          className
        )}
        {...props}
      />
    </TooltipProvider>
  )
}

function ChatMessageContainer({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex w-full flex-col items-start gap-1', className)}
      {...props}
    />
  )
}

function ChatMessageHeader({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center gap-2 px-2 text-sm', className)}
      {...props}
    />
  )
}

function ChatMessageAuthor({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn('font-medium text-foreground', className)}
      {...props}
    />
  )
}

interface ChatMessageTimestampProps extends ComponentProps<'span'> {
  createdAt: number | Date | string
  format?: Intl.DateTimeFormatOptions
}

function ChatMessageTimestamp({
  className,
  createdAt,
  format = { hour: 'numeric', minute: 'numeric' },
  ...props
}: ChatMessageTimestampProps) {
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'cursor-default text-muted-foreground text-xs',
            className
          )}
          {...props}
        >
          {date.toLocaleTimeString('en-US', format)}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{date.toLocaleString()}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function ChatMessageContent({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex w-full flex-col gap-2 p-2', className)}
      {...props}
    />
  )
}

interface ChatMessageMarkdownProps {
  content: string
  className?: string
}

function ChatMessageMarkdown({
  content,
  className,
}: ChatMessageMarkdownProps) {
  return <MarkdownContent className={className} content={content || ''} />
}

function ChatMessageFooter({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mt-1 flex items-center gap-2 px-2 text-muted-foreground text-xs',
        className
      )}
      {...props}
    />
  )
}

function ChatMessageActions({
  className,
  children,
  ...props
}: ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        '-top-5 absolute right-5 z-20 flex flex-row gap-1 p-1 opacity-0 transition-opacity group-hover/chat-message:opacity-100',
        className
      )}
      {...props}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </Card>
  )
}

interface ChatMessageActionProps {
  className?: string
  children?: ReactNode
  label: string
}

function ChatMessageAction({
  className,
  children,
  label,
  ...props
}: ChatMessageActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn('h-7 w-7', className)}
          size="icon"
          variant="ghost"
          {...props}
        >
          {children}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function ChatMessageAvatar(props: ComponentProps<typeof Avatar>) {
  return (
    <Avatar
      className="[&:has(svg)]:items-center [&:has(svg)]:justify-center [&:has(svg)]:border [&:has(svg)]:border-border [&_svg]:size-4"
      {...props}
    />
  )
}

function ChatMessageAvatarFallback(
  props: ComponentProps<typeof AvatarFallback>
) {
  return <AvatarFallback {...props} />
}

function ChatMessageAvatarImage(
  props: ComponentProps<typeof AvatarImage>
) {
  return <AvatarImage {...props} />
}

function ChatMessageAvatarUserIcon(
  props: ComponentProps<typeof UserIcon>
) {
  return <UserIcon {...props} />
}

function ChatMessageAvatarAssistantIcon(
  props: ComponentProps<typeof SparklesIcon>
) {
  return <SparklesIcon {...props} />
}

function ChatMessageThread({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        'group/button flex h-auto w-full items-center justify-start gap-2 border border-none px-2 py-1.5 transition-all',
        'hover:border-input hover:bg-background hover:shadow-sm',
        className
      )}
      variant="ghost"
      {...props}
    />
  )
}

function ChatMessageThreadReplyCount(props: ComponentProps<'span'>) {
  return <span className="font-medium text-sm" {...props} />
}

interface ChatMessageThreadTimestampProps extends ComponentProps<'span'> {
  date: Date | number | string
}
function ChatMessageThreadTimestamp({
  date: dateProp,
  ...props
}: ChatMessageThreadTimestampProps) {
  const date = new Date(dateProp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <span
      className="block text-muted-foreground text-sm group-hover/button:hidden"
      {...props}
    >
      Last reply at {date}
    </span>
  )
}

function ChatMessageThreadAction(props: ComponentProps<'span'>) {
  return (
    <span
      className="hidden w-full items-center gap-1 text-muted-foreground text-sm group-hover/button:flex"
      {...props}
    >
      View thread
      <ChevronRight className="ml-auto h-4 w-4" />
    </span>
  )
}

export {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageAvatarImage,
  ChatMessageAvatarFallback,
  ChatMessageAvatarUserIcon,
  ChatMessageAvatarAssistantIcon,
  ChatMessageContainer,
  ChatMessageHeader,
  ChatMessageAuthor,
  ChatMessageTimestamp,
  ChatMessageContent,
  ChatMessageMarkdown,
  ChatMessageFooter,
  ChatMessageActions,
  ChatMessageAction,
  ChatMessageThread,
  ChatMessageThreadReplyCount,
  ChatMessageThreadTimestamp,
  ChatMessageThreadAction,
}
