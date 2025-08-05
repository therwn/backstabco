import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllTables, createBlackMarketTable } from '@/lib/database'

export async function GET() {
  try {
    // Tablo listesi herkese açık olmalı
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.discordId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

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

    const { name, password, items } = await request.json()

    // Sadece development'ta log
    if (process.env.NODE_ENV === 'development') {
      console.log('POST: Creating table with data:', {
        name,
        password: password ? '***' : null,
        itemsCount: items?.length || 0,
        userId: session.user.discordId
      })
    }

    const tableId = await createBlackMarketTable(
      name,
      password,
      items,
      session.user.discordId
    )

    if (process.env.NODE_ENV === 'development') {
      console.log('POST: Table created successfully:', tableId)
    }

    return NextResponse.json({ 
      success: true, 
      tableId: tableId.id,
      message: 'Table created successfully' 
    })

  } catch (error) {
    console.error('POST table creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create table', details: error },
      { status: 500 }
    )
  }
} 