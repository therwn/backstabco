import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTableDetails, deleteTable } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tableId = params.id
    const tableDetails = await getTableDetails(tableId, session.user.email)

    if (!tableDetails) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    return NextResponse.json(tableDetails)
  } catch (error) {
    console.error('GET /api/tables/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tableId = params.id
    const success = await deleteTable(tableId, session.user.email)

    if (!success) {
      return NextResponse.json({ error: 'Table not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/tables/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 