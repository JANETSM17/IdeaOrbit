'use client'

import { useState, useRef, useEffect } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { useMindMapStore } from '@/store/mindmap-store'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Bold, 
  Italic, 
  Underline, 
  Palette, 
  Type, 
  Trash2,
  Plus
} from 'lucide-react'

export function CustomNode({ data, id }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(data.label)
  const inputRef = useRef<HTMLInputElement>(null)
  const { updateNode, deleteNode, addNode, setSelectedNode } = useMindMapStore()

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(data.label)
  }

  const handleSave = () => {
    if (editValue.trim()) {
      updateNode(id, { label: editValue.trim() })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditValue(data.label)
      setIsEditing(false)
    }
  }

  const handleStyleChange = (styleKey: string, value: any) => {
    updateNode(id, {
      style: {
        ...data.style,
        [styleKey]: value
      }
    })
  }

  const handleAddChild = () => {
    const newNodePosition = {
      x: data.position.x + 200,
      y: data.position.y
    }
    addNode(newNodePosition, 'New Node')
  }

  const handleDelete = () => {
    deleteNode(id)
  }

  const nodeStyle = {
    backgroundColor: data.style?.backgroundColor || '#ffffff',
    borderColor: data.style?.borderColor || '#000000',
    color: data.style?.color || '#000000',
    fontSize: `${data.style?.fontSize || 14}px`,
    fontWeight: data.style?.fontWeight || 'normal',
    fontStyle: data.style?.fontStyle || 'normal',
    textDecoration: data.style?.textDecoration || 'none',
    border: `2px solid ${data.style?.borderColor || '#000000'}`,
    borderRadius: '8px',
    padding: '12px',
    minWidth: '120px',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }

  return (
    <div
      style={nodeStyle}
      onDoubleClick={handleDoubleClick}
      onClick={() => setSelectedNode(id)}
    >
      <Handle type="target" position={Position.Left} />
      
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontStyle: 'inherit',
            textDecoration: 'inherit',
            textAlign: 'center',
            width: '100%'
          }}
        />
      ) : (
        <div style={{ textAlign: 'center', wordBreak: 'break-word' }}>
          {data.label}
        </div>
      )}

      <Handle type="source" position={Position.Right} />

      {/* Node controls */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 hover:opacity-100 transition-all duration-200 ease-in-out">
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
              <Type className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Font Size</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={data.style?.fontSize || 14}
                  onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500">
                  {data.style?.fontSize || 14}px
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={data.style?.fontWeight === 'bold' ? 'default' : 'outline'}
                  onClick={() => handleStyleChange('fontWeight', 
                    data.style?.fontWeight === 'bold' ? 'normal' : 'bold'
                  )}
                >
                  <Bold className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant={data.style?.fontStyle === 'italic' ? 'default' : 'outline'}
                  onClick={() => handleStyleChange('fontStyle', 
                    data.style?.fontStyle === 'italic' ? 'normal' : 'italic'
                  )}
                >
                  <Italic className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant={data.style?.textDecoration === 'underline' ? 'default' : 'outline'}
                  onClick={() => handleStyleChange('textDecoration', 
                    data.style?.textDecoration === 'underline' ? 'none' : 'underline'
                  )}
                >
                  <Underline className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline" className="h-6 w-6 p-0">
              <Palette className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Background</label>
                <input
                  type="color"
                  value={data.style?.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-full h-8 rounded border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Border</label>
                <input
                  type="color"
                  value={data.style?.borderColor || '#000000'}
                  onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                  className="w-full h-8 rounded border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Text</label>
                <input
                  type="color"
                  value={data.style?.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-full h-8 rounded border"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          size="sm"
          variant="outline"
          className="h-6 w-6 p-0"
          onClick={handleAddChild}
        >
          <Plus className="h-3 w-3" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
