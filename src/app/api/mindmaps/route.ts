import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get('user')
    if (!cookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(cookie.value)
    
    const mindMaps = await prisma.mindMap.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ mindMaps })
  } catch (error) {
    console.error('Error fetching mind maps:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    if (!title || !data) {
      return NextResponse.json(
        { error: 'Title and data are required' },
        { status: 400 }
      )
    }

    const mindMap = await prisma.mindMap.create({
      data: {
        title,
        description,
        data,
        userId: user.id
      }
    })

    return NextResponse.json({ mindMap }, { status: 201 })
  } catch (error) {
    console.error('Error creating mind map:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
