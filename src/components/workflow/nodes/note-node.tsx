import type { Node, NodeProps } from '@xyflow/react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ResizableNode } from '@/components/workflow/primitives/resizable-node'
import { useWorkflow } from '@/hooks/workflow/use-workflow'

export type NoteNodeData = {
  content: string
}

export type NoteNode = Node<NoteNodeData, 'note'>

export interface NoteNodeProps extends NodeProps<NoteNode> {}

export function NoteNode({ id, selected, data }: NoteNodeProps) {
  const updateNode = useWorkflow(store => store.updateNode)

  const handleContentChange = (content: string) => {
    updateNode({
      id,
      nodeType: 'note',
      data: { content },
    })
  }

  return (
    <ResizableNode className="p-4" selected={selected}>
      <Textarea
        className={cn(
          'h-full w-full resize-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent',
          'text-sm placeholder:text-muted-foreground/50',
          'nodrag nopan nowheel cursor-auto'
        )}
        onChange={e => handleContentChange(e.target.value)}
        placeholder="Enter your note here..."
        value={data.content}
      />
    </ResizableNode>
  )
}
