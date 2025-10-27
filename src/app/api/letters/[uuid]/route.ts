import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const letter = await db.letter.findUnique({
      where: { uuid: params.uuid },
      select: {
        id: true,
        uuid: true,
        letterNo: true,
        type: true,
        category: true,
        subject: true,
        description: true,
        sender: true,
        recipient: true,
        date: true,
        status: true,
        priority: true,
        adminNotes: true,
        evidenceImages: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!letter) {
      return NextResponse.json(
        { error: 'Letter not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ letter })
  } catch (error) {
    console.error('Error fetching letter:', error)
    return NextResponse.json(
      { error: 'Failed to fetch letter' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const body = await request.json()
    const { status, adminNotes } = body

    const letter = await db.letter.update({
      where: { uuid: params.uuid },
      data: {
        status,
        adminNotes
      },
      select: {
        id: true,
        uuid: true,
        letterNo: true,
        type: true,
        category: true,
        subject: true,
        description: true,
        sender: true,
        recipient: true,
        date: true,
        status: true,
        priority: true,
        adminNotes: true,
        evidenceImages: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ letter })
  } catch (error) {
    console.error('Error updating letter:', error)
    return NextResponse.json(
      { error: 'Failed to update letter' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    await db.letter.delete({
      where: { uuid: params.uuid }
    })

    return NextResponse.json({ message: 'Letter deleted successfully' })
  } catch (error) {
    console.error('Error deleting letter:', error)
    return NextResponse.json(
      { error: 'Failed to delete letter' },
      { status: 500 }
    )
  }
}