import { sql } from '@vercel/postgres'
import { BlackMarketTable, BlackMarketItem } from '@/types/albion'

// Database tablolarını oluştur
export async function createTables() {
  try {
    // Black Market tabloları
    await sql`
      CREATE TABLE IF NOT EXISTS black_market_tables (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255),
        creator_id VARCHAR(255) NOT NULL,
        creator_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Black Market item'ları
    await sql`
      CREATE TABLE IF NOT EXISTS black_market_items (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES black_market_tables(id) ON DELETE CASCADE,
        item_id VARCHAR(255) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_tier INTEGER NOT NULL,
        item_enchantment INTEGER DEFAULT 0,
        item_quality INTEGER DEFAULT 1,
        buy_price INTEGER,
        buy_quantity INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Şehir fiyatları
    await sql`
      CREATE TABLE IF NOT EXISTS city_prices (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES black_market_items(id) ON DELETE CASCADE,
        city VARCHAR(100) NOT NULL,
        sell_order INTEGER,
        buy_order INTEGER,
        quantity INTEGER,
        quality INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

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
    const tableResult = await sql`
      INSERT INTO black_market_tables (name, password, creator_id, creator_name)
      VALUES (${name}, ${password}, ${creatorId}, ${creatorName})
      RETURNING id
    `
    
    const tableId = tableResult.rows[0].id

    // Item'ları ekle
    for (const item of items) {
      const itemResult = await sql`
        INSERT INTO black_market_items (
          table_id, item_id, item_name, item_tier, item_enchantment, 
          item_quality, buy_price, buy_quantity
        )
        VALUES (
          ${tableId}, ${item.id}, ${item.itemName}, ${item.itemTier}, 
          ${item.itemEnchantment}, ${item.itemQuality}, ${item.buyPrice}, ${item.buyQuantity}
        )
        RETURNING id
      `
      
      const itemId = itemResult.rows[0].id

      // Şehir fiyatlarını ekle
      for (const cityPrice of item.cityPrices) {
        await sql`
          INSERT INTO city_prices (
            item_id, city, sell_order, buy_order, quantity, quality
          )
          VALUES (
            ${itemId}, ${cityPrice.city}, ${cityPrice.sellOrder}, 
            ${cityPrice.buyOrder}, ${cityPrice.quantity}, ${cityPrice.quality}
          )
        `
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
    const result = await sql`
      SELECT 
        t.id,
        t.name,
        t.password,
        t.creator_id,
        t.creator_name,
        t.created_at,
        t.updated_at,
        COUNT(i.id) as item_count
      FROM black_market_tables t
      LEFT JOIN black_market_items i ON t.id = i.table_id
      WHERE t.creator_id = ${userId}
      GROUP BY t.id, t.name, t.password, t.creator_id, t.creator_name, t.created_at, t.updated_at
      ORDER BY t.created_at DESC
    `

    return result.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      password: row.password,
      creator: row.creator_name,
      createdAt: new Date(row.created_at),
      items: [] // Şimdilik boş, detay için ayrı query
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
    const tableResult = await sql`
      SELECT * FROM black_market_tables WHERE id = ${tableId}
    `
    
    if (tableResult.rows.length === 0) {
      return null
    }

    const table = tableResult.rows[0]

    // Item'ları getir
    const itemsResult = await sql`
      SELECT 
        i.*,
        json_agg(
          json_build_object(
            'city', cp.city,
            'sellOrder', cp.sell_order,
            'buyOrder', cp.buy_order,
            'quantity', cp.quantity,
            'quality', cp.quality
          )
        ) as city_prices
      FROM black_market_items i
      LEFT JOIN city_prices cp ON i.id = cp.item_id
      WHERE i.table_id = ${tableId}
      GROUP BY i.id, i.table_id, i.item_id, i.item_name, i.item_tier, 
               i.item_enchantment, i.item_quality, i.buy_price, i.buy_quantity,
               i.created_at, i.updated_at
    `

    const items: BlackMarketItem[] = itemsResult.rows.map(row => ({
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
      id: table.id.toString(),
      name: table.name,
      password: table.password,
      creator: table.creator_name,
      createdAt: new Date(table.created_at),
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
    const result = await sql`
      DELETE FROM black_market_tables 
      WHERE id = ${tableId} AND creator_id = ${userId}
    `
    
    return result.rowCount > 0
  } catch (error) {
    console.error('Tablo silinirken hata:', error)
    return false
  }
} 