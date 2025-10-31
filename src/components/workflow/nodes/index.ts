import type { NodeTypes } from '@xyflow/react'
import { AgentNode } from './agent-node'
import { EndNode } from './end-node'
import { IfElseNode } from './if-else-node'
import { NoteNode } from './note-node'
import { StartNode } from './start-node'
import { WaitNode } from './wait-node'

export * from './agent-node'
export * from './end-node'
export * from './if-else-node'
export * from './note-node'
export * from './start-node'
export * from './wait-node'

const nodeTypes: NodeTypes = {
  start: StartNode,
  agent: AgentNode,
  end: EndNode,
  'if-else': IfElseNode,
  wait: WaitNode,
  note: NoteNode,
}

export default nodeTypes
