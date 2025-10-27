import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const school = await db.school.findUnique({
      where: {
        id: params.id
      }
    })

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ school })
  } catch (error) {
    console.error('Error fetching school:', error)
    return NextResponse.json(
      { error: 'Failed to fetch school' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      address,
      phone,
      email,
      website,
      logo,
      principal,
      motto,
      vision,
      mission
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'School name is required' },
        { status: 400 }
      )
    }

    const school = await db.school.update({
      where: {
        id: params.id
      },
      data: {
        name,
        description,
        address,
        phone,
        email,
        website,
        logo,
        principal,
        motto,
        vision,
        mission
      }
    })

    return NextResponse.json({ school })
  } catch (error: any) {
    console.error('Error updating school:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'School with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update school' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.school.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'School deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting school:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete school' },
      { status: 500 }
    )
  }
}