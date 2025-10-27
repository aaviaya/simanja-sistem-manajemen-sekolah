import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

export async function POST(request: NextRequest) {
  try {
    const { backupId } = await request.json()
    
    if (!backupId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Backup ID is required'
        },
        { status: 400 }
      )
    }

    // Get backup record
    const backupRecord = await db.backupRecord.findUnique({
      where: { id: backupId }
    })

    if (!backupRecord) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Backup not found'
        },
        { status: 404 }
      )
    }

    // Check if backup file exists
    if (!fs.existsSync(backupRecord.filePath)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Backup file not found'
        },
        { status: 404 }
      )
    }

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Extract database file path from URL
    const targetDbPath = databaseUrl.replace('file:', '')

    // Create a temporary backup of current database before restore
    const tempBackupPath = path.join(path.dirname(targetDbPath), 'temp-before-restore.db')
    try {
      if (fs.existsSync(targetDbPath)) {
        fs.copyFileSync(targetDbPath, tempBackupPath)
      }
    } catch (error) {
      console.error('Failed to create temporary backup:', error)
      // Continue with restore even if temp backup fails
    }

    try {
      // Open backup database
      const backupDb = await open({
        filename: backupRecord.filePath,
        driver: sqlite3.Database
      })

      // Get all table names from backup
      const tables = await backupDb.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")

      // Delete existing database file and create new one
      if (fs.existsSync(targetDbPath)) {
        fs.unlinkSync(targetDbPath)
      }

      // Create new target database
      const targetDb = await open({
        filename: targetDbPath,
        driver: sqlite3.Database
      })

      // Enable foreign keys
      await targetDb.exec('PRAGMA foreign_keys = ON')

      // Restore each table
      for (const table of tables) {
        const tableName = table.name
        
        // Get table schema from backup
        const schema = await backupDb.all(`PRAGMA table_info(${tableName})`)
        
        // Create table in target database
        const columns = schema.map(col => `${col.name} ${col.type}`).join(', ')
        await targetDb.exec(`CREATE TABLE ${tableName} (${columns})`)

        // Copy data from backup to target
        const rows = await backupDb.all(`SELECT * FROM ${tableName}`)
        for (const row of rows) {
          const columns = Object.keys(row).join(', ')
          const placeholders = Object.keys(row).map(() => '?').join(', ')
          const values = Object.values(row)
          
          await targetDb.run(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`, values)
        }
      }

      // Close databases
      await backupDb.close()
      await targetDb.close()
      
      return NextResponse.json({
        success: true,
        message: 'Database restored successfully',
        backup: {
          id: backupRecord.id,
          filename: backupRecord.filename,
          restoredAt: new Date().toISOString()
        }
      })
    } catch (execError) {
      console.error('Restore execution error:', execError)
      
      // Try to restore from temporary backup if it exists
      if (fs.existsSync(tempBackupPath)) {
        try {
          if (fs.existsSync(targetDbPath)) {
            fs.unlinkSync(targetDbPath)
          }
          fs.copyFileSync(tempBackupPath, targetDbPath)
          console.log('Restored from temporary backup')
        } catch (restoreError) {
          console.error('Failed to restore from temporary backup:', restoreError)
        }
      }

      throw new Error('Failed to restore database')
    } finally {
      // Clean up temporary backup file
      if (fs.existsSync(tempBackupPath)) {
        fs.unlinkSync(tempBackupPath)
      }
    }
  } catch (error) {
    console.error('Restore error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to restore database'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get all available backup records
    const backups = await db.backupRecord.findMany({
      where: { status: 'completed' },
      orderBy: { createdAt: 'desc' }
    })

    // Check which backup files actually exist
    const availableBackups = backups.filter(backup => 
      fs.existsSync(backup.filePath)
    )

    return NextResponse.json({
      success: true,
      backups: availableBackups.map(backup => ({
        id: backup.id,
        filename: backup.filename,
        fileSize: backup.fileSize,
        backupType: backup.backupType,
        status: backup.status,
        createdAt: backup.createdAt,
        fileExists: fs.existsSync(backup.filePath)
      }))
    })
  } catch (error) {
    console.error('Error fetching restore options:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch restore options'
      },
      { status: 500 }
    )
  }
}