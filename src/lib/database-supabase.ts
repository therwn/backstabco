import { createClient } from '@supabase/supabase-js'
import { BlackMarketTable, BlackMarketItem } from '@/types/albion'

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Database tablolarını oluştur
export async function createTables() {
  try {
    // Black Market tabloları
    await supabase.rpc('create_black_market_tables')
    console.log('Database tabloları başarıyla oluşturuldu')
  } catch (error) {
    console.error('Database tabloları oluşturulurken hata:', error)
    throw error
  }
}

// Yeni tablo oluştur
export async function createBlackMarketTable(
  name: string,
  password: string | null,
  creatorId: string,
  creatorName: string,
  items: BlackMarketItem[]
): Promise<number> {
  try {
    // Ana tablo oluştur
    const { data: tableData, error: tableError } = await supabase
      .from('black_market_tables')
      .insert({
        name,
        password,
        creator_id: creatorId,
        creator_name: creatorName
      })
      .select()
      .single()

    if (tableError) throw tableError

    const tableId = tableData.id

    // Item'ları ekle
    for (const item of items) {
      const { data: itemData, error: itemError } = await supabase
        .from('black_market_items')
        .insert({
          table_id: tableId,
          item_id: item.id,
          item_name: item.itemName,
          item_tier: item.itemTier,
          item_enchantment: item.itemEnchantment,
          item_quality: item.itemQuality,
          buy_price: item.buyPrice,
          buy_quantity: item.buyQuantity
        })
        .select()
        .single()

      if (itemError) throw itemError

      const itemId = itemData.id

      // Şehir fiyatlarını ekle
      for (const cityPrice of item.cityPrices) {
        await supabase
          .from('city_prices')
          .insert({
            item_id: itemId,
            city: cityPrice.city,
            sell_order: cityPrice.sellOrder,
            buy_order: cityPrice.buyOrder,
            quantity: cityPrice.quantity,
            quality: cityPrice.quality
          })
      }
    }

    return tableId
  } catch (error) {
    console.error('Tablo oluşturulurken hata:', error)
    throw error
  }
}

// Kullanıcının tablolarını getir
export async function getUserTables(userId: string): Promise<BlackMarketTable[]> {
  try {
    const { data, error } = await supabase
      .from('black_market_tables')
      .select(`
        *,
        black_market_items (count)
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(row => ({
      id: row.id.toString(),
      name: row.name,
      password: row.password,
      creator: row.creator_name,
      createdAt: new Date(row.created_at),
      items: []
    }))
  } catch (error) {
    console.error('Kullanıcı tabloları getirilirken hata:', error)
    return []
  }
}

// Tablo detaylarını getir
export async function getTableDetails(tableId: number): Promise<BlackMarketTable | null> {
  try {
    // Tablo bilgileri
    const { data: tableData, error: tableError } = await supabase
      .from('black_market_tables')
      .select('*')
      .eq('id', tableId)
      .single()

    if (tableError || !tableData) return null

    // Item'ları getir
    const { data: itemsData, error: itemsError } = await supabase
      .from('black_market_items')
      .select(`
        *,
        city_prices (*)
      `)
      .eq('table_id', tableId)

    if (itemsError) throw itemsError

    const items: BlackMarketItem[] = itemsData.map(row => ({
      id: row.item_id,
      itemName: row.item_name,
      itemTier: row.item_tier,
      itemEnchantment: row.item_enchantment,
      itemQuality: row.item_quality,
      buyPrice: row.buy_price,
      buyQuantity: row.buy_quantity,
      cityPrices: row.city_prices || []
    }))

    return {
      id: tableData.id.toString(),
      name: tableData.name,
      password: tableData.password,
      creator: tableData.creator_name,
      createdAt: new Date(tableData.created_at),
      items
    }
  } catch (error) {
    console.error('Tablo detayları getirilirken hata:', error)
    return null
  }
}

// Tablo sil
export async function deleteTable(tableId: number, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('black_market_tables')
      .delete()
      .eq('id', tableId)
      .eq('creator_id', userId)

    return !error
  } catch (error) {
    console.error('Tablo silinirken hata:', error)
    return false
  }
} 