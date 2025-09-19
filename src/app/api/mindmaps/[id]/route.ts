import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = request.cookies.get('user')
    if (!cookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(cookie.value)
    
    const mindMap = await prisma.mindMap.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!mindMap) {
      return NextResponse.json(
        { error: 'Mind map not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ mindMap })
  } catch (error) {
    console.error('Error fetching mind map:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = request.cookies.get('user')
    if (!cookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(cookie.value)
    const { title, description, data } = await request.json()

    const mindMap = await prisma.mindMap.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!mindMap) {
      return NextResponse.json(
        { error: 'Mind map not found' },
        { status: 404 }
      )
    }

    const updatedMindMap = await prisma.mindMap.update({
      where: { id: params.id },
      data: {
        title: title || mindMap.title,
        description: description !== undefined ? description : mindMap.description,
        data: data || mindMap.data
      }
    })

    return NextResponse.json({ mindMap: updatedMindMap })
  } catch (error) {
    console.error('Error updating mind map:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookie = request.cookies.get('user')
    if (!cookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(cookie.value)
    
    const mindMap = await prisma.mindMap.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!mindMap) {
      return NextResponse.json(
        { error: 'Mind map not found' },
        { status: 404 }
      )
    }

    await prisma.mindMap.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Mind map deleted successfully' })
  } catch (error) {
    console.error('Error deleting mind map:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
