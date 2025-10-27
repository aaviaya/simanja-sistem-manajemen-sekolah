import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get settings from database
    const settings = await db.systemSettings.findFirst()
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        whatsappEnabled: false,
        whatsappApiToken: '',
        whatsappSender: '',
        autoBackupEnabled: false,
        backupSchedule: 'daily'
      })
    }

    return NextResponse.json({
      whatsappEnabled: settings.whatsappEnabled,
      whatsappApiToken: settings.whatsappApiToken,
      whatsappSender: settings.whatsappSender,
      autoBackupEnabled: settings.autoBackupEnabled,
      backupSchedule: settings.backupSchedule
    })
  } catch (error) {
    console.error('Error fetching system settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      whatsappEnabled,
      whatsappApiToken,
      whatsappSender,
      autoBackupEnabled,
      backupSchedule
    } = body

    // Check if settings exist
    const existingSettings = await db.systemSettings.findFirst()

    if (existingSettings) {
      // Update existing settings
      const updatedSettings = await db.systemSettings.update({
        where: { id: existingSettings.id },
        data: {
          whatsappEnabled: whatsappEnabled ?? false,
          whatsappApiToken: whatsappApiToken || '',
          whatsappSender: whatsappSender || '',
          autoBackupEnabled: autoBackupEnabled ?? false,
          backupSchedule: backupSchedule || 'daily'
        }
      })

      return NextResponse.json({
        whatsappEnabled: updatedSettings.whatsappEnabled,
        whatsappApiToken: updatedSettings.whatsappApiToken,
        whatsappSender: updatedSettings.whatsappSender,
        autoBackupEnabled: updatedSettings.autoBackupEnabled,
        backupSchedule: updatedSettings.backupSchedule
      })
    } else {
      // Create new settings
      const newSettings = await db.systemSettings.create({
        data: {
          whatsappEnabled: whatsappEnabled ?? false,
          whatsappApiToken: whatsappApiToken || '',
          whatsappSender: whatsappSender || '',
          autoBackupEnabled: autoBackupEnabled ?? false,
          backupSchedule: backupSchedule || 'daily'
        }
      })

      return NextResponse.json({
        whatsappEnabled: newSettings.whatsappEnabled,
        whatsappApiToken: newSettings.whatsappApiToken,
        whatsappSender: newSettings.whatsappSender,
        autoBackupEnabled: newSettings.autoBackupEnabled,
        backupSchedule: newSettings.backupSchedule
      })
    }
  } catch (error) {
    console.error('Error updating system settings:', error)
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    )
  }
}