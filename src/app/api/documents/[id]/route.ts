import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Schema validation for update
const updateDocumentSchema = z.object({
  title: z.string().min(1, 'Judul dokumen wajib diisi').optional(),
  category: z.enum(['Surat Keputusan (SK)', 'Notulen Rapat', 'Laporan Kegiatan', 'Legalitas & Perizinan', 'Arsip Umum', 'Kepeagawaian', 'Kesiswaan']).optional(),
  description: z.string().optional(),
  fileUrls: z.array(z.string()).optional(),
  fileNames: z.array(z.string()).optional(),
  fileSizes: z.array(z.number()).optional(),
  fileTypes: z.array(z.string()).optional(),
  issuedDate: z.string().optional(),
  issuedBy: z.string().optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
  tags: z.string().optional(),
  adminNotes: z.string().optional(),
})

// GET - Fetch single document by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await db.documentArchive.findUnique({
      where: { id: params.id }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Dokumen tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data dokumen' },
      { status: 500 }
    )
  }
}

// PUT - Update document by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateDocumentSchema.parse(body)

    // Check if document exists
    const existingDocument = await db.documentArchive.findUnique({
      where: { id: params.id }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Dokumen tidak ditemukan' },
        { status: 404 }
      )
    }

    // Handle multiple files
    const fileData = {
      fileUrls: validatedData.fileUrls || [],
      fileNames: validatedData.fileNames || [],
      fileSizes: validatedData.fileSizes || [],
      fileTypes: validatedData.fileTypes || []
    }

    const document = await db.documentArchive.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        category: validatedData.category,
        description: validatedData.description,
        issuedDate: validatedData.issuedDate,
        issuedBy: validatedData.issuedBy,
        status: validatedData.status,
        adminNotes: validatedData.adminNotes,
        // Update main file for compatibility
        fileUrl: validatedData.fileUrls?.[0] || existingDocument.fileUrl,
        fileName: validatedData.fileNames?.[0] || existingDocument.fileName,
        fileSize: validatedData.fileSizes?.[0] || existingDocument.fileSize,
        fileType: validatedData.fileTypes?.[0] || existingDocument.fileType,
        // Update tags with multiple files data
        tags: JSON.stringify({
          tags: validatedData.tags?.split(',').map(t => t.trim()) || [],
          multipleFiles: fileData
        })
      }
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error updating document:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui dokumen' },
      { status: 500 }
    )
  }
}

// DELETE - Delete document by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if document exists
    const existingDocument = await db.documentArchive.findUnique({
      where: { id: params.id }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Dokumen tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.documentArchive.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Dokumen berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus dokumen' },
      { status: 500 }
    )
  }
}