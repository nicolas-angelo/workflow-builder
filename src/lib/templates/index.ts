import type { FlowEdge, FlowNode } from '@/lib/workflow/types'
import { CODE_ANALYSIS_WORKFLOW } from './code-analysis-workflow'
import { DEMO_WORKFLOW } from './demo-workflow'
import { WIKIPEDIA_RESEARCH_WORKFLOW } from './wikipedia-research-workflow'

export type WorkflowTemplate = {
  id: string
  name: string
  description: string
  category: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  suggestions: string[]
  premium?: boolean
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'code-analysis',
    name: 'Code Agent',
    description: 'Intelligent routing to language-specific code experts',
    category: 'Development',
    nodes: CODE_ANALYSIS_WORKFLOW.nodes,
    edges: CODE_ANALYSIS_WORKFLOW.edges,
    suggestions: [
      'Review this React component and suggest improvements',
      "Debug this Python function that's throwing an error",
      'Help me optimize this database query',
    ],
    premium: true,
  },
  // {
  //   id: 'wikipedia-research',
  //   name: 'Wikipedia Agent',
  //   description:
  //     'Comprehensive research workflow using Wikipedia search and summary tools',
  //   category: 'Research',
  //   nodes: WIKIPEDIA_RESEARCH_WORKFLOW.nodes,
  //   edges: WIKIPEDIA_RESEARCH_WORKFLOW.edges,
  //   suggestions: [
  //     'Research the history of artificial intelligence',
  //     'What are the key principles of quantum physics?',
  //     'Research the biography of Albert Einstein',
  //   ],
  // },
  {
    id: 'demo',
    name: 'Demo',
    description: 'A demo workflow',
    category: 'Private',
    nodes: DEMO_WORKFLOW.nodes,
    edges: DEMO_WORKFLOW.edges,
    suggestions: [],
  },
]

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find(template => template.id === id)
}

export const DEFAULT_TEMPLATE = WORKFLOW_TEMPLATES[0]
