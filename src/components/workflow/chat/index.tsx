'use client'

import type { useChat } from '@ai-sdk/react'
import { Copy, MessagesSquare, RotateCcw, ThumbsUp } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  AppHeader,
  AppHeaderIcon,
  AppHeaderSeparator,
  AppHeaderTitle,
} from '@/components/workflow/app-header'
import {
  NodeExecutionStatus,
  NodeExecutionStatusBadge,
  NodeExecutionStatusContent,
  NodeExecutionStatusError,
  NodeExecutionStatusHeader,
  NodeExecutionStatusIcon,
  NodeExecutionStatusType,
} from '@/components/workflow/node-execution'
import type { WorkflowUIMessage } from '@/lib/workflow/messages'
import { useWorkflow } from '@/hooks/workflow/use-workflow'
import {
  ChatInput,
  ChatInputEditor,
  ChatInputGroupAddon,
  ChatInputSubmitButton,
  useChatInput,
} from '@/components/workflow/chat/chat-input'
import {
  ChatMessage,
  ChatMessageAction,
  ChatMessageActions,
  ChatMessageAuthor,
  ChatMessageAvatar,
  ChatMessageAvatarAssistantIcon,
  ChatMessageAvatarUserIcon,
  ChatMessageContainer,
  ChatMessageContent,
  ChatMessageHeader,
  ChatMessageMarkdown,
  ChatMessageTimestamp,
} from '@/components/workflow/chat/chat-message'
import {
  ChatMessageArea,
  ChatMessageAreaContent,
  ChatMessageAreaScrollButton,
} from '@/components/workflow/chat/chat-message-area'
import {
  ChatSuggestion,
  ChatSuggestions,
  ChatSuggestionsList,
  ChatSuggestionsTitle,
} from '@/components/workflow/chat/chat-suggestions'
import {
  ToolInvocation,
  ToolInvocationContentCollapsible,
  ToolInvocationHeader,
  ToolInvocationName,
  ToolInvocationRawData,
} from '@/components/workflow/chat/tool-invocation'
import { useTemplates } from '@/components/workflow/templates'

interface ChatHeaderProps {
  onReset?: () => void
}

function ChatHeader({ onReset }: ChatHeaderProps) {
  return (
    <AppHeader>
      <AppHeaderIcon className="hidden md:flex">
        <MessagesSquare />
      </AppHeaderIcon>
      <AppHeaderSeparator className="hidden md:block" />
      <AppHeaderTitle>Chat</AppHeaderTitle>
      {onReset && (
        <Button
          className="ml-auto"
          onClick={onReset}
          size="icon-sm"
          title="Reset chat messages"
          variant="outline"
        >
          <RotateCcw />
        </Button>
      )}
    </AppHeader>
  )
}

type ReturnOfUseChat = ReturnType<typeof useChat<WorkflowUIMessage>>

interface ChatProps extends ComponentPropsWithoutRef<'div'> {
  messages: WorkflowUIMessage[]
  sendMessage: ReturnOfUseChat['sendMessage']
  status: ReturnOfUseChat['status']
  stop: ReturnOfUseChat['stop']
  setMessages: ReturnOfUseChat['setMessages']
}

