import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' }
})

export async function GET() {
  try {
    // Tablo yapısını kontrol et
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'black_market_tables')
      .eq('table_schema', 'public')

    if (tableError) {
      return NextResponse.json({ error: 'Error getting table info', details: tableError }, { status: 500 })
    }

    // Mevcut tabloları da kontrol et
    const { data: tables, error: tablesError } = await supabase
      .from('black_market_tables')
      .select('*')
      .limit(5)

    return NextResponse.json({
      tableStructure: tableInfo,
      existingTables: tables,
      tableError: tablesError
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 })
  }
} 