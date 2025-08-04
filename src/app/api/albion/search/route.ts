import { NextRequest, NextResponse } from 'next/server'
import { searchItems, fetchItems } from '@/lib/albion-api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')

    if (!query && !category) {
      // Tüm item'ları döndür
      const items = await fetchItems()
      return NextResponse.json(items.slice(0, 50)) // İlk 50 item
    }

    if (query) {
      // Arama yap
      const items = await searchItems(query)
      return NextResponse.json(items.slice(0, 20)) // İlk 20 sonuç
    }

    if (category) {
      // Kategoriye göre filtrele
      const allItems = await fetchItems()
      const filteredItems = allItems.filter(item => 
        item.category === category
      )
      return NextResponse.json(filteredItems.slice(0, 20))
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 