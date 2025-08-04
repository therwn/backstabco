import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createBlackMarketTable, getUserTables } from '@/lib/database'

// GET: Kullanıcının tablolarını getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tables = await getUserTables(session.user.discordId)
    return NextResponse.json(tables)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Yeni tablo oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, password, items } = body

    if (!name || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Name and items are required' },
        { status: 400 }
      )
    }

    const tableId = await createBlackMarketTable(
      name,
      password || null,
      session.user.discordId,
      session.user.name || 'Unknown',
      items
    )

    return NextResponse.json({ 
      success: true, 
      tableId,
      message: 'Tablo başarıyla oluşturuldu'
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 