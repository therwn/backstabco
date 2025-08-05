// Albion Online Data Project API entegrasyonu

const ALBION_API_BASE = 'https://east.albion-online-data.com/api/v2'
const RENDER_API_BASE = 'https://render.albiononline.com/v1'

export interface AlbionItem {
  id: string
  name: string
  tier: number
  category: string
  subcategory: string
  imageUrl: string
  localizedNames: Record<string, string>
}

export interface MarketItem {
  item_id: string
  city: string
  quality: number
  sell_price_min: number
  sell_price_max: number
  buy_price_min: number
  buy_price_max: number
  updated_at: string
}

export interface MarketData {
  location: string
  item_id: string
  quality: number
  sell_price_min: number
  sell_price_max: number
  buy_price_min: number
  buy_price_max: number
  updated_at: string
}

// Item kategorileri
export const ITEM_CATEGORIES = {
  WEAPONS: 'weapons',
  ARMOR: 'armor',
  TOOLS: 'tools',
  CONSUMABLES: 'consumables',
  MATERIALS: 'materials',
  MOUNTS: 'mounts',
  BAGS: 'bags',
  CAPES: 'capes',
  FURNITURE: 'furniture',
  JEWELRY: 'jewelry',
  FARMING: 'farming'
}

// Şehirler
export const CITIES = {
  BRIDGEWATCH: 'Bridgewatch',
  CAERLEON: 'Caerleon',
  FORT_STERLING: 'Fort Sterling',
  LYMHURST: 'Lymhurst',
  MARTLOCK: 'Martlock',
  THETFORD: 'Thetford',
  BLACK_MARKET: 'Black Market'
}

// Local dataset'ten item listesi
let localItemsCache: AlbionItem[] | null = null

// Cache'i temizle
export function clearItemCache() {
  localItemsCache = null
}

// Items.txt dosyasını parse et
async function parseItemsFile(): Promise<AlbionItem[]> {
  if (localItemsCache) {
    return localItemsCache
  }

  try {
    // Items.txt dosyasını oku
    const response = await fetch('/dataset/items.txt')
    if (!response.ok) {
      throw new Error('Items.txt dosyası bulunamadı')
    }
    
    const text = await response.text()
    const lines = text.split('\n')
    const items: AlbionItem[] = []
    
    let processedCount = 0
    const tierCounts: Record<number, number> = {}
    let skippedQualityItems = 0
    
    for (const line of lines) {
      if (!line.trim()) continue
      
      // Format: ID: ItemID: Name
      // Örnek: 12: T5_FARM_CABBAGE_SEED: Cabbage Seeds
      const match = line.match(/^\s*(\d+):\s*([^:]+)\s*:\s*(.+)$/)
      if (match) {
        const [, id, itemId, name] = match
        
        // Quality suffix'li item'ları atla (@1, @2, @3, @4)
        if (itemId.includes('@')) {
          skippedQualityItems++
          continue
        }
        
        // Item ID'den tier ve kategori çıkar
        const tier = extractTier(itemId)
        const category = extractCategory(itemId)
        const subcategory = extractSubcategory(itemId)
        
        // Tier sayısını takip et
        tierCounts[tier] = (tierCounts[tier] || 0) + 1
        
        // Tüm item'ları ekle (T1'den başlayarak)
        if (tier >= 1 && category !== 'other') {
          items.push({
            id: itemId.trim(),
            name: name.trim(), // Gerçek item ismi
            tier,
            category,
            subcategory,
            imageUrl: `${RENDER_API_BASE}/item/${itemId.trim()}`,
            localizedNames: { 'EN-US': name.trim(), 'TR-TR': name.trim() }
          })
        }
        
        processedCount++
        
        // Her 1000 satırda bir log (sadece development'ta)
        if (processedCount % 1000 === 0 && process.env.NODE_ENV === 'development') {
          console.log(`Processed ${processedCount} lines...`)
        }
      }
    }
    
    localItemsCache = items
    
    // Debug: Tier dağılımını göster (sadece development'ta)
    if (process.env.NODE_ENV === 'development') {
      console.log('Tier distribution:', tierCounts)
      console.log(`Loaded ${items.length} items from dataset`)
      console.log(`Processed ${processedCount} total lines`)
      console.log(`Skipped ${skippedQualityItems} quality items`)
    }
    
    return items
  } catch (error) {
    console.error('Error parsing items file:', error)
    return FALLBACK_ITEMS
  }
}

