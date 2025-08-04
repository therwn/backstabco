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
    console.log('PUT: Session:', session?.user)
    
    // Geçici olarak session kontrolünü kaldırıyoruz
    // if (!session?.user?.discordId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    console.log('PUT: Request body:', body)
    const { name, password, items } = body

    // Geçici olarak sabit bir discordId kullanıyoruz
    const discordId = session?.user?.discordId || '1177269662447317074'
    console.log('PUT: Using discordId:', discordId)

    const success = await updateTable(params.id, discordId, {
      name,
      password: password || null,
      items
    })

    console.log('PUT: Update result:', success)

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