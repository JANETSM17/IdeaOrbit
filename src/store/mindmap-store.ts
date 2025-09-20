import { create } from 'zustand'
import { Node, Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow'
import { MindMapData, NodeData, EdgeData } from '../types/mindmap'
import { generateId } from '../lib/utils'

interface MindMapState {
  // Current mind map data
  nodes: Node[]
  edges: Edge[]
  viewport: { x: number; y: number; zoom: number }
  
  // UI state
  selectedNodeId: string | null
  selectedEdgeId: string | null
  isEditing: boolean
  
  // Actions
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void
  
  // Node actions
  addNode: (position: { x: number; y: number }, label?: string) => void
  updateNode: (nodeId: string, updates: Partial<NodeData>) => void
  deleteNode: (nodeId: string) => void
  onNodesChange: (changes: NodeChange[]) => void
  
  // Edge actions
  addEdge: (source: string, target: string) => void
  deleteEdge: (edgeId: string) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  
  // Selection
  setSelectedNode: (nodeId: string | null) => void
  setSelectedEdge: (edgeId: string | null) => void
  
  // Editing
  setIsEditing: (editing: boolean) => void
  
  // Load/Save
  loadMindMap: (data: MindMapData) => void
  getMindMapData: () => MindMapData
  
  // History (for undo/redo)
  history: MindMapData[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  saveToHistory: () => void
}

export const useMindMapStore = create<MindMapState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeId: null,
  selectedEdgeId: null,
  isEditing: false,
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,

  // Setters
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setViewport: (viewport) => set({ viewport }),

  // Node actions
  addNode: (position, label = 'New Node') => {
    const id = generateId()
    const newNode: Node = {
      id,
      type: 'default',
      position,
      data: {
        id,
        label,
        type: 'default',
        position,
        style: {
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          color: '#000000',
          fontSize: 14,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none'
        }
      }
    }
    
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: id
    }))
    
    get().saveToHistory()
  },

  updateNode: (nodeId, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: { ...node.data, ...updates },
              position: updates.position || node.position
            }
          : node
      )
    }))
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
    }))
    
    get().saveToHistory()
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes)
    }))
  },

  // Edge actions
  addEdge: (source, target) => {
    const id = generateId()
    const newEdge: Edge = {
      id,
      source,
      target,
      type: 'default',
      data: {
        id,
        source,
        target,
        style: {
          stroke: '#000000',
          strokeWidth: 2
        }
      }
    }
    
    set((state) => ({
      edges: [...state.edges, newEdge]
    }))
    
    get().saveToHistory()
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId
    }))
    
    get().saveToHistory()
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges)
    }))
  },

  // Selection
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId, selectedEdgeId: null }),
  setSelectedEdge: (edgeId) => set({ selectedEdgeId: edgeId, selectedNodeId: null }),

  // Editing
  setIsEditing: (editing) => set({ isEditing: editing }),

  // Load/Save
  loadMindMap: (data) => {
    const nodes: Node[] = data.nodes.map((nodeData) => ({
      id: nodeData.id,
      type: 'default',
      position: nodeData.position,
      data: nodeData
    }))
    
    const edges: Edge[] = data.edges.map((edgeData) => ({
      id: edgeData.id,
      source: edgeData.source,
      target: edgeData.target,
      type: 'default',
      data: edgeData
    }))
    
    set({
      nodes,
      edges,
      viewport: data.viewport,
      selectedNodeId: null,
      selectedEdgeId: null,
      isEditing: false
    })
    
    get().saveToHistory()
  },

  getMindMapData: () => {
    const state = get()
    return {
      nodes: state.nodes.map((node) => node.data),
      edges: state.edges.map((edge) => edge.data),
      viewport: state.viewport
    }
  },

  // History
  saveToHistory: () => {
    const state = get()
    const currentData = state.getMindMapData()
    
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(currentData)
      
      return {
        history: newHistory.slice(-50), // Keep last 50 states
        historyIndex: newHistory.length - 1,
        canUndo: newHistory.length > 1,
        canRedo: false
      }
    })
  },

  undo: () => {
    const state = get()
    if (state.canUndo && state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1
      const previousData = state.history[newIndex]
      
      set({
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true
      })
      
      state.loadMindMap(previousData)
    }
  },

  redo: () => {
    const state = get()
    if (state.canRedo && state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1
      const nextData = state.history[newIndex]
      
      set({
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < state.history.length - 1
      })
      
      state.loadMindMap(nextData)
    }
  }
}))
