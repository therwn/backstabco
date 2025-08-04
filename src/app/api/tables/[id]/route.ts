import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTableDetails, deleteTable, updateTable } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API: GET table details for ID:', params.id)
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.discordId) {
      console.log('API: Unauthorized - no session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Fetching table details from database')
    const tableDetails = await getTableDetails(params.id)
    console.log('API: Table details result:', tableDetails ? 'found' : 'not found')
    
    if (!tableDetails) {
      console.log('API: Table not found')
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    console.log('API: Returning table details')
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
    
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, password, items } = body

    const success = await updateTable(params.id, session.user.discordId, {
      name,
      password: password || null,
      items
    })

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