export function Chat({
  className,
  messages,
  sendMessage,
  status,
  stop,
  setMessages,
  ...props
}: ChatProps) {
  const getWorkflowData = useWorkflow(store => store.getWorkflowData)
  const resetNodeStatuses = useWorkflow(store => store.resetNodeStatuses)
  const validationState = useWorkflow(store => store.validationState)

  const isLoading = status === 'streaming' || status === 'submitted'
  const hasValidationErrors = !validationState.valid
  const isDisabled = hasValidationErrors

  const { value, onChange, handleSubmit } = useChatInput({
    onSubmit: parsedValue => {
      resetNodeStatuses()

      const workflowData = getWorkflowData()

      sendMessage(
        {
          role: 'user',
          parts: [{ type: 'text', text: parsedValue.content }],
        },
        {
          body: {
            nodes: workflowData.nodes,
            edges: workflowData.edges,
          },
        }
      )
    },
  })

  const handleSuggestionClick = (suggestion: string) => {
    resetNodeStatuses()

    const workflowData = getWorkflowData()

    sendMessage(
      {
        role: 'user',
        parts: [{ type: 'text', text: suggestion }],
      },
      {
        body: {
          nodes: workflowData.nodes,
          edges: workflowData.edges,
        },
      }
    )
  }

  const resetMessages = () => {
    setMessages([])
    resetNodeStatuses()
  }

  return (
    <div
      className="flex flex-1 flex-col overflow-y-auto bg-background"
      {...props}
    >
      <ChatHeader onReset={resetMessages} />
      <ChatMessageArea className="px-2">
        <ChatMessageAreaContent className="pt-4">
          {messages.length === 0 ? (
            <NoChatMessages onSuggestionClick={handleSuggestionClick} />
          ) : (
            messages.map(message => {
              const userName =
                message.role === 'user' ? 'You' : 'Assistant'
              return (
                <ChatMessage key={message.id}>
                  <ChatMessageActions>
                    <ChatMessageAction label="Copy">
                      <Copy className="size-4" />
                    </ChatMessageAction>
                    <ChatMessageAction label="Like">
                      <ThumbsUp className="size-4" />
                    </ChatMessageAction>
                  </ChatMessageActions>
                  <ChatMessageAvatar>
                    {message.role === 'user' ? (
                      <ChatMessageAvatarUserIcon />
                    ) : (
                      <ChatMessageAvatarAssistantIcon />
                    )}
                  </ChatMessageAvatar>

                  <ChatMessageContainer>
                    <ChatMessageHeader>
                      <ChatMessageAuthor>{userName}</ChatMessageAuthor>
                      <ChatMessageTimestamp createdAt={new Date()} />
                    </ChatMessageHeader>

                    <ChatMessageContent className="gap-3">
                      {message.parts.map((part, index) => {
                        switch (part.type) {
                          case 'text': {
                            return (
                              <ChatMessageMarkdown
                                content={part.text}
                                key={`text-${message.id}-${index}`}
                              />
                            )
                          }

                          case 'data-node-execution-status': {
                            return (
                              <NodeExecutionStatus
                                key={`status-${message.id}-${index}`}
                              >
                                <NodeExecutionStatusHeader>
                                  <NodeExecutionStatusIcon
                                    status={part.data.status}
                                  />
                                  <NodeExecutionStatusContent>
                                    <NodeExecutionStatusType
                                      nodeType={part.data.nodeType}
                                    />
                                    <NodeExecutionStatusBadge
                                      status={part.data.status}
                                    />
                                  </NodeExecutionStatusContent>
                                </NodeExecutionStatusHeader>
                                {part.data.error && (
                                  <NodeExecutionStatusError>
                                    {part.data.error}
                                  </NodeExecutionStatusError>
                                )}
                              </NodeExecutionStatus>
                            )
                          }
                        }

                        if (
                          (part.type.startsWith('tool-') ||
                            part.type === 'dynamic-tool') &&
                          'toolCallId' in part
                        ) {
                          let input: unknown | undefined
                          let output: unknown | undefined
                          let error: string | undefined

                          if (part.state === 'output-error') {
                            error = part.errorText
                            output = part.output
                          }

                          if (
                            part.state === 'input-streaming' ||
                            part.state === 'output-error'
                          ) {
                            if (
                              'rawInput' in part &&
                              part.rawInput != null
                            ) {
                              input = part.rawInput
                            } else if (
                              'input' in part &&
                              part.input != null
                            ) {
                              input = part.input
                            }
                          }

                          if (part.state === 'input-available') {
                            input = part.input
                          }

                          if (part.state === 'output-available') {
                            input = part.input
                            output = part.output
                          }

                          const toolName =
                            'toolName' in part
                              ? part.toolName
                              : part.type.slice(5)

                          return (
                            <ToolInvocation
                              className="w-full"
                              key={part.toolCallId}
                            >
                              <ToolInvocationHeader>
                                <ToolInvocationName
                                  isError={!!error}
                                  name={`Used ${toolName}`}
                                  type={part.state}
                                />
                              </ToolInvocationHeader>
                              {(input !== undefined ||
                                output !== undefined) && (
                                <ToolInvocationContentCollapsible>
                                  {input !== undefined && (
                                    <ToolInvocationRawData
                                      data={input}
                                      title="Arguments"
                                    />
                                  )}
                                  {output !== undefined && (
                                    <ToolInvocationRawData
                                      data={output}
                                      title="Result"
                                    />
                                  )}
                                </ToolInvocationContentCollapsible>
                              )}
                            </ToolInvocation>
                          )
                        }
                        return null
                      })}
                    </ChatMessageContent>
                  </ChatMessageContainer>
                </ChatMessage>
              )
            })
          )}
        </ChatMessageAreaContent>
        <ChatMessageAreaScrollButton alignment="center" />
      </ChatMessageArea>
      <div className="mx-auto w-full max-w-2xl px-4 py-4">
        {hasValidationErrors && (
          <div className="mb-2 rounded border border-destructive bg-red-50 p-2 text-destructive text-xs">
            Fix validation errors before running the workflow
          </div>
        )}
        <ChatInput
          disabled={isDisabled}
          isStreaming={isLoading}
          onStop={stop}
          onSubmit={handleSubmit}
        >
          <ChatInputEditor
            disabled={isDisabled}
            onChange={onChange}
            placeholder={
              hasValidationErrors
                ? 'Fix validation errors first...'
                : 'Type a message...'
            }
            value={value}
          />
          <ChatInputGroupAddon align="block-end">
            <ChatInputSubmitButton
              className="ml-auto"
              disabled={isDisabled}
            />
          </ChatInputGroupAddon>
        </ChatInput>
      </div>
    </div>
  )
}

function NoChatMessages({
  onSuggestionClick,
}: {
  onSuggestionClick: (suggestion: string) => void
}) {
  const { selectedTemplate: template } = useTemplates()

  if (!template || template.suggestions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-2">
        <p className="text-lg text-muted-foreground">No messages</p>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col items-center justify-end gap-2 p-2">
      <ChatSuggestions>
        <ChatSuggestionsTitle>Try these prompts:</ChatSuggestionsTitle>
        <ChatSuggestionsList>
          {template.suggestions.map(suggestion => (
            <ChatSuggestion
              key={suggestion}
              onSuggestionClick={onSuggestionClick}
            >
              {suggestion}
            </ChatSuggestion>
          ))}
        </ChatSuggestionsList>
      </ChatSuggestions>
    </div>
  )
}
