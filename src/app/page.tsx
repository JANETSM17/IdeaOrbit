'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from '../components/auth/login-form'
import { RegisterForm } from '../components/auth/register-form'
import { MindMapEditorWrapper } from '../components/mindmap/mindmap-editor'
import { MindMapToolbar } from '../components/mindmap/mindmap-toolbar'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { useMindMapStore } from '../store/mindmap-store'
import { exportToJSON, exportToImage, captureCanvasAsImage } from '../lib/export-utils'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [mindMaps, setMindMaps] = useState<any[]>([])
  const [saveTitle, setSaveTitle] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { getMindMapData, loadMindMap, addNode } = useMindMapStore()

  const initializeWelcomeMindMap = () => {
    // Clear any existing nodes first
    loadMindMap({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    })

    // Add welcome nodes
    setTimeout(() => {
      addNode({ x: 0, y: 0 }, 'Welcome to IdeaOrbit!')
      addNode({ x: -200, y: -100 }, 'Double-click to edit')
      addNode({ x: 200, y: -100 }, 'Drag to move')
      addNode({ x: -200, y: 100 }, 'Connect nodes')
      addNode({ x: 200, y: 100 }, 'Style & format')
    }, 100)
  }

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/mindmaps')
        if (response.ok) {
          const data = await response.json()
          setUser(JSON.parse(document.cookie.split('user=')[1]?.split(';')[0] || '{}'))
          setMindMaps(data.mindMaps || [])
        }
      } catch (error) {
        // User not authenticated
      }
    }
    checkAuth()
  }, [])

  const handleLoginSuccess = (userData: any) => {
    setUser(userData)
    setShowLogin(false)
    loadUserMindMaps()
    // Initialize with a welcome mind map if no existing maps
    setTimeout(() => {
      if (mindMaps.length === 0) {
        initializeWelcomeMindMap()
      }
    }, 1000)
  }

  const handleRegisterSuccess = (userData: any) => {
    setUser(userData)
    setShowRegister(false)
    loadUserMindMaps()
    // Initialize with a welcome mind map for new users
    setTimeout(() => {
      initializeWelcomeMindMap()
    }, 1000)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setMindMaps([])
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const loadUserMindMaps = async () => {
    try {
      const response = await fetch('/api/mindmaps')
      if (response.ok) {
        const data = await response.json()
        setMindMaps(data.mindMaps || [])
      }
    } catch (error) {
      console.error('Error loading mind maps:', error)
    }
  }

  const handleSave = async () => {
    if (!saveTitle.trim()) return

    setIsLoading(true)
    try {
      const mindMapData = getMindMapData()
      const response = await fetch('/api/mindmaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: saveTitle,
          description: saveDescription,
          data: mindMapData
        }),
      })

      if (response.ok) {
        setShowSaveDialog(false)
        setSaveTitle('')
        setSaveDescription('')
        loadUserMindMaps()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save mind map')
      }
    } catch (error) {
      alert('Failed to save mind map')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoad = async (mindMapId: string) => {
    try {
      const response = await fetch(`/api/mindmaps/${mindMapId}`)
      if (response.ok) {
        const data = await response.json()
        loadMindMap(data.mindMap.data)
        setShowLoadDialog(false)
      }
    } catch (error) {
      alert('Failed to load mind map')
    }
  }

  const handleExport = async () => {
    const mindMapData = getMindMapData()
    exportToJSON(mindMapData, 'mindmap.json')
  }

  const handleExportImage = async () => {
    try {
      const reactFlowInstance = (window as any).reactFlowInstance
      if (!reactFlowInstance) {
        alert('Please wait for the mind map to load completely')
        return
      }

      const canvas = await captureCanvasAsImage(reactFlowInstance, {
        width: 1920,
        height: 1080,
        backgroundColor: '#ffffff'
      })
      
      exportToImage(canvas, 'mindmap.png', 'png')
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export image')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">IdeaOrbit</h1>
            <p className="text-gray-600">Create, edit, and visualize mind maps interactively</p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => setShowLogin(true)}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
            <Button
              onClick={() => setShowRegister(true)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Sign Up
            </Button>
          </div>
        </div>

        <LoginForm
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => {
            setShowLogin(false)
            setShowRegister(true)
          }}
        />

        <RegisterForm
          isOpen={showRegister}
          onClose={() => setShowRegister(false)}
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => {
            setShowRegister(false)
            setShowLogin(true)
          }}
        />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <MindMapToolbar
        onSave={() => setShowSaveDialog(true)}
        onLoad={() => setShowLoadDialog(true)}
        onExport={handleExport}
        onExportImage={handleExportImage}
        onLogout={handleLogout}
        user={user}
      />
      
      <div className="flex-1">
        <MindMapEditorWrapper />
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Mind Map</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Enter mind map title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!saveTitle.trim() || isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Mind Map</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {mindMaps.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No saved mind maps found</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {mindMaps.map((mindMap) => (
                  <div
                    key={mindMap.id}
                    className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => handleLoad(mindMap.id)}
                  >
                    <div className="font-medium">{mindMap.title}</div>
                    {mindMap.description && (
                      <div className="text-sm text-gray-500">{mindMap.description}</div>
                    )}
                    <div className="text-xs text-gray-400">
                      {new Date(mindMap.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowLoadDialog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
