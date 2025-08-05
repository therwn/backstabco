import { createClient } from '@supabase/supabase-js'
import { BlackMarketTable } from '@/types/albion'

// Supabase client'ı oluştur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.38.0'
    }
  }
})

// RLS'yi bypass etmek için service role key kullanıyoruz
// Bu sayede tüm tabloları okuyabiliriz

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
  items: any[],
  userId: string
): Promise<any> {
  try {
    // Create table
    const { data: table, error: tableError } = await supabase
      .from('black_market_tables')
      .insert({
        name,
        password,
        creator_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (tableError) {
      console.error('Error creating table:', tableError)
      throw tableError
    }

    // Insert items
    for (const item of items) {
      const { error: itemError } = await supabase
        .from('black_market_items')
        .insert({
          table_id: table.id,
          item_id: item.id,
          item_name: item.itemName,
          item_tier: item.itemTier,
          item_enchantment: item.itemEnchantment,
          item_quality: item.itemQuality,
          buy_price: item.buyPrice,
          buy_quantity: item.buyQuantity
        })

      if (itemError) {
        console.error('Error inserting item:', itemError)
        throw itemError
      }

      // Insert city prices for this item
      for (const cityPrice of item.cityPrices) {
        const { error: cityError } = await supabase
          .from('city_prices')
          .insert({
            table_id: table.id,
            item_id: item.id,
            city: cityPrice.city,
            sell_order: cityPrice.sellOrder,
            buy_order: cityPrice.buyOrder,
            quantity: cityPrice.quantity
          })

        if (cityError) {
          console.error('Error inserting city price:', cityError)
          throw cityError
        }
      }
    }

    return table
  } catch (error) {
    console.error('Error in createBlackMarketTable:', error)
    throw error
  }
}

// Tüm tabloları getir (herkese açık)
export async function getAllTables(): Promise<BlackMarketTable[]> {
  try {
    // Debug için log'lar ekle
    if (process.env.NODE_ENV === 'development') {
      console.log('DB: getAllTables called')
    }

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

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: getAllTables query result:', { data, error })
      console.log('DB: Number of tables found:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('DB: First table ID:', data[0].id)
        console.log('DB: First table name:', data[0].name)
      }
    }

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
    // Debug için log'lar ekle
    if (process.env.NODE_ENV === 'development') {
      console.log('DB: getTableDetails called with tableId:', tableId)
      console.log('DB: tableId type:', typeof tableId)
      console.log('DB: tableId value:', tableId)
      console.log('DB: Environment check:')
      console.log('  - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
      console.log('  - SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
    }
    
    // ID'yi integer'a çevir (eğer string ise)
    let numericTableId: number
    try {
      numericTableId = parseInt(tableId)
      if (isNaN(numericTableId)) {
        console.error('DB: Invalid table ID - not a number:', tableId)
        return null
      }
    } catch (error) {
      console.error('DB: Error parsing table ID:', error)
      return null
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Parsed numeric table ID:', numericTableId)
    }
    
    // Ana tablo bilgilerini al
    const { data: tableData, error: tableError } = await supabase
      .from('black_market_tables')
      .select('*')
      .eq('id', numericTableId)
      .single()

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Table query result:', { 
        tableData: tableData ? 'Found' : 'Not found',
        tableError: tableError ? tableError.message : 'No error',
        tableId: numericTableId
      })
    }

    if (tableError) {
      console.error('DB: Table query error:', tableError)
      if (process.env.NODE_ENV === 'development') {
        console.log('DB: Error details:', {
          code: tableError.code,
          message: tableError.message,
          details: tableError.details
        })
      }
      return null
    }

    if (!tableData) {
      if (process.env.NODE_ENV === 'development') {
        console.log('DB: No table data found for ID:', numericTableId)
        // Tüm tabloları kontrol et
        const { data: allTables } = await supabase
          .from('black_market_tables')
          .select('id, name')
          .limit(5)
        console.log('DB: Available tables:', allTables)
      }
      return null
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Table found:', {
        id: tableData.id,
        name: tableData.name,
        creator_id: tableData.creator_id
      })
    }

    // Item'ları al
    const { data: itemsData, error: itemsError } = await supabase
      .from('black_market_items')
      .select('*')
      .eq('table_id', numericTableId)

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Items query result:', {
        itemsCount: itemsData?.length || 0,
        itemsError: itemsError ? itemsError.message : 'No error'
      })
    }

    if (itemsError) {
      console.error('DB: Items query error:', itemsError)
      // Item'lar olmasa bile tabloyu döndür
      const result = {
        id: tableData.id,
        name: tableData.name,
        password: tableData.password,
        creator: tableData.creator_id,
        createdAt: tableData.created_at,
        items: []
      }
      return result
    }

    // Her item için city price'ları al
    const itemsWithCityPrices = await Promise.all(
      itemsData.map(async (item) => {
        try {
          const { data: cityPricesData, error: cityPricesError } = await supabase
            .from('city_prices')
            .select('*')
            .eq('table_id', numericTableId)
            .eq('item_id', item.item_id)

          if (cityPricesError) {
            console.error('DB: City prices query error for item', item.item_id, ':', cityPricesError)
            // City prices olmasa bile item'ı döndür
            return {
              id: item.item_id,
              itemName: item.item_name,
              itemTier: item.item_tier,
              itemEnchantment: item.item_enchantment,
              itemQuality: item.item_quality,
              buyPrice: item.buy_price,
              buyQuantity: item.buy_quantity,
              cityPrices: []
            }
          }

          const cityPrices = cityPricesData.map(cp => ({
            city: cp.city,
            sellOrder: cp.sell_order,
            buyOrder: cp.buy_order,
            quantity: cp.quantity
          }))

          return {
            id: item.item_id,
            itemName: item.item_name,
            itemTier: item.item_tier,
            itemEnchantment: item.item_enchantment,
            itemQuality: item.item_quality,
            buyPrice: item.buy_price,
            buyQuantity: item.buy_quantity,
            cityPrices
          }
        } catch (error) {
          console.error('DB: Error processing item:', error)
          return {
            id: item.item_id,
            itemName: item.item_name,
            itemTier: item.item_tier,
            itemEnchantment: item.item_enchantment,
            itemQuality: item.item_quality,
            buyPrice: item.buy_price,
            buyQuantity: item.buy_quantity,
            cityPrices: []
          }
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

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Final result:', {
        id: result.id,
        name: result.name,
        itemsCount: result.items.length
      })
    }

    return result
  } catch (error) {
    console.error('DB: Error in getTableDetails:', error)
    return null
  }
}

