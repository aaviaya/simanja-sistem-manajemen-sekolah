import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data, targetNumber } = body

    // Check if WhatsApp is enabled from database settings
    const settings = await db.systemSettings.findFirst()
    const whatsappEnabled = settings?.whatsappEnabled || false
    
    console.log('WhatsApp settings from DB:', { 
      whatsappEnabled, 
      settings: settings ? 'found' : 'not found',
      whatsappEnabledFromDb: settings?.whatsappEnabled 
    })
    
    if (!whatsappEnabled) {
      console.log('WhatsApp service is not enabled in database')
      return NextResponse.json(
        { error: 'WhatsApp service is not enabled' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type and data' },
        { status: 400 }
      )
    }

    // Create message based on type
    let message = ''
    
    if (type === 'document') {
      message = `📄 *INFORMASI DOKUMEN ${data.docNumber}*\n\n` +
                `📋 *Judul:* ${data.title}\n` +
                `📁 *Kategori:* ${data.category}\n` +
                `✅ *Status:* ${data.status}\n` +
                `📅 *Tanggal Terbit:* ${data.issuedDate || '-'}\n` +
                `👤 *Diterbitkan oleh:* ${data.issuedBy || '-'}\n\n` +
                `📱 Sistem Dokumen Sekolah`
    } else {
      return NextResponse.json(
        { error: 'Unsupported notification type' },
        { status: 400 }
      )
    }

    // Get WhatsApp configuration from database settings
    const whatsappApiToken = settings?.whatsappApiToken || process.env.WHATSAPP_API_TOKEN
    const whatsappSender = settings?.whatsappSender || process.env.WHATSAPP_SENDER
    // Use custom target number from request, fallback to environment variable
    const whatsappTargetNumber = targetNumber || process.env.WHATSAPP_TARGET_NUMBER

    console.log('WhatsApp configuration:', {
      apiToken: whatsappApiToken ? 'present' : 'missing',
      sender: whatsappSender || 'missing',
      targetNumber: whatsappTargetNumber || 'missing',
      apiTokenFromDb: settings?.whatsappApiToken ? 'present' : 'missing',
      senderFromDb: settings?.whatsappSender ? 'present' : 'missing'
    })

    if (!whatsappApiToken || !whatsappSender || !whatsappTargetNumber) {
      console.log('WhatsApp configuration is incomplete')
      return NextResponse.json(
        { error: 'WhatsApp configuration is incomplete' },
        { status: 400 }
      )
    }

    try {
      // Format target phone number for API - only support 0812xxxxxxx format
      let formattedPhone = whatsappTargetNumber
      
      // Only handle numbers starting with 08
      if (whatsappTargetNumber.startsWith('08')) {
        formattedPhone = '+62' + whatsappTargetNumber.substring(1)
      } else if (whatsappTargetNumber.startsWith('+62')) {
        // If already in international format, use as is
        formattedPhone = whatsappTargetNumber
      } else if (whatsappTargetNumber.startsWith('62')) {
        // If starting with 62 without +, add +
        formattedPhone = '+' + whatsappTargetNumber
      } else {
        return NextResponse.json(
          { error: 'Invalid phone number format. Please use format: 0812xxxxxxx' },
          { status: 400 }
        )
      }

      // Remove + for API format recipient (use 62)
      const apiPhone = formattedPhone.replace('+', '')

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message)

      // Send WhatsApp notification via Wanotif API
      const wanotifResponse = await fetch(`https://wanotif.shb.sch.id/send-message?api_key=${whatsappApiToken}&sender=${whatsappSender}&number=${apiPhone}&message=${encodedMessage}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      const wanotifData = await wanotifResponse.json()

      if (!wanotifResponse.ok || wanotifData.status === false) {
        console.error('Wanotif API failed:', wanotifData)
        return NextResponse.json(
          { error: `Failed to send WhatsApp notification: ${wanotifData.msg || 'Unknown error'}` },
          { status: 500 }
        )
      }

      console.log('WhatsApp notification sent successfully:', wanotifData)

      return NextResponse.json({
        success: true,
        message: 'WhatsApp notification sent successfully',
        data: {
          type,
          recipient: whatsappTargetNumber,
          message,
          provider: 'wanotif.shb.sch.id',
          apiResponse: wanotifData
        }
      })

    } catch (fetchError) {
      console.error('Network error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to connect to WhatsApp API. Please check internet connection.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error)
    return NextResponse.json(
      { error: 'Failed to send WhatsApp notification' },
      { status: 500 }
    )
  }
}