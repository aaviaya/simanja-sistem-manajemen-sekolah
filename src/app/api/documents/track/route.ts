import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const docNumber = searchParams.get('docNumber')

    if (!docNumber) {
      return NextResponse.json(
        { error: 'Nomor dokumen wajib diisi' },
        { status: 400 }
      )
    }

    // Cari dokumen berdasarkan nomor dokumen
    const document = await db.documentArchive.findUnique({
      where: {
        docNumber: docNumber
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Dokumen tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      document: {
        id: document.id,
        uuid: document.uuid,
        docNumber: document.docNumber,
        title: document.title,
        category: document.category,
        description: document.description,
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        issuedDate: document.issuedDate,
        issuedBy: document.issuedBy,
        status: document.status,
        tags: document.tags,
        adminNotes: document.adminNotes,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      }
    })
  } catch (error) {
    console.error('Error tracking document:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat melacak dokumen' },
      { status: 500 }
    )
  }
}