import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('TEST: Starting database connection test')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('TEST: Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET')
    console.log('TEST: Supabase Service Key:', supabaseServiceKey ? 'SET' : 'NOT SET')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('TEST: Missing Supabase environment variables')
      return NextResponse.json({ 
        error: 'Missing Supabase environment variables',
        url: supabaseUrl ? 'SET' : 'NOT SET',
        key: supabaseServiceKey ? 'SET' : 'NOT SET'
      }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    console.log('TEST: Supabase client created')
    
    // Test database connection
    const { data, error } = await supabase
      .from('black_market_tables')
      .select('count')
      .limit(1)
    
    console.log('TEST: Database query result:', { data, error })
    
    if (error) {
      console.error('TEST: Database connection failed:', error)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('TEST: Database connection successful')
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      data: data
    })
    
  } catch (error) {
    console.error('TEST: Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 