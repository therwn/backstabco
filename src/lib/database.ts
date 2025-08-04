import { createClient } from '@supabase/supabase-js'
import { BlackMarketTable } from '@/types/albion'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function createTables() {
  const { error } = await supabase.rpc('create_tables_if_not_exists')
  if (error) {
    console.error('Error creating tables:', error)
    throw error
  }
}

export async function createBlackMarketTable(
  name: string,
  password: string | null,
  creatorId: string,
  items: any[]
): Promise<string> {
  try {
    // Ana tablo oluştur
    const { data: tableData, error: tableError } = await supabase
      .from('black_market_tables')
      .insert({
        name,
        password,
        creator_id: creatorId
      })
      .select()
      .single()

    if (tableError) {
      console.error('Error creating table:', tableError)
      throw tableError
    }

    const tableId = tableData.id

    // Item'ları ekle
    for (const item of items) {
      const { error: itemError } = await supabase
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

      if (itemError) {
        console.error('Error creating item:', itemError)
        throw itemError
      }

      // Item'ın city price'larını ekle
      if (item.cityPrices && item.cityPrices.length > 0) {
        for (const cityPrice of item.cityPrices) {
          const { error: cityError } = await supabase
            .from('city_prices')
            .insert({
              table_id: tableId,
              item_id: item.id,
              city: cityPrice.city,
              sell_order: cityPrice.sellOrder,
              buy_order: cityPrice.buyOrder,
              quantity: cityPrice.quantity
            })

          if (cityError) {
            console.error('Error creating city price:', cityError)
            throw cityError
          }
        }
      }
    }

    return tableId
  } catch (error) {
    console.error('Error in createBlackMarketTable:', error)
    throw error
  }
}

// Tüm tabloları getir (herkese açık)
export async function getAllTables(): Promise<BlackMarketTable[]> {
  try {
    const { data, error } = await supabase
      .from('black_market_tables')
      .select(`
        id,
        name,
        password,
        creator_id,
        created_at,
        black_market_items (
          id,
          item_id,
          item_name,
          item_tier,
          item_enchantment,
          item_quality,
          buy_price,
          buy_quantity
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all tables:', error)
      throw error
    }

    return data.map(table => ({
      id: table.id,
      name: table.name,
      password: table.password,
      creator: table.creator_id,
      createdAt: table.created_at,
      items: table.black_market_items || []
    }))
  } catch (error) {
    console.error('Error in getAllTables:', error)
    throw error
  }
}

// Kullanıcının kendi tablolarını getir (sadece düzenleme için)
export async function getUserTables(userId: string): Promise<BlackMarketTable[]> {
  try {
    const { data, error } = await supabase
      .from('black_market_tables')
      .select(`
        id,
        name,
        password,
        creator_id,
        created_at,
        black_market_items (
          id,
          item_id,
          item_name,
          item_tier,
          item_enchantment,
          item_quality,
          buy_price,
          buy_quantity
        )
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user tables:', error)
      throw error
    }

    return data.map(table => ({
      id: table.id,
      name: table.name,
      password: table.password,
      creator: table.creator_id,
      createdAt: table.created_at,
      items: table.black_market_items || []
    }))
  } catch (error) {
    console.error('Error in getUserTables:', error)
    throw error
  }
}

// Tablo detaylarını getir (herkese açık)
export async function getTableDetails(tableId: string): Promise<BlackMarketTable | null> {
  try {
    console.log('DB: Getting table details for ID:', tableId)
    
    // Ana tablo bilgilerini al
    const { data: tableData, error: tableError } = await supabase
      .from('black_market_tables')
      .select('*')
      .eq('id', tableId)
      .single()

    console.log('DB: Table query result:', tableData ? 'found' : 'not found', 'error:', tableError)

    if (tableError || !tableData) {
      console.error('Error fetching table:', tableError)
      return null
    }

    console.log('DB: Table data:', tableData)

    // Item'ları al
    const { data: itemsData, error: itemsError } = await supabase
      .from('black_market_items')
      .select('*')
      .eq('table_id', tableId)

    console.log('DB: Items query result:', itemsData?.length || 0, 'items, error:', itemsError)

    if (itemsError) {
      console.error('Error fetching items:', itemsError)
      throw itemsError
    }

    // Her item için city price'ları al
    const itemsWithCityPrices = await Promise.all(
      itemsData.map(async (item) => {
        const { data: cityPricesData, error: cityPricesError } = await supabase
          .from('city_prices')
          .select('*')
          .eq('table_id', tableId)
          .eq('item_id', item.item_id)

        if (cityPricesError) {
          console.error('Error fetching city prices:', cityPricesError)
          throw cityPricesError
        }

        return {
          id: item.item_id,
          itemName: item.item_name,
          itemTier: item.item_tier,
          itemEnchantment: item.item_enchantment,
          itemQuality: item.item_quality,
          buyPrice: item.buy_price,
          buyQuantity: item.buy_quantity,
          cityPrices: cityPricesData.map(cp => ({
            city: cp.city,
            sellOrder: cp.sell_order,
            buyOrder: cp.buy_order,
            quantity: cp.quantity
          }))
        }
      })
    )

    const result = {
      id: tableData.id,
      name: tableData.name,
      password: tableData.password,
      creator: tableData.creator_id,
      createdAt: tableData.created_at,
      items: itemsWithCityPrices
    }

    console.log('DB: Returning table details:', result)
    return result
  } catch (error) {
    console.error('Error in getTableDetails:', error)
    throw error
  }
}

