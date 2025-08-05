import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllTables, createBlackMarketTable } from '@/lib/database'

export async function GET() {
  try {
    // Debug için log'lar ekle
    if (process.env.NODE_ENV === 'development') {
      console.log('API: GET /api/tables called')
    }

    const tables = await getAllTables()
    
    if (process.env.NODE_ENV === 'development') {
      console.log('API: getAllTables result:', {
        count: tables.length,
        tables: tables.map(t => ({ id: t.id, name: t.name, creator: t.creator }))
      })
    }

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
      if (process.env.NODE_ENV === 'development') {
        console.log('POST: No session or discordId found')
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, password, items } = body

    // Sadece development'ta log
    if (process.env.NODE_ENV === 'development') {
      console.log('POST: Creating table with data:', {
        name,
        password: password ? '***' : null,
        itemsCount: items?.length || 0,
        userId: session.user.discordId,
        sessionUser: session.user
      })
    }

    // Environment variables kontrolü
    if (process.env.NODE_ENV === 'development') {
      console.log('POST: Environment check:')
      console.log('  - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
      console.log('  - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
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
    if (process.env.NODE_ENV === 'development') {
      console.log('POST: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      })
    }
    return NextResponse.json(
      { error: 'Failed to create table', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 