import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Find admin user (for demo, we'll use hardcoded credentials)
    // In production, you should hash passwords and store them in database
    const adminUser = await db.user.findFirst({
      where: {
        email,
        role: 'admin'
      }
    })

    // For demo purposes, create default admin if not exists
    if (!adminUser && email === 'admin@shb.sch.id' && password === 'admin123') {
      const newAdmin = await db.user.create({
        data: {
          email: 'admin@shb.sch.id',
          name: 'Administrator',
          role: 'admin'
        }
      })

      // Generate simple token (UUID)
      const token = randomUUID()

      return NextResponse.json({
        message: 'Login berhasil',
        token,
        user: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role
        }
      })
    }

    // If admin exists, verify password (simplified for demo)
    if (adminUser && email === 'admin@shb.sch.id' && password === 'admin123') {
      // Generate simple token (UUID)
      const token = randomUUID()

      return NextResponse.json({
        message: 'Login berhasil',
        token,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        }
      })
    }

    return NextResponse.json(
      { error: 'Email atau password salah' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}