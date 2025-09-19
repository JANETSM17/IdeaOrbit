export interface NodeData {
  id: string
  label: string
  type: 'default' | 'input'
  position: { x: number; y: number }
  style?: {
    backgroundColor?: string
    borderColor?: string
    color?: string
    fontSize?: number
    fontWeight?: 'normal' | 'bold'
    fontStyle?: 'normal' | 'italic'
    textDecoration?: 'none' | 'underline'
  }
}

export interface EdgeData {
  id: string
  source: string
  target: string
  style?: {
    stroke?: string
    strokeWidth?: number
  }
}

export interface MindMapData {
  nodes: NodeData[]
  edges: EdgeData[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
}

export interface MindMap {
  id: string
  title: string
  description?: string
  data: MindMapData
  userId: string
  createdAt: Date
  updatedAt: Date
}
