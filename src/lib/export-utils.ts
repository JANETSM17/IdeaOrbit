import { MindMapData } from '../types/mindmap'

export function exportToJSON(data: MindMapData, filename: string = 'mindmap.json') {
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportToImage(
  canvasElement: HTMLCanvasElement, 
  filename: string = 'mindmap.png',
  format: 'png' | 'jpg' = 'png'
) {
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
  const dataUrl = canvasElement.toDataURL(mimeType, 0.9)
  
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function captureCanvasAsImage(
  reactFlowInstance: any,
  options: {
    width?: number
    height?: number
    backgroundColor?: string
  } = {}
): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const { width = 1920, height = 1080, backgroundColor = '#ffffff' } = options
    
    // Get the viewport bounds
    const bounds = reactFlowInstance.getViewport()
    const nodes = reactFlowInstance.getNodes()
    const edges = reactFlowInstance.getEdges()
    
    // Calculate the bounds of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    nodes.forEach((node: any) => {
      minX = Math.min(minX, node.position.x)
      minY = Math.min(minY, node.position.y)
      maxX = Math.max(maxX, node.position.x + 200) // Approximate node width
      maxY = Math.max(maxY, node.position.y + 100) // Approximate node height
    })
    
    // Add padding
    const padding = 50
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding
    
    // Create canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = width
    canvas.height = height
    
    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
    
    // Calculate scale to fit content
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    const scaleX = width / contentWidth
    const scaleY = height / contentHeight
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up
    
    // Center the content
    const offsetX = (width - contentWidth * scale) / 2 - minX * scale
    const offsetY = (height - contentHeight * scale) / 2 - minY * scale
    
    // Draw nodes
    nodes.forEach((node: any) => {
      const x = node.position.x * scale + offsetX
      const y = node.position.y * scale + offsetY
      const nodeWidth = 200 * scale
      const nodeHeight = 100 * scale
      
      // Draw node background
      ctx.fillStyle = node.data.style?.backgroundColor || '#ffffff'
      ctx.fillRect(x, y, nodeWidth, nodeHeight)
      
      // Draw node border
      ctx.strokeStyle = node.data.style?.borderColor || '#000000'
      ctx.lineWidth = 2 * scale
      ctx.strokeRect(x, y, nodeWidth, nodeHeight)
      
      // Draw node text
      ctx.fillStyle = node.data.style?.color || '#000000'
      ctx.font = `${node.data.style?.fontWeight || 'normal'} ${node.data.style?.fontSize || 14}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const textX = x + nodeWidth / 2
      const textY = y + nodeHeight / 2
      
      // Handle text decoration
      if (node.data.style?.textDecoration === 'underline') {
        ctx.strokeStyle = node.data.style?.color || '#000000'
        ctx.lineWidth = 1 * scale
        ctx.beginPath()
        ctx.moveTo(textX - nodeWidth / 2 + 10, textY + 5)
        ctx.lineTo(textX + nodeWidth / 2 - 10, textY + 5)
        ctx.stroke()
      }
      
      ctx.fillText(node.data.label, textX, textY)
    })
    
    // Draw edges
    edges.forEach((edge: any) => {
      const sourceNode = nodes.find((n: any) => n.id === edge.source)
      const targetNode = nodes.find((n: any) => n.id === edge.target)
      
      if (sourceNode && targetNode) {
        const sourceX = sourceNode.position.x * scale + offsetX + 200 * scale
        const sourceY = sourceNode.position.y * scale + offsetY + 50 * scale
        const targetX = targetNode.position.x * scale + offsetX
        const targetY = targetNode.position.y * scale + offsetY + 50 * scale
        
        ctx.strokeStyle = edge.data.style?.stroke || '#000000'
        ctx.lineWidth = (edge.data.style?.strokeWidth || 2) * scale
        ctx.beginPath()
        ctx.moveTo(sourceX, sourceY)
        ctx.lineTo(targetX, targetY)
        ctx.stroke()
        
        // Draw arrow
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX)
        const arrowLength = 10 * scale
        const arrowAngle = Math.PI / 6
        
        ctx.beginPath()
        ctx.moveTo(targetX, targetY)
        ctx.lineTo(
          targetX - arrowLength * Math.cos(angle - arrowAngle),
          targetY - arrowLength * Math.sin(angle - arrowAngle)
        )
        ctx.moveTo(targetX, targetY)
        ctx.lineTo(
          targetX - arrowLength * Math.cos(angle + arrowAngle),
          targetY - arrowLength * Math.sin(angle + arrowAngle)
        )
        ctx.stroke()
      }
    })
    
    resolve(canvas)
  })
}
