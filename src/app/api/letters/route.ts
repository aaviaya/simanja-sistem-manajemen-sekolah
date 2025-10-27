import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateLetterNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `LET-${year}${month}-${random}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (type && type !== 'all') {
      where.type = type
    }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { description: { contains: search } },
        { letterNo: { contains: search } },
        { sender: { contains: search } },
        { recipient: { contains: search } }
      ]
    }

    // Get total count
    const total = await db.letter.count({ where })

    // Get letters
    const letters = await db.letter.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
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
    
    return NextResponse.json({
      letters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching letters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch letters' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, category, subject, description, sender, recipient, date, priority, evidenceImages } = body

    // Validate required fields
    if (!type || !category || !subject || !description || !sender || !recipient) {
      return NextResponse.json(
        { error: 'Field wajib: jenis, kategori, subjek, deskripsi, pengirim, penerima' },
        { status: 400 }
      )
    }

    // Generate unique letter number
    let letterNo = generateLetterNumber()
    let attempts = 0
    const maxAttempts = 10

    // Ensure letter number is unique
    while (attempts < maxAttempts) {
      const existing = await db.letter.findUnique({
        where: { letterNo }
      })
      
      if (!existing) break
      
      letterNo = generateLetterNumber()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Gagal generate nomor surat unik' },
        { status: 500 }
      )
    }

    const letter = await db.letter.create({
      data: {
        uuid: crypto.randomUUID(),
        letterNo,
        type,
        category,
        subject,
        description,
        sender,
        recipient,
        date,
        priority: priority || 'medium',
        evidenceImages: evidenceImages ? JSON.stringify(evidenceImages) : null
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

    return NextResponse.json({ letter }, { status: 201 })
  } catch (error) {
    console.error('Error creating letter:', error)
    return NextResponse.json(
      { error: 'Failed to create letter' },
      { status: 500 }
    )
  }
}