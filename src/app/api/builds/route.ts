import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllBuilds, createBuild } from '@/lib/database'
import { CreateBuildData } from '@/types/albion'

// GET /api/builds - Tüm build'leri getir
export async function GET() {
  try {
    console.log('API: GET /api/builds called')
    
    const builds = await getAllBuilds()
    
    console.log('API: Builds fetched successfully, count:', builds.length)
    
    return NextResponse.json(builds)
  } catch (error) {
    console.error('API: Error fetching builds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch builds' },
      { status: 500 }
    )
  }
}

// POST /api/builds - Yeni build oluştur
export async function POST(request: NextRequest) {
  try {
    console.log('API: POST /api/builds called')
    
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
    const buildData: CreateBuildData = {
      name: body.name,
      description: body.description,
      contentType: body.contentType,
      weaponType: body.weaponType,
      skills: body.skills || []
    }

    console.log('API: Build data received:', {
      name: buildData.name,
      contentType: buildData.contentType,
      weaponType: buildData.weaponType,
      skillsCount: buildData.skills.length
    })

    // Validasyon
    if (!buildData.name || !buildData.contentType || !buildData.weaponType) {
      console.log('API: Validation failed - missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: name, contentType, weaponType' },
        { status: 400 }
      )
    }

    // Build'i oluştur
    const newBuild = await createBuild(buildData, session.user.discordId)
    
    if (!newBuild) {
      console.error('API: Failed to create build')
      return NextResponse.json(
        { error: 'Failed to create build' },
        { status: 500 }
      )
    }

    console.log('API: Build created successfully, ID:', newBuild.id)
    
    return NextResponse.json(newBuild, { status: 201 })
  } catch (error) {
    console.error('API: Error creating build:', error)
    return NextResponse.json(
      { error: 'Failed to create build' },
      { status: 500 }
    )
  }
} 