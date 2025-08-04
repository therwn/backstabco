// Albion Online item tipleri

export interface AlbionItem {
  id: string
  name: string
  tier: number
  category: string
  subcategory: string
  imageUrl: string
  localizedNames: Record<string, string>
  enchantment?: number
  quality?: number
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

export interface ItemSearchResult {
  items: AlbionItem[]
  total: number
  query: string
}

export interface MarketPrice {
  itemId: string
  location: string
  quality: number
  sellPriceMin: number
  sellPriceMax: number
  buyPriceMin: number
  buyPriceMax: number
  updatedAt: string
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
  JEWELRY: 'jewelry'
} as const

// Şehirler
export const CITIES = {
  BRIDGEWATCH: 'Bridgewatch',
  CAERLEON: 'Caerleon',
  FORT_STERLING: 'Fort Sterling',
  LYMHURST: 'Lymhurst',
  MARTLOCK: 'Martlock',
  THETFORD: 'Thetford',
  BLACK_MARKET: 'Black Market'
} as const

// Item kaliteleri
export const ITEM_QUALITIES = [
  { value: 1, label: 'Normal' },
  { value: 2, label: 'Good' },
  { value: 3, label: 'Outstanding' },
  { value: 4, label: 'Excellent' },
  { value: 5, label: 'Masterpiece' }
] as const

// Tier aralıkları
export const TIER_RANGES = [1, 2, 3, 4, 5, 6, 7, 8] as const

// Enchantment seviyeleri
export const ENCHANTMENT_LEVELS = [
  { value: 0, label: '.0' },
  { value: 1, label: '.1' },
  { value: 2, label: '.2' },
  { value: 3, label: '.3' },
  { value: 4, label: '.4' }
] as const

export interface BlackMarketItem {
  id: string
  itemName: string
  itemTier: number
  itemEnchantment: number
  itemQuality: number
  buyPrice: number
  buyQuantity: number
  cityPrices: CityPrice[]
}

export interface CityPrice {
  city: AlbionCity
  sellOrder: number
  buyOrder: number
  quantity: number
  quality: number
}

export interface BlackMarketTable {
  id: string
  name: string
  password: string
  creator: string
  createdAt: Date
  items: BlackMarketItem[]
}

export type AlbionCity = 'Bridgewatch' | 'Caerleon' | 'Fort Sterling' | 'Lymhurst' | 'Martlock' | 'Thetford' | 'Black Market'

export const ALBION_CITIES: AlbionCity[] = [
  'Bridgewatch',
  'Caerleon', 
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford'
]

export interface User {
  id: string
  name: string
  email: string
  image?: string
  discordId: string
  role: 'admin' | 'player'
} 