// Fallback item listesi (API çalışmazsa)
const FALLBACK_ITEMS: AlbionItem[] = [
  {
    id: 'T4_2H_BOW',
    name: 'Bow',
    tier: 4,
    category: 'weapons',
    subcategory: 'two-handed',
    imageUrl: `${RENDER_API_BASE}/item/T4_2H_BOW`,
    localizedNames: { 'EN-US': 'Bow', 'TR-TR': 'Yay' }
  },
  {
    id: 'T5_2H_BOW',
    name: 'Bow',
    tier: 5,
    category: 'weapons',
    subcategory: 'two-handed',
    imageUrl: `${RENDER_API_BASE}/item/T5_2H_BOW`,
    localizedNames: { 'EN-US': 'Bow', 'TR-TR': 'Yay' }
  },
  {
    id: 'T6_2H_BOW',
    name: 'Bow',
    tier: 6,
    category: 'weapons',
    subcategory: 'two-handed',
    imageUrl: `${RENDER_API_BASE}/item/T6_2H_BOW`,
    localizedNames: { 'EN-US': 'Bow', 'TR-TR': 'Yay' }
  },
  {
    id: 'T4_2H_SWORD',
    name: 'Sword',
    tier: 4,
    category: 'weapons',
    subcategory: 'two-handed',
    imageUrl: `${RENDER_API_BASE}/item/T4_2H_SWORD`,
    localizedNames: { 'EN-US': 'Sword', 'TR-TR': 'Kılıç' }
  },
  {
    id: 'T5_2H_SWORD',
    name: 'Sword',
    tier: 5,
    category: 'weapons',
    subcategory: 'two-handed',
    imageUrl: `${RENDER_API_BASE}/item/T5_2H_SWORD`,
    localizedNames: { 'EN-US': 'Sword', 'TR-TR': 'Kılıç' }
  },
  {
    id: 'T4_WOOD',
    name: 'Pine Logs',
    tier: 4,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T4_WOOD`,
    localizedNames: { 'EN-US': 'Pine Logs', 'TR-TR': 'Çam Kütükleri' }
  },
  {
    id: 'T5_WOOD',
    name: 'Cedar Logs',
    tier: 5,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T5_WOOD`,
    localizedNames: { 'EN-US': 'Cedar Logs', 'TR-TR': 'Sedir Kütükleri' }
  },
  {
    id: 'T6_WOOD',
    name: 'Pine Logs',
    tier: 6,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T6_WOOD`,
    localizedNames: { 'EN-US': 'Pine Logs', 'TR-TR': 'Çam Kütükleri' }
  },
  {
    id: 'T4_ORE',
    name: 'Copper Ore',
    tier: 4,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T4_ORE`,
    localizedNames: { 'EN-US': 'Copper Ore', 'TR-TR': 'Bakır Cevheri' }
  },
  {
    id: 'T5_ORE',
    name: 'Tin Ore',
    tier: 5,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T5_ORE`,
    localizedNames: { 'EN-US': 'Tin Ore', 'TR-TR': 'Kalay Cevheri' }
  },
  {
    id: 'T6_ORE',
    name: 'Iron Ore',
    tier: 6,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T6_ORE`,
    localizedNames: { 'EN-US': 'Iron Ore', 'TR-TR': 'Demir Cevheri' }
  },
  {
    id: 'T4_FIBER',
    name: 'Cotton',
    tier: 4,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T4_FIBER`,
    localizedNames: { 'EN-US': 'Cotton', 'TR-TR': 'Pamuk' }
  },
  {
    id: 'T5_FIBER',
    name: 'Hemp',
    tier: 5,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T5_FIBER`,
    localizedNames: { 'EN-US': 'Hemp', 'TR-TR': 'Kenevir' }
  },
  {
    id: 'T6_FIBER',
    name: 'Skyflower',
    tier: 6,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T6_FIBER`,
    localizedNames: { 'EN-US': 'Skyflower', 'TR-TR': 'Gökyüzü Çiçeği' }
  },
  {
    id: 'T4_HIDE',
    name: 'Rough Hide',
    tier: 4,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T4_HIDE`,
    localizedNames: { 'EN-US': 'Rough Hide', 'TR-TR': 'Ham Deri' }
  },
  {
    id: 'T5_HIDE',
    name: 'Thin Hide',
    tier: 5,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T5_HIDE`,
    localizedNames: { 'EN-US': 'Thin Hide', 'TR-TR': 'İnce Deri' }
  },
  {
    id: 'T6_HIDE',
    name: 'Medium Hide',
    tier: 6,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T6_HIDE`,
    localizedNames: { 'EN-US': 'Medium Hide', 'TR-TR': 'Orta Deri' }
  },
  {
    id: 'T4_STONEBLOCK',
    name: 'Limestone Block',
    tier: 4,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T4_STONEBLOCK`,
    localizedNames: { 'EN-US': 'Limestone Block', 'TR-TR': 'Kireçtaşı Bloğu' }
  },
  {
    id: 'T5_STONEBLOCK',
    name: 'Sandstone Block',
    tier: 5,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T5_STONEBLOCK`,
    localizedNames: { 'EN-US': 'Sandstone Block', 'TR-TR': 'Kumtaşı Bloğu' }
  },
  {
    id: 'T6_STONEBLOCK',
    name: 'Travertine Block',
    tier: 6,
    category: 'materials',
    subcategory: 'general',
    imageUrl: `${RENDER_API_BASE}/item/T6_STONEBLOCK`,
    localizedNames: { 'EN-US': 'Travertine Block', 'TR-TR': 'Traverten Bloğu' }
  }
]

