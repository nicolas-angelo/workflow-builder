import type { FlowEdge, FlowNode } from '@/lib/workflow/types'

const position = { x: 0, y: 0 }

export const CODE_ANALYSIS_WORKFLOW: {
  nodes: FlowNode[]
  edges: FlowEdge[]
} = {
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
      id: 'code-analyzer-node',
      type: 'agent',
      position,
      data: {
        name: 'Code Analyzer',
        status: 'idle',
        hideResponseInChat: false,
        excludeFromConversation: true,
        maxSteps: 5,
        model: 'gpt-5-nano',
        systemPrompt:
          'You are a code analysis expert. Analyze the provided code snippet and determine its programming language and key characteristics.\n\nReturn a structured analysis with:\n- language: The primary programming language (e.g., "typescript", "python", "javascript", "java", "csharp", "cpp", "go", "rust", "php", "ruby", "swift", "kotlin")\n- framework: Any specific framework or library used (if detectable)\n- complexity: "simple", "medium", or "complex"\n- has_errors: boolean indicating if there are obvious syntax/logic errors\n\nFocus on accurate language detection and provide concise, structured output.',
        selectedTools: [],
        sourceType: {
          type: 'structured',
          schema: {
            type: 'object',
            properties: {
              language: {
                type: 'string',
                description: 'The programming language of the code',
                enum: [
                  'typescript',
                  'javascript',
                  'python',
                  'java',
                  'csharp',
                  'cpp',
                  'go',
                  'rust',
                  'php',
                  'ruby',
                  'swift',
                  'kotlin',
                  'other',
                ],
              },
              framework: {
                type: 'string',
                description: 'Framework or library used (if any)',
              },
              complexity: {
                type: 'string',
                description: 'Code complexity level',
                enum: ['simple', 'medium', 'complex'],
              },
              has_errors: {
                type: 'boolean',
                description: 'Whether the code has obvious errors',
              },
            },
            required: ['language', 'complexity', 'has_errors'],
          },
        },
      },
      measured: {
        width: 182,
        height: 74,
      },
      selected: false,
      dragging: false,
    },
    {
      id: 'language-router-node',
      type: 'if-else',
      position,
      data: {
        status: 'idle',
        dynamicSourceHandles: [
          {
            id: 'typescript-route',
            label: 'TypeScript',
            condition: "input.language == 'typescript'",
          },
          {
            id: 'python-route',
            label: 'Python',
            condition: "input.language == 'python'",
          },
          {
            id: 'javascript-route',
            label: 'JavaScript',
            condition: "input.language == 'javascript'",
          },
          {
            id: 'java-route',
            label: 'Java',
            condition: "input.language == 'java'",
          },
        ],
      },
      measured: {
        width: 189,
        height: 199,
      },
      selected: false,
      dragging: false,
    },
    {
      id: 'typescript-specialist-node',
      type: 'agent',
      position,
      data: {
        name: 'TypeScript Specialist',
        model: 'gpt-5-nano',
        systemPrompt:
          'You are a TypeScript expert. Analyze the provided TypeScript code and provide detailed feedback including:\n\n1. Code quality assessment\n2. Type safety evaluation\n3. Performance considerations\n4. Best practices compliance\n5. Suggested improvements\n\nBe thorough but concise in your analysis. Focus on TypeScript-specific patterns, type annotations, and modern TypeScript features.\n\nBe concise in your output or response.',
        selectedTools: [],
        sourceType: {
          type: 'text',
        },
        status: 'idle',
        hideResponseInChat: false,
        excludeFromConversation: false,
        maxSteps: 5,
      },
      measured: {
        width: 182,
        height: 74,
      },
      selected: false,
      dragging: false,
    },
    {
      id: 'python-specialist-node',
      type: 'agent',
      position,
      data: {
        name: 'Python Specialist',
        model: 'gpt-5-nano',
        systemPrompt:
          'You are a Python expert. Analyze the provided Python code and provide detailed feedback including:\n\n1. Code quality assessment (PEP 8 compliance, readability)\n2. Performance considerations\n3. Pythonic patterns and best practices\n4. Error handling and edge cases\n5. Suggested improvements\n\nFocus on Python-specific idioms, efficient data structures, and modern Python features.\n\nBe concise in your output or response.',
        selectedTools: [],
        sourceType: {
          type: 'text',
        },
        status: 'idle',
        hideResponseInChat: false,
        excludeFromConversation: false,
        maxSteps: 5,
      },
      measured: {
        width: 182,
        height: 74,
      },
      selected: false,
      dragging: false,
    },
    {
      id: 'javascript-specialist-node',
      type: 'agent',
      position,
      data: {
        name: 'JavaScript Specialist',
        model: 'gpt-5-nano',
        systemPrompt:
          'You are a JavaScript expert. Analyze the provided JavaScript code and provide detailed feedback including:\n\n1. Code quality assessment\n2. ES6+ features usage\n3. Performance considerations\n4. Browser compatibility\n5. Security considerations\n6. Suggested improvements\n\nFocus on modern JavaScript patterns, asynchronous programming, and best practices.\n\nBe concise in your output or response.',
        selectedTools: [],
        sourceType: {
          type: 'text',
        },
        status: 'idle',
        hideResponseInChat: false,
        excludeFromConversation: false,
        maxSteps: 5,
      },
      measured: {
        width: 182,
        height: 74,
      },
      selected: false,
      dragging: false,
    },
    {
      id: 'java-specialist-node',
      type: 'agent',
      position,
      data: {
        name: 'Java Specialist',
        model: 'gpt-5-nano',
        systemPrompt:
          'You are a Java expert. Analyze the provided Java code and provide detailed feedback including:\n\n1. Code quality assessment\n2. Object-oriented design patterns\n3. Performance considerations\n4. Memory management\n5. Exception handling\n6. Suggested improvements\n\nFocus on Java-specific patterns, JVM considerations, and enterprise Java best practices.\n\nBe concise in your output or response.',
        selectedTools: [],
        sourceType: {
          type: 'text',
        },
        status: 'idle',
        hideResponseInChat: false,
        excludeFromConversation: false,
        maxSteps: 5,
      },
      measured: {
        width: 182,
        height: 74,
      },
      selected: false,
      dragging: false,
    },
    {
      id: 'general-specialist-node',
      type: 'agent',
      position,
      data: {
        name: 'General Code Specialist',
        model: 'gpt-5-nano',
        systemPrompt:
          'You are a general programming expert. Analyze the provided code and provide feedback on:\n\n1. Overall code quality and structure\n2. Algorithm efficiency\n3. Error handling\n4. Documentation and readability\n5. General best practices\n6. Suggested improvements\n\nProvide comprehensive analysis regardless of the programming language.\n\nBe concise in your output or response.',
        selectedTools: [],
        sourceType: {
          type: 'text',
        },
        status: 'idle',
        hideResponseInChat: false,
        excludeFromConversation: false,
        maxSteps: 5,
      },
      measured: {
        width: 200,
        height: 74,
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
    // {
    // 	id: "workflow-description-note",
    // 	type: "note",
    // 	position: {
    // 		x: 71.25415144237013,
    // 		y: 163.5453637058922,
    // 	},
    // 	data: {
    // 		content:
    // 			"Code Analysis Workflow\n\nAnalyzes code → detects language → routes to specialized agents (TypeScript, Python, JavaScript, Java) → provides expert feedback.\n\nTry different code snippets to see intelligent routing in action!",
    // 	},
    // 	measured: {
    // 		width: 534,
    // 		height: 229,
    // 	},
    // 	selected: false,
    // 	dragging: false,
    // 	width: 534,
    // 	height: 229,
    // 	resizing: false,
    // },
  ],
  edges: [
    {
      id: 'start-to-analyzer',
      source: 'start-node',
      target: 'code-analyzer-node',
      sourceHandle: 'message',
      targetHandle: 'prompt',
      type: 'status',
      data: {},
    },
    {
      id: 'analyzer-to-router',
      source: 'code-analyzer-node',
      target: 'language-router-node',
      sourceHandle: 'result',
      targetHandle: 'input',
      type: 'status',
      data: {},
    },
    {
      id: 'router-to-typescript',
      source: 'language-router-node',
      target: 'typescript-specialist-node',
      sourceHandle: 'typescript-route',
      targetHandle: 'prompt',
      type: 'status',
      data: {},
    },
    {
      id: 'router-to-python',
      source: 'language-router-node',
      target: 'python-specialist-node',
      sourceHandle: 'python-route',
      targetHandle: 'prompt',
      type: 'status',
      data: {},
    },
    {
      id: 'router-to-javascript',
      source: 'language-router-node',
      target: 'javascript-specialist-node',
      sourceHandle: 'javascript-route',
      targetHandle: 'prompt',
      type: 'status',
      data: {},
    },
    {
      id: 'router-to-java',
      source: 'language-router-node',
      target: 'java-specialist-node',
      sourceHandle: 'java-route',
      targetHandle: 'prompt',
      type: 'status',
      data: {},
    },
    {
      id: 'router-to-general',
      source: 'language-router-node',
      target: 'general-specialist-node',
      sourceHandle: 'else',
      targetHandle: 'prompt',
      type: 'status',
      data: {},
    },
    {
      id: 'typescript-to-end',
      source: 'typescript-specialist-node',
      target: 'end-node',
      sourceHandle: 'result',
      targetHandle: 'input',
      type: 'status',
      data: {},
    },
    {
      id: 'python-to-end',
      source: 'python-specialist-node',
      target: 'end-node',
      sourceHandle: 'result',
      targetHandle: 'input',
      type: 'status',
      data: {},
    },
    {
      id: 'javascript-to-end',
      source: 'javascript-specialist-node',
      target: 'end-node',
      sourceHandle: 'result',
      targetHandle: 'input',
      type: 'status',
      data: {},
    },
    {
      id: 'java-to-end',
      source: 'java-specialist-node',
      target: 'end-node',
      sourceHandle: 'result',
      targetHandle: 'input',
      type: 'status',
      data: {},
    },
    {
      id: 'general-to-end',
      source: 'general-specialist-node',
      target: 'end-node',
      sourceHandle: 'result',
      targetHandle: 'input',
      type: 'status',
      data: {},
    },
  ],
}
