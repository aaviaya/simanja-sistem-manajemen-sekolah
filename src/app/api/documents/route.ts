import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

// Schema validation
const createDocumentSchema = z.object({
  title: z.string().min(1, 'Judul dokumen wajib diisi'),
  category: z.enum(['Surat Keputusan (SK)', 'Notulen Rapat', 'Laporan Kegiatan', 'Legalitas & Perizinan', 'Arsip Umum', 'Kepeagawaian', 'Kesiswaan']),
  description: z.string().optional(),
  fileUrls: z.array(z.string()).optional(),
  fileNames: z.array(z.string()).optional(),
  fileSizes: z.array(z.number()).optional(),
  fileTypes: z.array(z.string()).optional(),
  issuedDate: z.string().optional(),
  issuedBy: z.string().optional(),
  tags: z.string().optional(),
})

// Generate document number
const generateDocNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0')
  return `DOC-${year}${month}-${random}`
}

// GET - Fetch all documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { docNumber: { contains: search } },
        { issuedBy: { contains: search } }
      ]
    }

    // Get total count
    const total = await db.documentArchive.count({ where })

    // Get documents
    const documents = await db.documentArchive.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    // Process documents to extract multiple files data and tags
    const processedDocuments = documents.map(doc => {
      let processedDoc = { ...doc }
      
      try {
        // Parse tags to extract multiple files data
        if (doc.tags) {
          const tagsData = JSON.parse(doc.tags)
          processedDoc = {
            ...processedDoc,
            tags: tagsData.tags?.join(', ') || doc.tags,
            multipleFiles: tagsData.multipleFiles || {
              fileUrls: doc.fileUrl ? [doc.fileUrl] : [],
              fileNames: doc.fileName ? [doc.fileName] : [],
              fileSizes: doc.fileSize ? [doc.fileSize] : [],
              fileTypes: doc.fileType ? [doc.fileType] : []
            }
          }
        } else {
          processedDoc = {
            ...processedDoc,
            multipleFiles: {
              fileUrls: doc.fileUrl ? [doc.fileUrl] : [],
              fileNames: doc.fileName ? [doc.fileName] : [],
              fileSizes: doc.fileSize ? [doc.fileSize] : [],
              fileTypes: doc.fileType ? [doc.fileType] : []
            }
          }
        }
      } catch (error) {
        // If parsing fails, use default structure
        processedDoc = {
          ...processedDoc,
          multipleFiles: {
            fileUrls: doc.fileUrl ? [doc.fileUrl] : [],
            fileNames: doc.fileName ? [doc.fileName] : [],
            fileSizes: doc.fileSize ? [doc.fileSize] : [],
            fileTypes: doc.fileType ? [doc.fileType] : []
          }
        }
      }
      
      return processedDoc
    })

    return NextResponse.json({
      documents: processedDocuments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data dokumen' },
      { status: 500 }
    )
  }
}

// POST - Create new document
export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }
    
    const validatedData = createDocumentSchema.parse(body)

    // Generate document number
    const docNumber = generateDocNumber()

    // Handle multiple files - store as JSON string
    const fileData = {
      fileUrls: validatedData.fileUrls || [],
      fileNames: validatedData.fileNames || [],
      fileSizes: validatedData.fileSizes || [],
      fileTypes: validatedData.fileTypes || []
    }

    const document = await db.documentArchive.create({
      data: {
        docNumber,
        title: validatedData.title,
        category: validatedData.category,
        description: validatedData.description,
        issuedDate: validatedData.issuedDate,
        issuedBy: validatedData.issuedBy,
        status: 'active',
        // Store first file as main file for compatibility
        fileUrl: validatedData.fileUrls?.[0] || null,
        fileName: validatedData.fileNames?.[0] || null,
        fileSize: validatedData.fileSizes?.[0] || null,
        fileType: validatedData.fileTypes?.[0] || null,
        // Store all files data as JSON in tags field
        tags: JSON.stringify({
          tags: validatedData.tags?.split(',').map(t => t.trim()) || [],
          multipleFiles: fileData
        })
      }
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat dokumen' },
      { status: 500 }
    )
  }
}