export async function updateTable(
  tableId: string, 
  userId: string, 
  updateData: { name: string; password: string | null; items: any[] },
  isAdmin: boolean = false
): Promise<boolean> {
  try {
    // Sadece development'ta log
    if (process.env.NODE_ENV === 'development') {
      console.log('DB: updateTable called with:', { tableId, userId, isAdmin })
    }
    
    // Tablo sahibi kontrolü (admin değilse)
    if (!isAdmin) {
      const { data: existingTable, error: checkError } = await supabase
        .from('black_market_tables')
        .select('id, creator_id')
        .eq('id', tableId)
        .eq('creator_id', userId)
        .single()

      if (process.env.NODE_ENV === 'development') {
        console.log('DB: Existing table check:', { existingTable, checkError })
      }

      if (checkError || !existingTable) {
        console.error('DB: Table not found or unauthorized')
        if (process.env.NODE_ENV === 'development') {
          console.error('DB: Looking for tableId:', tableId, 'userId:', userId)
        }
        return false
      }
    } else {
      // Admin için sadece tablonun var olduğunu kontrol et
      const { data: existingTable, error: checkError } = await supabase
        .from('black_market_tables')
        .select('id')
        .eq('id', tableId)
        .single()

      if (process.env.NODE_ENV === 'development') {
        console.log('DB: Admin table check:', { existingTable, checkError })
      }

      if (checkError || !existingTable) {
        console.error('DB: Table not found')
        return false
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Table found, proceeding with update')
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
      console.error('DB: Error updating table:', tableUpdateError)
      throw tableUpdateError
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Table updated successfully')
    }

    // Mevcut item'ları sil
    const { error: deleteItemsError } = await supabase
      .from('black_market_items')
      .delete()
      .eq('table_id', tableId)

    if (deleteItemsError) {
      console.error('DB: Error deleting existing items:', deleteItemsError)
      throw deleteItemsError
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Existing items deleted')
    }

    // City price'ları sil
    const { error: deleteCityPricesError } = await supabase
      .from('city_prices')
      .delete()
      .eq('table_id', tableId)

    if (deleteCityPricesError) {
      console.error('DB: Error deleting existing city prices:', deleteCityPricesError)
      throw deleteCityPricesError
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Existing city prices deleted')
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
        console.error('DB: Error creating item:', itemError)
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
            console.error('DB: Error creating city price:', cityError)
            throw cityError
          }
        }
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('DB: Update completed successfully')
    }
    return true
  } catch (error) {
    console.error('DB: Error in updateTable:', error)
    return false
  }
}

export async function deleteTable(tableId: string, userId: string, isAdmin: boolean = false): Promise<boolean> {
  try {
    // Tablo sahibi kontrolü (admin değilse)
    if (!isAdmin) {
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
    } else {
      // Admin için sadece tablonun var olduğunu kontrol et
      const { data: existingTable, error: checkError } = await supabase
        .from('black_market_tables')
        .select('id')
        .eq('id', tableId)
        .single()

      if (checkError || !existingTable) {
        console.error('Table not found')
        return false
      }
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