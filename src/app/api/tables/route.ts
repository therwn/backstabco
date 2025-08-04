import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllTables, createBlackMarketTable } from '@/lib/database'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tables = await getAllTables()
    return NextResponse.json(tables)
  } catch (error) {
    console.error('GET tables error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, password, items } = body

    if (!name || !items || items.length === 0) {
      return NextResponse.json({ error: 'Name and items are required' }, { status: 400 })
    }

    const tableId = await createBlackMarketTable(
      name,
      password || null,
      session.user.discordId,
      items
    )

    return NextResponse.json({ success: true, tableId })
  } catch (error) {
    console.error('POST table creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 