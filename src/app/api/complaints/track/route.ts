import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketNo = searchParams.get('ticketNo')

    if (!ticketNo) {
      return NextResponse.json(
        { error: 'Nomor tiket wajib diisi' },
        { status: 400 }
      )
    }

    // Find complaint by ticket number
    const complaint = await db.complaint.findUnique({
      where: { ticketNo },
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
    })

    if (!complaint) {
      return NextResponse.json(
        { error: 'Pengaduan dengan nomor tiket tersebut tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Pengaduan ditemukan',
      complaint
    })

  } catch (error) {
    console.error('Error tracking complaint:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}