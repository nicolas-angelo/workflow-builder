'use client'

import {
  useState,
  useMemo,
  useEffect,
  useContext,
  createContext,
} from 'react'
import { useReactFlow } from '@xyflow/react'
import { useChatActions } from '@ai-sdk-tools/store'
import { LayoutTemplate } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { WorkflowTemplate } from '@/lib/templates'
import { getTemplateById } from '@/lib/templates'
import { getLayoutedElements } from '@/hooks/workflow/use-dagre'
import { useWorkflow } from '@/hooks/workflow/use-workflow'

interface TemplateContextType {
  selectedTemplate: WorkflowTemplate
  setSelectedTemplate: (templateId: string) => void
  templates: WorkflowTemplate[]
}

const TemplateContext = createContext<TemplateContextType>({
  selectedTemplate: {
    id: '',
    name: '',
    description: '',
    category: '',
    nodes: [],
    edges: [],
    suggestions: [],
  },
  setSelectedTemplate: () => {},
  templates: [],
})

export function useTemplates() {
  return useContext(TemplateContext)
}

interface TemplatesProviderProps {
  templates: WorkflowTemplate[]
  children: React.ReactNode
}

export function TemplatesProvider({
  templates = [],
  children,
}: TemplatesProviderProps) {
  const initializeWorkflow = useWorkflow(store => store.initializeWorkflow)
  const { fitView } = useReactFlow()

  const [templateId, setTemplateId] = useState<string | undefined>(
    templates[0].id
  )

  const selectedTemplate = useMemo(
    () =>
      templates.find(template => template.id === templateId) ||
      templates[0],
    [templateId, templates]
  )

  const setSelectedTemplate = (templateId: string) => {
    setTemplateId(templateId)
  }

  useEffect(() => {
    const { nodes, edges } = getLayoutedElements(
      selectedTemplate.nodes,
      selectedTemplate.edges
    )
    initializeWorkflow({
      nodes,
      edges,
    })
  }, [selectedTemplate])

  useEffect(() => {
    fitView({ duration: 1000 })
  }, [selectedTemplate, fitView])

  return (
    <TemplateContext.Provider
      value={{ selectedTemplate, setSelectedTemplate, templates }}
    >
      {children}
    </TemplateContext.Provider>
  )
}

interface TemplateSelectorProps {
  className?: string
}

export function TemplateSelector({ className }: TemplateSelectorProps) {
  const initializeWorkflow = useWorkflow(store => store.initializeWorkflow)
  const { setMessages } = useChatActions()
  const { selectedTemplate, setSelectedTemplate, templates } =
    useTemplates()

  const categories = [...new Set(templates.map(t => t.category))]

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = getTemplateById(templateId)
    if (template) {
      const { nodes, edges } = getLayoutedElements(
        template.nodes,
        template.edges
      )
      initializeWorkflow({
        nodes,
        edges,
      })
      // Reset chat messages when switching templates
      setMessages([])
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select
        onValueChange={handleTemplateSelect}
        value={selectedTemplate.id}
      >
        <SelectTrigger className="h-9 w-[240px]">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 shrink-0" />
            <SelectValue>
              <span className="font-medium text-sm">
                {selectedTemplate?.name || 'Select Template'}
              </span>
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          {categories.map(category => (
            <div key={category}>
              <div className="px-2 py-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                {category}
              </div>
              {templates
                .filter(t => t.category === category)
                .map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {template.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              {category !== categories[categories.length - 1] && (
                <div className="my-1 border-b" />
              )}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
