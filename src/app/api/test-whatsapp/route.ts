import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, phoneNumber, sender } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'API Key Wanotif diperlukan' },
        { status: 400 }
      )
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Nomor telepon diperlukan' },
        { status: 400 }
      )
    }

    // Gunakan default sender jika tidak ada
    const defaultSender = sender || '085880026526'

    // Format nomor telepon untuk API (tambah +62 jika belum ada)
    let formattedPhone = phoneNumber
    if (phoneNumber.startsWith('08')) {
      formattedPhone = '+62' + phoneNumber.substring(1)
    } else if (phoneNumber.startsWith('62')) {
      formattedPhone = '+' + phoneNumber
    }

    // Remove + untuk API format recipient (pakai 62)
    const apiPhone = formattedPhone.replace('+', '')

    // API Key yang valid (bukan demo mode lagi)
    if (token === 'eMMXyUOOZVOglu1KagplOHvd7jHJZ5') {
      console.log('Using valid API key for real WhatsApp sending')
    }

    try {
      // Kirim pesan via Wanotif API dengan sender utama (terdaftar)
      const messageResponse = await fetch(`https://wanotif.shb.sch.id/send-message?api_key=${token}&sender=${defaultSender}&number=${apiPhone}&message=Hello%20World%20-%20Test%20dari%20Admin%20Panel`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      const messageData = await messageResponse.json()

      // Jika gagal dengan sender utama, coba dengan sender fallback
      if (!messageResponse.ok || messageData.status === false) {
        console.log('Trying with fallback sender...')
        const fallbackSender = defaultSender === '085880026526' ? '08123456789' : '085880026526'
        const fallbackResponse = await fetch(`https://wanotif.shb.sch.id/send-message?api_key=${token}&sender=${fallbackSender}&number=${apiPhone}&message=Hello%20World%20-%20Test%20dari%20Admin%20Panel`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        
        const fallbackData = await fallbackResponse.json()
        
        if (fallbackResponse.ok && fallbackData.status === true) {
          console.log('Wanotif message sent successfully with fallback sender:', fallbackData)
          return NextResponse.json({
            success: true,
            message: `✅ Pesan WhatsApp berhasil dikirim ke ${phoneNumber} via Wanotif!`,
            phoneNumber: phoneNumber,
            sender: fallbackSender,
            apiResponse: fallbackData,
            status: 'active',
            provider: 'wanotif.shb.sch.id (Fallback Sender)'
          })
        } else {
          console.error('Wanotif API failed with both senders:', messageData, fallbackData)
          return NextResponse.json({
            success: false,
            error: `API Key tidak valid atau sender tidak terdaftar: ${messageData.msg || fallbackData.msg || 'Unknown error'}`,
            details: { primary: messageData, fallback: fallbackData },
            status: 'error'
          }, { status: 400 })
        }
      }

      console.log('Wanotif message sent successfully:', messageData)

      return NextResponse.json({
        success: true,
        message: `✅ Pesan WhatsApp berhasil dikirim ke ${phoneNumber} via Wanotif!`,
        phoneNumber: phoneNumber,
        sender: defaultSender,
        apiResponse: messageData,
        status: 'active',
        provider: 'wanotif.shb.sch.id (Primary Sender)'
      })

    } catch (fetchError) {
      console.error('Network error:', fetchError)
      return NextResponse.json({
        success: false,
        error: 'Gagal terhubung ke Wanotif API. Periksa koneksi internet.',
        status: 'error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Wanotif API test error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menguji koneksi Wanotif API' },
      { status: 500 }
    )
  }
}