export async function updateTable(
  tableId: string, 
  userId: string, 
  updateData: { name: string; password: string | null; items: any[] }
): Promise<boolean> {
  try {
    // Tablo sahibi kontrolü
    const { data: existingTable, error: checkError } = await supabase
      .from('black_market_tables')
      .select('id')
      .eq('id', tableId)
      .eq('creator_id', userId)
      .single()

    if (checkError || !existingTable) {
      console.error('Table not found or unauthorized')
      return false
    }

    // Tablo bilgilerini güncelle
    const { error: tableUpdateError } = await supabase
      .from('black_market_tables')
      .update({
        name: updateData.name,
        password: updateData.password
      })
      .eq('id', tableId)

    if (tableUpdateError) {
      console.error('Error updating table:', tableUpdateError)
      throw tableUpdateError
    }

    // Mevcut item'ları sil
    const { error: deleteItemsError } = await supabase
      .from('black_market_items')
      .delete()
      .eq('table_id', tableId)

    if (deleteItemsError) {
      console.error('Error deleting existing items:', deleteItemsError)
      throw deleteItemsError
    }

    // City price'ları sil
    const { error: deleteCityPricesError } = await supabase
      .from('city_prices')
      .delete()
      .eq('table_id', tableId)

    if (deleteCityPricesError) {
      console.error('Error deleting existing city prices:', deleteCityPricesError)
      throw deleteCityPricesError
    }

    // Yeni item'ları ekle
    for (const item of updateData.items) {
      const { error: itemError } = await supabase
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

      if (itemError) {
        console.error('Error creating item:', itemError)
        throw itemError
      }

      // Item'ın city price'larını ekle
      if (item.cityPrices && item.cityPrices.length > 0) {
        for (const cityPrice of item.cityPrices) {
          const { error: cityError } = await supabase
            .from('city_prices')
            .insert({
              table_id: tableId,
              item_id: item.id,
              city: cityPrice.city,
              sell_order: cityPrice.sellOrder,
              buy_order: cityPrice.buyOrder,
              quantity: cityPrice.quantity
            })

          if (cityError) {
            console.error('Error creating city price:', cityError)
            throw cityError
          }
        }
      }
    }

    return true
  } catch (error) {
    console.error('Error in updateTable:', error)
    return false
  }
}

export async function deleteTable(tableId: string, userId: string): Promise<boolean> {
  try {
    // Tablo sahibi kontrolü
    const { data: existingTable, error: checkError } = await supabase
      .from('black_market_tables')
      .select('id')
      .eq('id', tableId)
      .eq('creator_id', userId)
      .single()

    if (checkError || !existingTable) {
      console.error('Table not found or unauthorized')
      return false
    }

    // City price'ları sil
    const { error: cityPricesError } = await supabase
      .from('city_prices')
      .delete()
      .eq('table_id', tableId)

    if (cityPricesError) {
      console.error('Error deleting city prices:', cityPricesError)
      throw cityPricesError
    }

    // Item'ları sil
    const { error: itemsError } = await supabase
      .from('black_market_items')
      .delete()
      .eq('table_id', tableId)

    if (itemsError) {
      console.error('Error deleting items:', itemsError)
      throw itemsError
    }

    // Tabloyu sil
    const { error: tableError } = await supabase
      .from('black_market_tables')
      .delete()
      .eq('id', tableId)

    if (tableError) {
      console.error('Error deleting table:', tableError)
      throw tableError
    }

    return true
  } catch (error) {
    console.error('Error in deleteTable:', error)
    return false
  }
} 