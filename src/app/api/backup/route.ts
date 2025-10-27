import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

// Ensure backup directory exists
const backupDir = path.join(process.cwd(), 'backups')
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `backup-${timestamp}.db`
    const filePath = path.join(backupDir, filename)

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Extract database file path from URL
    const sourceDbPath = databaseUrl.replace('file:', '')

    // Check if source database exists
    if (!fs.existsSync(sourceDbPath)) {
      throw new Error('Source database file not found')
    }

    try {
      // Open source database
      const sourceDb = await open({
        filename: sourceDbPath,
        driver: sqlite3.Database
      })

      // Create backup database
      const backupDb = await open({
        filename: filePath,
        driver: sqlite3.Database
      })

      // Enable foreign keys in both databases
      await sourceDb.exec('PRAGMA foreign_keys = ON')
      await backupDb.exec('PRAGMA foreign_keys = ON')

      // Get all table names
      const tables = await sourceDb.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")

      // Backup each table
      for (const table of tables) {
        const tableName = table.name
        
        // Get table schema
        const schema = await sourceDb.all(`PRAGMA table_info(${tableName})`)
        
        // Create table in backup database
        const columns = schema.map(col => `${col.name} ${col.type}`).join(', ')
        await backupDb.exec(`CREATE TABLE ${tableName} (${columns})`)

        // Copy data
        const rows = await sourceDb.all(`SELECT * FROM ${tableName}`)
        for (const row of rows) {
          const columns = Object.keys(row).join(', ')
          const placeholders = Object.keys(row).map(() => '?').join(', ')
          const values = Object.values(row)
          
          await backupDb.run(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`, values)
        }
      }

      // Close databases
      await sourceDb.close()
      await backupDb.close()

      // Get file size
      const stats = fs.statSync(filePath)
      const fileSize = stats.size

      // Record backup in database
      const backupRecord = await db.backupRecord.create({
        data: {
          filename,
          filePath,
          fileSize,
          backupType: 'manual',
          status: 'completed'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Backup created successfully',
        backup: {
          id: backupRecord.id,
          filename: backupRecord.filename,
          fileSize: backupRecord.fileSize,
          createdAt: backupRecord.createdAt
        }
      })
    } catch (execError) {
      console.error('Backup execution error:', execError)
      
      // Record failed backup
      await db.backupRecord.create({
        data: {
          filename,
          filePath,
          fileSize: 0,
          backupType: 'manual',
          status: 'failed'
        }
      })

      throw new Error('Failed to create backup file')
    }
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create backup'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get all backup records
    const backups = await db.backupRecord.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      backups: backups.map(backup => ({
        id: backup.id,
        filename: backup.filename,
        fileSize: backup.fileSize,
        backupType: backup.backupType,
        status: backup.status,
        createdAt: backup.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching backups:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch backups'
      },
      { status: 500 }
    )
  }
}