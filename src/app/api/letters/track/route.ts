import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const letterNo = searchParams.get('letterNo')

    if (!letterNo) {
      return NextResponse.json(
        { error: 'Letter number is required' },
        { status: 400 }
      )
    }

    const letter = await db.letter.findUnique({
      where: { letterNo },
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
    console.error('Error tracking letter:', error)
    return NextResponse.json(
      { error: 'Failed to track letter' },
      { status: 500 }
    )
  }
}