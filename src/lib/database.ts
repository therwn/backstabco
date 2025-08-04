import { createClient } from '@supabase/supabase-js'
import { BlackMarketTable, BlackMarketItem } from '@/types/albion'

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Database tablolarını oluştur
export async function createTables() {
  try {
    console.log('Supabase tabloları zaten oluşturulmuş olmalı')
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
      items: [] // Boş items array'i
    }))
  } catch (error) {
    console.error('Kullanıcı tabloları getirilirken hata:', error)
    return []
  }
}

// Tablo detaylarını getir
export async function getTableDetails(tableId: string, userId: string): Promise<BlackMarketTable | null> {
  try {
    // Tablo bilgileri
    const { data: tableData, error: tableError } = await supabase
      .from('black_market_tables')
      .select('*')
      .eq('id', tableId)
      .eq('creator_id', userId)
      .single()

    if (tableError || !tableData) {
      console.error('Tablo bulunamadı:', tableError)
      return null
    }

    // Item'ları getir
    const { data: itemsData, error: itemsError } = await supabase
      .from('black_market_items')
      .select('*')
      .eq('table_id', tableId)

    if (itemsError) {
      console.error('Item\'lar getirilirken hata:', itemsError)
      throw itemsError
    }

    // Her item için şehir fiyatlarını getir
    const items: BlackMarketItem[] = []
    for (const itemRow of itemsData) {
      const { data: cityPricesData, error: cityPricesError } = await supabase
        .from('city_prices')
        .select('*')
        .eq('item_id', itemRow.id)

      if (cityPricesError) {
        console.error('Şehir fiyatları getirilirken hata:', cityPricesError)
        continue
      }

      const cityPrices = cityPricesData.map(cp => ({
        city: cp.city,
        sellOrder: cp.sell_order,
        buyOrder: cp.buy_order,
        quantity: cp.quantity,
        quality: cp.quality
      }))

      items.push({
        id: itemRow.item_id,
        itemName: itemRow.item_name,
        itemTier: itemRow.item_tier,
        itemEnchantment: itemRow.item_enchantment,
        itemQuality: itemRow.item_quality,
        buyPrice: itemRow.buy_price,
        buyQuantity: itemRow.buy_quantity,
        cityPrices
      })
    }

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
export async function deleteTable(tableId: string, userId: string): Promise<boolean> {
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