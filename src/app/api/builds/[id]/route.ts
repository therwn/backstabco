import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBuildById, updateBuild, deleteBuild } from '@/lib/database'
import { UpdateBuildData } from '@/types/albion'

// GET /api/builds/[id] - Tekil build getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API: GET /api/builds/[id] called with ID:', params.id)
    
    const build = await getBuildById(params.id)
    
    if (!build) {
      console.log('API: Build not found for ID:', params.id)
      return NextResponse.json(
        { error: 'Build not found' },
        { status: 404 }
      )
    }

    console.log('API: Build fetched successfully:', build.id)
    
    return NextResponse.json(build)
  } catch (error) {
    console.error('API: Error fetching build:', error)
    return NextResponse.json(
      { error: 'Failed to fetch build' },
      { status: 500 }
    )
  }
}

// PUT /api/builds/[id] - Build güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API: PUT /api/builds/[id] called with ID:', params.id)
    
    // Session kontrolü
    const session = await getServerSession(authOptions)
    if (!session?.user?.discordId) {
      console.log('API: Unauthorized - no session or discordId')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Request body'yi parse et
    const body = await request.json()
    const updateData: UpdateBuildData = {
      name: body.name,
      description: body.description,
      contentType: body.contentType,
      weaponType: body.weaponType,
      skills: body.skills
    }

    console.log('API: Update data received:', {
      name: updateData.name,
      contentType: updateData.contentType,
      weaponType: updateData.weaponType,
      skillsCount: updateData.skills?.length || 0
    })

    // Build'i güncelle
    const success = await updateBuild(params.id, updateData, session.user.discordId)
    
    if (!success) {
      console.error('API: Failed to update build')
      return NextResponse.json(
        { error: 'Failed to update build or unauthorized' },
        { status: 400 }
      )
    }

    console.log('API: Build updated successfully, ID:', params.id)
    
    // Güncellenmiş build'i döndür
    const updatedBuild = await getBuildById(params.id)
    return NextResponse.json(updatedBuild)
  } catch (error) {
    console.error('API: Error updating build:', error)
    return NextResponse.json(
      { error: 'Failed to update build' },
      { status: 500 }
    )
  }
}

// DELETE /api/builds/[id] - Build sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API: DELETE /api/builds/[id] called with ID:', params.id)
    
    // Session kontrolü
    const session = await getServerSession(authOptions)
    if (!session?.user?.discordId) {
      console.log('API: Unauthorized - no session or discordId')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Build'i sil
    const success = await deleteBuild(params.id, session.user.discordId)
    
    if (!success) {
      console.error('API: Failed to delete build')
      return NextResponse.json(
        { error: 'Failed to delete build or unauthorized' },
        { status: 400 }
      )
    }

    console.log('API: Build deleted successfully, ID:', params.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API: Error deleting build:', error)
    return NextResponse.json(
      { error: 'Failed to delete build' },
      { status: 500 }
    )
  }
} 