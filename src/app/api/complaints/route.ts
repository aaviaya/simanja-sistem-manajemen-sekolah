import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateTicketNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `REQ-${year}${month}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, category, subject, description } = body

    // Validate required fields
    if (!name || !email || !category || !subject || !description) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi kecuali nomor telepon' },
        { status: 400 }
      )
    }

    // Generate unique ticket number
    let ticketNo = generateTicketNumber()
    let attempts = 0
    const maxAttempts = 10

    // Ensure ticket number is unique
    while (attempts < maxAttempts) {
      const existing = await db.complaint.findUnique({
        where: { ticketNo }
      })
      
      if (!existing) break
      
      ticketNo = generateTicketNumber()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Gagal generate nomor tiket unik' },
        { status: 500 }
      )
    }

    // Create complaint
    const complaint = await db.complaint.create({
      data: {
        uuid: crypto.randomUUID(),
        ticketNo,
        name,
        email,
        phone: phone || null,
        category,
        subject,
        description,
        status: 'pending',
        priority: 'medium'
      }
    })

    return NextResponse.json({
      message: 'Pengaduan berhasil dibuat',
      complaint: {
        ticketNo: complaint.ticketNo,
        uuid: complaint.uuid
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (category) {
      where.category = category
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { ticketNo: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get complaints and total count
    const [complaints, total] = await Promise.all([
      db.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          uuid: true,
          ticketNo: true,
          name: true,
          email: true,
          phone: true,
          category: true,
          subject: true,
          description: true,
          status: true,
          priority: true,
          adminNotes: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      db.complaint.count({ where })
    ])

    return NextResponse.json({
      complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}