import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const schools = await db.school.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ schools })
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schools' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('POST /api/school received data:', body)
    
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

    // Check if school with this name already exists
    const existingSchool = await db.school.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })

    if (existingSchool) {
      console.log('School with this name already exists:', existingSchool)
      return NextResponse.json(
        { error: 'School with this name already exists' },
        { status: 409 }
      )
    }

    const school = await db.school.create({
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

    console.log('School created successfully:', school)
    return NextResponse.json({ school }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating school:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'School with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    )
  }
}