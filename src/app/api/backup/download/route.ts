import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Backup ID is required'
        },
        { status: 400 }
      )
    }
    
    console.log('Download request for backup ID:', id)
    
    // Get backup record from database
    const backupRecord = await db.backupRecord.findUnique({
      where: { id }
    })

    if (!backupRecord) {
      console.log('Backup record not found for ID:', id)
      return NextResponse.json(
        { 
          success: false,
          error: 'Backup not found'
        },
        { status: 404 }
      )
    }

    console.log('Backup record found:', backupRecord)
    console.log('File path:', backupRecord.filePath)

    // Check if backup file exists
    if (!fs.existsSync(backupRecord.filePath)) {
      console.log('Backup file not found at path:', backupRecord.filePath)
      return NextResponse.json(
        { 
          success: false,
          error: 'Backup file not found on server'
        },
        { status: 404 }
      )
    }

    // Check if backup is completed
    if (backupRecord.status !== 'completed') {
      console.log('Backup not completed, status:', backupRecord.status)
      return NextResponse.json(
        { 
          success: false,
          error: `Backup is not completed yet. Status: ${backupRecord.status}`
        },
        { status: 400 }
      )
    }

    // Read the file
    const fileBuffer = fs.readFileSync(backupRecord.filePath)
    console.log('File buffer size:', fileBuffer.length)
    
    if (fileBuffer.length === 0) {
      console.log('Backup file is empty')
      return NextResponse.json(
        { 
          success: false,
          error: 'Backup file is empty'
        },
        { status: 500 }
      )
    }
    
    // Set appropriate headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${backupRecord.filename}"`)
    headers.set('Content-Length', fileBuffer.length.toString())
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')

    console.log('Sending file with headers:', {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${backupRecord.filename}"`,
      'Content-Length': fileBuffer.length.toString()
    })

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('Error downloading backup:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Failed to download backup: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    )
  }
}