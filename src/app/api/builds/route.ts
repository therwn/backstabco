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
    
    // Check environment variables
    console.log('API: Environment check - NODE_ENV:', process.env.NODE_ENV)
    console.log('API: Environment check - SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
    console.log('API: Environment check - SUPABASE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.discordId) {
      console.log('API: Unauthorized - no session or discordId')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('API: User authenticated - discordId:', session.user.discordId)

    const body = await request.json()
    const buildData: CreateBuildData = {
      title: body.title,
      category: body.category,
      tags: body.tags || [],
      description: body.description,
      equipment: body.equipment || {},
      consumables: body.consumables || {},
      spells: body.spells || {}
    }

    console.log('API: Build data received:', {
      title: buildData.title,
      category: buildData.category,
      tags: buildData.tags,
      equipmentKeys: Object.keys(buildData.equipment || {}),
      consumablesKeys: Object.keys(buildData.consumables || {}),
      spellsKeys: Object.keys(buildData.spells || {})
    })

    if (!buildData.title || !buildData.category) {
      console.log('API: Validation failed - missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields: title, category' },
        { status: 400 }
      )
    }

    console.log('API: Calling createBuild function...')
    const newBuild = await createBuild(buildData, session.user.discordId)
    
    if (!newBuild) {
      console.error('API: createBuild returned null')
      return NextResponse.json(
        { error: 'Failed to create build - database error' },
        { status: 500 }
      )
    }

    console.log('API: Build created successfully, ID:', newBuild.id)
    return NextResponse.json(newBuild, { status: 201 })
  } catch (error) {
    console.error('API: Error creating build:', error)
    console.error('API: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to create build' },
      { status: 500 }
    )
  }
} 