// Rate limiting için basit cache
const rateLimitCache = new Map<string, { data: unknown; timestamp: number }>()
const RATE_LIMIT_DURATION = 60000 // 1 dakika

// Item listesini local dataset'ten çek
export async function fetchItems(): Promise<AlbionItem[]> {
  try {
    // Cache'i her seferinde temizle (yeni parsing kuralları için)
    localItemsCache = null
    
    // Local dataset'ten çek
    const items = await parseItemsFile()
    
    if (items.length > 0) {
      return items
    }
    
    // Eğer local dataset çalışmazsa fallback kullan
    console.warn('Local dataset failed, using fallback')
    return FALLBACK_ITEMS
  } catch (error) {
    console.error('Error fetching items from local dataset:', error)
    return FALLBACK_ITEMS
  }
}

// Market verilerini çek (API'den)
export async function fetchMarketData(itemId: string, location: string = 'Caerleon'): Promise<MarketData[]> {
  try {
    const response = await fetch(`${ALBION_API_BASE}/stats/prices/${itemId}.json?locations=${location}`, {
      headers: {
        'User-Agent': 'BACKSTAB-CO/1.0',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      console.warn('Market API response not ok')
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching market data:', error)
    return []
  }
}

// Historical market data çek
export async function fetchHistoricalData(itemId: string, location: string = 'Caerleon', days: number = 7): Promise<unknown[]> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const dateStr = `${startDate.getMonth() + 1}-${startDate.getDate()}-${startDate.getFullYear()}`
    const endDateStr = `${endDate.getMonth() + 1}-${endDate.getDate()}-${endDate.getFullYear()}`
    
    const response = await fetch(`${ALBION_API_BASE}/stats/history/${itemId}.json?date=${dateStr}&end_date=${endDateStr}&locations=${location}&time-scale=24`, {
      headers: {
        'User-Agent': 'BACKSTAB-CO/1.0',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      },
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) {
      console.warn('Historical API response not ok')
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return []
  }
}

// Gold price çek
export async function fetchGoldPrice(): Promise<number> {
  try {
    const response = await fetch(`${ALBION_API_BASE}/stats/gold.json?count=1`, {
      headers: {
        'User-Agent': 'BACKSTAB-CO/1.0',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      },
      signal: AbortSignal.timeout(5000)
    })
    
    if (!response.ok) {
      return 0
    }
    
    const data = await response.json()
    return data[0]?.price || 0
  } catch (error) {
    console.error('Error fetching gold price:', error)
    return 0
  }
}

// Item arama (local dataset'ten)
export async function searchItems(query: string): Promise<AlbionItem[]> {
  try {
    const items = await fetchItems()
    const searchTerm = query.toLowerCase()
    
    // Sadece development'ta log
    if (process.env.NODE_ENV === 'development') {
      console.log(`Searching for: "${query}"`)
      console.log(`Total items available: ${items.length}`)
    }
    
    // Önce exact match'leri bul
    const exactMatches = items.filter(item => 
      item.name.toLowerCase() === searchTerm ||
      item.id.toLowerCase() === searchTerm
    )
    
    // Sonra contains match'leri bul
    const containsMatches = items.filter(item => 
      !exactMatches.includes(item) && (
        item.id.toLowerCase().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      )
    )
    
    // Exact match'leri önce, sonra contains match'leri ekle
    const results = [...exactMatches, ...containsMatches]
    
    // Sadece development'ta log
    if (process.env.NODE_ENV === 'development') {
      console.log(`Found ${results.length} results (${exactMatches.length} exact, ${containsMatches.length} contains)`)
    }
    
    // İlk 20 sonucu göster ve tier dağılımını logla (sadece development'ta)
    const topResults = results.slice(0, 20)
    if (process.env.NODE_ENV === 'development') {
      const tierDistribution = topResults.reduce((acc, item) => {
        acc[item.tier] = (acc[item.tier] || 0) + 1
        return acc
      }, {} as Record<number, number>)
      
      console.log('Top 20 results tier distribution:', tierDistribution)
      
      // Tier dağılımını da göster
      const allTierDistribution = results.reduce((acc, item) => {
        acc[item.tier] = (acc[item.tier] || 0) + 1
        return acc
      }, {} as Record<number, number>)
      
      console.log('All results tier distribution:', allTierDistribution)
    }
    
    return topResults
  } catch (error) {
    console.error('Error searching items:', error)
    return []
  }
}

// Tier çıkar (T4, T8.1 gibi)
function extractTier(itemId: string): number {
  const tierMatch = itemId.match(/T(\d+)/)
  return tierMatch ? parseInt(tierMatch[1]) : 0
}

// Kategori çıkar (geliştirilmiş)
function extractCategory(itemId: string): string {
  if (itemId.includes('_BAG')) return ITEM_CATEGORIES.BAGS
  if (itemId.includes('_CAPE') || itemId.includes('CAPEITEM_')) return ITEM_CATEGORIES.CAPES
  if (itemId.includes('_MOUNT') || itemId.includes('_FARM_')) return ITEM_CATEGORIES.MOUNTS
  if (itemId.includes('_ARMOR') || itemId.includes('_HEAD_') || itemId.includes('_BODY_') || itemId.includes('_LEGS_') || itemId.includes('_FEET_') || itemId.includes('_HAND_') || itemId.includes('_SHOULDER_')) return ITEM_CATEGORIES.ARMOR
  if (itemId.includes('_WEAPON') || itemId.includes('_SWORD') || itemId.includes('_BOW') || itemId.includes('_STAFF') || itemId.includes('_MACE') || itemId.includes('_AXE') || itemId.includes('_DAGGER') || itemId.includes('_SPEAR') || itemId.includes('_CROSSBOW') || itemId.includes('_FIRE_STAFF') || itemId.includes('_FROST_STAFF') || itemId.includes('_ARCANE_STAFF') || itemId.includes('_HOLY_STAFF') || itemId.includes('_NATURE_STAFF') || itemId.includes('_MAIN_') || itemId.includes('_2H_') || itemId.includes('_OFF_')) return ITEM_CATEGORIES.WEAPONS
  if (itemId.includes('_TOOL')) return ITEM_CATEGORIES.TOOLS
  if (itemId.includes('_POTION') || itemId.includes('_FOOD') || itemId.includes('_COOKING') || itemId.includes('_ALCHEMY')) return ITEM_CATEGORIES.CONSUMABLES
  if (itemId.includes('_MATERIAL') || itemId.includes('_RESOURCE') || itemId.includes('_WOOD') || itemId.includes('_ORE') || itemId.includes('_FIBER') || itemId.includes('_HIDE') || itemId.includes('_STONEBLOCK') || itemId.includes('_PLANKS') || itemId.includes('_METALBAR') || itemId.includes('_CLOTH') || itemId.includes('_LEATHER') || itemId.includes('_BRICK') || itemId.includes('_CARROT') || itemId.includes('_BEAN') || itemId.includes('_WHEAT') || itemId.includes('_TURNIP') || itemId.includes('_CABBAGE') || itemId.includes('_POTATO') || itemId.includes('_CORN') || itemId.includes('_PUMPKIN') || itemId.includes('_AGARIC') || itemId.includes('_COMFREY') || itemId.includes('_BURDOCK') || itemId.includes('_TEASEL') || itemId.includes('_FOXGLOVE') || itemId.includes('_MULLEIN') || itemId.includes('_YARROW') || itemId.includes('_EGG') || itemId.includes('_MILK') || itemId.includes('_FISH_')) return ITEM_CATEGORIES.MATERIALS
  if (itemId.includes('_FURNITURE')) return ITEM_CATEGORIES.FURNITURE
  if (itemId.includes('_RING') || itemId.includes('_NECKLACE')) return ITEM_CATEGORIES.JEWELRY
  if (itemId.includes('_FARM_')) return ITEM_CATEGORIES.FARMING
  
  return 'other'
}

// Alt kategori çıkar (geliştirilmiş)
function extractSubcategory(itemId: string): string {
  if (itemId.includes('_2H_')) return 'two-handed'
  if (itemId.includes('_1H_')) return 'one-handed'
  if (itemId.includes('_HEAD_')) return 'head'
  if (itemId.includes('_BODY_')) return 'body'
  if (itemId.includes('_LEGS_')) return 'legs'
  if (itemId.includes('_FEET_')) return 'feet'
  if (itemId.includes('_HAND_')) return 'hands'
  if (itemId.includes('_SHOULDER_')) return 'shoulder'
  if (itemId.includes('_MAIN_')) return 'main-hand'
  if (itemId.includes('_OFF_')) return 'off-hand'
  
  return 'general'
}

// Item ikon URL'si oluştur
export function getItemImageUrl(itemId: string, quality: number = 1, enchantment: number = 0): string {
  // Item ID'yi doğru formata çevir
  const formattedItemId = itemId.replace(/_/g, '%20')
  
  // Enchantment suffix'ini ekle
  const enchantmentSuffix = enchantment > 0 ? `@${enchantment}` : ''
  
  // Quality suffix'ini ekle
  const qualitySuffix = quality > 1 ? `_q${quality}` : ''
  
  return `https://render.albiononline.com/v1/item/${formattedItemId}${enchantmentSuffix}${qualitySuffix}`
}

// Fiyat formatla
export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(1)}K`
  }
  return price.toString()
}

// Tarih formatla
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
} 

// Test için: Tüm tier'ları listele
export async function listAllTiers(): Promise<void> {
  try {
    const items = await fetchItems()
    const tierCounts: Record<number, number> = {}
    
    items.forEach(item => {
      tierCounts[item.tier] = (tierCounts[item.tier] || 0) + 1
    })
    
    // Sadece development'ta log
    if (process.env.NODE_ENV === 'development') {
      console.log('=== ALL TIERS AVAILABLE ===')
      Object.keys(tierCounts).sort((a, b) => parseInt(a) - parseInt(b)).forEach(tier => {
        console.log(`Tier ${tier}: ${tierCounts[parseInt(tier)]} items`)
      })
      console.log('==========================')
    }
  } catch (error) {
    console.error('Error listing tiers:', error)
  }
}

// Test için: Belirli tier'ı listele
export async function listTierItems(tier: number): Promise<AlbionItem[]> {
  try {
    const items = await fetchItems()
    const tierItems = items.filter(item => item.tier === tier)
    
    // Sadece development'ta log
    if (process.env.NODE_ENV === 'development') {
      console.log(`=== TIER ${tier} ITEMS (${tierItems.length}) ===`)
      tierItems.slice(0, 10).forEach(item => {
        console.log(`${item.id}: ${item.name} (${item.category})`)
      })
      if (tierItems.length > 10) {
        console.log(`... and ${tierItems.length - 10} more`)
      }
      console.log('==========================')
    }
    
    return tierItems
  } catch (error) {
    console.error(`Error listing tier ${tier} items:`, error)
    return []
  }
} 

// Item seçimi sonrası mevcut tier'ları getir
export async function getAvailableTiersForItem(itemName: string): Promise<number[]> {
  try {
    // Items.txt dosyasını direkt oku
    const response = await fetch('/dataset/items.txt')
    if (!response.ok) {
      throw new Error('Items.txt dosyası bulunamadı')
    }
    
    const text = await response.text()
    const lines = text.split('\n')
    const availableTiers = new Set<number>()
    
    for (const line of lines) {
      if (!line.trim()) continue
      
      const match = line.match(/^\s*(\d+):\s*([^:]+)\s*:\s*(.+)$/)
      if (match) {
        const [, id, itemId, name] = match
        
        // Aynı isimdeki item'ları bul (quality suffix olmayan)
        if (name.trim().toLowerCase() === itemName.toLowerCase() && !itemId.includes('@')) {
          const tier = extractTier(itemId)
          availableTiers.add(tier)
        }
      }
    }
    
    return Array.from(availableTiers).sort((a, b) => a - b)
  } catch (error) {
    console.error('Error getting available tiers:', error)
    return []
  }
}

// Item seçimi sonrası mevcut enchantment'ları getir
export async function getAvailableEnchantmentsForItem(itemName: string, tier: number): Promise<number[]> {
  try {
    // Items.txt dosyasını direkt oku
    const response = await fetch('/dataset/items.txt')
    if (!response.ok) {
      throw new Error('Items.txt dosyası bulunamadı')
    }
    
    const text = await response.text()
    const lines = text.split('\n')
    const availableEnchantments = new Set<number>()
    
    // Base item'ı bul (quality suffix olmayan)
    let baseItemFound = false
    
    for (const line of lines) {
      if (!line.trim()) continue
      
      const match = line.match(/^\s*(\d+):\s*([^:]+)\s*:\s*(.+)$/)
      if (match) {
        const [, id, itemId, name] = match
        
        // Aynı isim ve tier'daki item'ları bul
        if (name.trim().toLowerCase() === itemName.toLowerCase()) {
          const itemTier = extractTier(itemId)
          
          if (itemTier === tier) {
            baseItemFound = true
            
            // Base item (quality suffix olmayan)
            if (!itemId.includes('@')) {
              availableEnchantments.add(0)
            } else {
              // Enchantment'ı çıkar
              const enchantMatch = itemId.match(/@(\d+)/)
              if (enchantMatch) {
                availableEnchantments.add(parseInt(enchantMatch[1]))
              }
            }
          }
        }
      }
    }
    
    // Eğer base item bulunamadıysa, en azından 0'ı ekle
    if (!baseItemFound) {
      availableEnchantments.add(0)
    }
    
    return Array.from(availableEnchantments).sort((a, b) => a - b)
  } catch (error) {
    console.error('Error getting available enchantments:', error)
    return [0] // En azından base item
  }
}

// Item ID'den tier ve enchantment çıkar
export function extractTierAndEnchantment(itemId: string): { tier: number; enchantment: number } {
  const tierMatch = itemId.match(/T(\d+)/)
  const enchantMatch = itemId.match(/@(\d+)/)
  
  const tier = tierMatch ? parseInt(tierMatch[1]) : 0
  const enchantment = enchantMatch ? parseInt(enchantMatch[1]) : 0
  
  return { tier, enchantment }
} 