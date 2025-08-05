import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTableDetails, deleteTable, updateTable } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Debug için log'lar ekle
    if (process.env.NODE_ENV === 'development') {
      console.log('GET: Requesting table ID:', params.id)
      console.log('GET: Table ID type:', typeof params.id)
      console.log('GET: Table ID value:', params.id)
      console.log('GET: Environment variables check:')
      console.log('  - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
      console.log('  - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
    }

    // Tablo görüntüleme için authentication gerekli değil - herkese açık
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.discordId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const tableDetails = await getTableDetails(params.id)
    
    if (process.env.NODE_ENV === 'development') {
      console.log('GET: Table details result:', tableDetails ? 'Found' : 'Not found')
      if (tableDetails) {
        console.log('GET: Table details:', {
          id: tableDetails.id,
          name: tableDetails.name,
          itemsCount: tableDetails.items?.length || 0
        })
      }
    }
    
    if (!tableDetails) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    return NextResponse.json(tableDetails)
  } catch (error) {
    console.error('GET table details error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Authentication kontrolü - düzenleme için gerekli
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, password, items } = body

    // Sadece development'ta log
    if (process.env.NODE_ENV === 'development') {
      console.log('PUT: Session:', session?.user)
      console.log('PUT: User role:', session.user.role)
      console.log('PUT: Request body:', body)
      console.log('PUT: Using discordId:', session.user.discordId)
    }

    // Admin kontrolü - admin kullanıcılar tüm tabloları düzenleyebilir
    const isAdmin = session.user.role === 'admin'
    
    if (process.env.NODE_ENV === 'development') {
      console.log('PUT: Is admin:', isAdmin)
    }

    const success = await updateTable(params.id, session.user.discordId, {
      name,
      password: password || null,
      items
    }, isAdmin) // Admin yetkisi parametresi ekle

    if (process.env.NODE_ENV === 'development') {
      console.log('PUT: Update result:', success)
    }

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Table not found or unauthorized' }, { status: 404 })
    }
  } catch (error) {
    console.error('PUT table update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Authentication kontrolü - silme için gerekli
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin kontrolü - admin kullanıcılar tüm tabloları silebilir
    const isAdmin = session.user.role === 'admin'
    
    if (process.env.NODE_ENV === 'development') {
      console.log('DELETE: User role:', session.user.role)
      console.log('DELETE: Is admin:', isAdmin)
    }

    const success = await deleteTable(params.id, session.user.discordId, isAdmin) // Admin yetkisi parametresi ekle
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Table not found or unauthorized' }, { status: 404 })
    }
  } catch (error) {
    console.error('DELETE table error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 