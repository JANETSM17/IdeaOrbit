'use client'

import React, { useCallback, useRef, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
  NodeTypes,
  EdgeTypes,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useMindMapStore } from '../../store/mindmap-store'
import { CustomNode } from './custom-node'
import { MindMapToolbar } from './mindmap-toolbar'
import { generateId } from '../../lib/utils'
import { captureCanvasAsImage } from '../../lib/export-utils'

const nodeTypes: NodeTypes = {
  default: CustomNode,
}

const edgeTypes: EdgeTypes = {}

export function MindMapEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  
  const {
    nodes,
    edges,
    viewport,
    onNodesChange,
    onEdgesChange,
    addNode,
    addEdge,
    setViewport,
    loadMindMap,
    getMindMapData,
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useMindMapStore()

  // Expose reactFlowInstance to parent components
  React.useEffect(() => {
    if (reactFlowInstance) {
      // Store instance globally for export functionality
      ;(window as any).reactFlowInstance = reactFlowInstance
    }
  }, [reactFlowInstance])

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addEdge(params.source, params.target)
      }
    },
    [addEdge]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds || !reactFlowInstance) return

      const type = event.dataTransfer.getData('application/reactflow')
      if (typeof type === 'undefined' || !type) return

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      addNode(position, 'New Node')
    },
    [reactFlowInstance, addNode]
  )

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance)
  }, [])

  const onMove = useCallback((event: any, viewport: any) => {
    setViewport(viewport)
  }, [setViewport])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'z':
          event.preventDefault()
          if (event.shiftKey) {
            redo()
          } else {
            undo()
          }
          break
        case 's':
          event.preventDefault()
          // Save functionality will be handled by parent component
          break
      }
    }
  }, [undo, redo])

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onMove={onMove}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={viewport}
        fitView
        attributionPosition="bottom-left"
        connectionLineStyle={{ stroke: '#000', strokeWidth: 2 }}
        defaultEdgeOptions={{
          style: { stroke: '#000', strokeWidth: 2 },
          type: 'default',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#000',
          },
        }}
        minZoom={0.1}
        maxZoom={2}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.style?.background) return n.style.background
            return '#eee'
          }}
          nodeColor={(n) => {
            if (n.style?.background) return n.style.background
            return '#fff'
          }}
          nodeBorderRadius={2}
        />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  )
}

export function MindMapEditorWrapper() {
  return (
    <ReactFlowProvider>
      <MindMapEditor />
    </ReactFlowProvider>
  )
}
