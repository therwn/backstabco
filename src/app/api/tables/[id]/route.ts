import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTableDetails, deleteTable, updateTable } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Tablo görüntüleme için authentication gerekli
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tableDetails = await getTableDetails(params.id)
    
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
      console.log('PUT: Request body:', body)
      console.log('PUT: Using discordId:', session.user.discordId)
    }

    const success = await updateTable(params.id, session.user.discordId, {
      name,
      password: password || null,
      items
    })

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

    const success = await deleteTable(params.id, session.user.discordId)
    
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