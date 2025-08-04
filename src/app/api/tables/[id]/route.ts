import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteTable } from '@/lib/database'

// DELETE: Tablo sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.discordId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tableId = parseInt(params.id)
    if (isNaN(tableId)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 })
    }

    const success = await deleteTable(tableId, session.user.discordId)
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Tablo başarıyla silindi'
      })
    } else {
      return NextResponse.json(
        { error: 'Tablo bulunamadı veya silme yetkiniz yok' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 