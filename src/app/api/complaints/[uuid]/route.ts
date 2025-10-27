import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const complaint = await db.complaint.findUnique({
      where: { uuid: params.uuid },
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
        { error: 'Pengaduan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(complaint)

  } catch (error) {
    console.error('Error fetching complaint:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
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
    const { status, priority, adminNotes } = body

    // Check if complaint exists
    const existingComplaint = await db.complaint.findUnique({
      where: { uuid: params.uuid }
    })

    if (!existingComplaint) {
      return NextResponse.json(
        { error: 'Pengaduan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update complaint
    const updatedComplaint = await db.complaint.update({
      where: { uuid: params.uuid },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(adminNotes !== undefined && { adminNotes })
      },
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

    return NextResponse.json({
      message: 'Pengaduan berhasil diperbarui',
      complaint: updatedComplaint
    })

  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    // Check if complaint exists
    const existingComplaint = await db.complaint.findUnique({
      where: { uuid: params.uuid }
    })

    if (!existingComplaint) {
      return NextResponse.json(
        { error: 'Pengaduan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete complaint
    await db.complaint.delete({
      where: { uuid: params.uuid }
    })

    return NextResponse.json({
      message: 'Pengaduan berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting complaint:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}