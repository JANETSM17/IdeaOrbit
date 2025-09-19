'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Save, 
  FolderOpen, 
  Download, 
  Image,
  Undo, 
  Redo, 
  Plus, 
  Palette,
  Type,
  Settings,
  User,
  LogOut
} from 'lucide-react'
import { useMindMapStore } from '@/store/mindmap-store'

interface MindMapToolbarProps {
  onSave: () => void
  onLoad: () => void
  onExport: () => void
  onExportImage: () => void
  onLogout: () => void
  user: any
}

export function MindMapToolbar({ onSave, onLoad, onExport, onExportImage, onLogout, user }: MindMapToolbarProps) {
  const [isSaving, setIsSaving] = useState(false)
  const { 
    addNode, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    getMindMapData,
    selectedNodeId,
    selectedEdgeId,
    deleteNode,
    deleteEdge
  } = useMindMapStore()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave()
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddNode = () => {
    addNode({ x: 100, y: 100 }, 'New Node')
  }

  const handleDeleteSelected = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId)
    } else if (selectedEdgeId) {
      deleteEdge(selectedEdgeId)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold text-gray-800">IdeaOrbit</h1>
      </div>

      <div className="flex items-center space-x-2">
        {/* File Operations */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onLoad}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Load
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
        >
          <Download className="h-4 w-4 mr-2" />
          Export JSON
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportImage}
        >
          <Image className="h-4 w-4 mr-2" />
          Export Image
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Edit Operations */}
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* Node Operations */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddNode}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Node
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteSelected}
          disabled={!selectedNodeId && !selectedEdgeId}
        >
          Delete
        </Button>

        <div className="w-px h-6 bg-gray-300" />

        {/* User Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              {user?.name || user?.email}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              <div className="text-sm font-medium">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
