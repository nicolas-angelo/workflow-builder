import type { FlowEdge, FlowNode } from '@/lib/workflow/types'
import { CODE_ANALYSIS_WORKFLOW } from './code-analysis-workflow'

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

const position = { x: 0, y: 0 }

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'A blank workflow',
    category: 'Personal',
    nodes: [
      {
        id: 'start-node',
        type: 'start',
        position,
        data: {
          sourceType: {
            type: 'text',
          },
        },
        measured: {
          width: 163,
          height: 58,
        },
        selected: false,
        dragging: false,
      },
      {
        id: 'end-node',
        type: 'end',
        position,
        data: {},
        measured: {
          width: 181,
          height: 58,
        },
        selected: false,
        dragging: false,
      },
    ],
    edges: [
      {
        id: 'start-to-end',
        source: 'start-node',
        target: 'end-node',
        sourceHandle: 'message',
        targetHandle: 'input',
        type: 'status',
        data: {},
      },
    ],
    suggestions: [],
  },
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
]

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find(template => template.id === id)
}
