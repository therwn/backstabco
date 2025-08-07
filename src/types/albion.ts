// Albion Online item tipleri

export interface AlbionItem {
  id: string
  name: string
  tier: number
  category: string
  subcategory?: string
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
  password: string | null
  creator: string
  createdAt: Date
  items: TableItem[]
}

export interface TableItem {
  id: string
  itemName: string
  itemTier: number
  itemEnchantment: number
  itemQuality: number
  buyPrice: number
  buyQuantity: number
  cityPrices: {
    city: string
    sellOrder: number
    buyOrder: number
    quantity: number
  }[]
}

// Build System - Gerçek Albion Online Spell Sistemi
export interface AlbionSpell {
  uniqueName: string
  name: string
  description: string
  slot: 'q' | 'w' | 'e' | 'd' | 'r' | 'f' | 'passive'
  category: 'weapon' | 'head' | 'armor' | 'shoes'
  type: 'active' | 'passive'
  weaponType?: string
}

export interface AlbionEquipment {
  weapon?: AlbionItem
  offhand?: AlbionItem
  helmet?: AlbionItem
  helmetOption?: AlbionItem
  chest?: AlbionItem
  chestOption?: AlbionItem
  boots?: AlbionItem
  bootsOption?: AlbionItem
  cape?: AlbionItem
  capeOption?: AlbionItem
}

export interface AlbionConsumables {
  potion?: AlbionItem
  potionOption?: AlbionItem
  food?: AlbionItem
  foodOption?: AlbionItem
}

export interface AlbionSpells {
  weapon: {
    q?: AlbionSpell
    w?: AlbionSpell
    e?: AlbionSpell
    passive?: AlbionSpell
  }
  head: {
    d?: AlbionSpell
    passive?: AlbionSpell
  }
  armor: {
    r?: AlbionSpell
    passive?: AlbionSpell
  }
  shoes: {
    f?: AlbionSpell
    passive?: AlbionSpell
  }
}

export interface Build {
  id: string
  title: string
  category: string
  tags: string[]
  description: string | null
  equipment: AlbionEquipment
  consumables: AlbionConsumables
  spells: AlbionSpells
  creator: string
  creatorName: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateBuildData {
  title: string
  category: string
  tags: string[]
  description?: string
  equipment: AlbionEquipment
  consumables: AlbionConsumables
  spells: AlbionSpells
}

export interface UpdateBuildData {
  title?: string
  category?: string
  tags?: string[]
  description?: string
  equipment?: AlbionEquipment
  consumables?: AlbionConsumables
  spells?: AlbionSpells
}

// Build Categories
export const BUILD_CATEGORIES = [
  'Solo PvP',
  'Group PvP', 
  'ZvZ',
  'Solo PvE',
  'Group PvE',
  'Dungeon',
  'Corrupted Dungeon',
  'Arena',
  'Gathering',
  'Faction Warfare'
] as const

export type BuildCategory = typeof BUILD_CATEGORIES[number]

// Equipment Slots
export const EQUIPMENT_SLOTS = {
  weapon: 'Weapon',
  offhand: 'Off-Hand',
  helmet: 'Helmet',
  helmetOption: 'Helmet Option',
  chest: 'Chest',
  chestOption: 'Chest Option', 
  boots: 'Boots',
  bootsOption: 'Boots Option',
  cape: 'Cape',
  capeOption: 'Cape Option'
} as const

// Spell Slots
export const SPELL_SLOTS = {
  weapon: {
    q: 'Q Skill',
    w: 'W Skill', 
    e: 'E Skill',
    passive: 'Passive'
  },
  head: {
    d: 'D Skill',
    passive: 'Passive'
  },
  armor: {
    r: 'R Skill',
    passive: 'Passive'
  },
  shoes: {
    f: 'F Skill',
    passive: 'Passive'
  }
} as const

// Consumable Types
export const CONSUMABLE_TYPES = {
  potion: 'Potion',
  potionOption: 'Potion Option',
  food: 'Food',
  foodOption: 'Food Option'
} as const

// Content type ve weapon type seçenekleri
export const CONTENT_TYPES = [
  'Solo PvP',
  'Group PvP',
  'ZvZ',
  'Solo PvE',
  'Group PvE',
  'Fame Farm',
  'Gathering',
  'Crafting',
  'Corrupted Dungeon',
  'Crystal Arena',
  'Hellgate',
  'Mists',
  'Open World',
  'Small Scale',
  'World Boss'
] as const

export const WEAPON_TYPES = [
  'Fire Staff',
  'Frost Staff', 
  'Arcane Staff',
  'Holy Staff',
  'Nature Staff',
  'Cursed Staff',
  'Sword',
  'Hammer',
  'Mace',
  'Axe',
  'Spear',
  'Quarter Staff',
  'Crossbow',
  'Bow',
  'Dagger',
  'Bloodletter',
  'Battleaxe',
  'Great Hammer',
  'Great Axe',
  'Great Sword',
  'Great Nature Staff',
  'Great Fire Staff',
  'Great Frost Staff',
  'Great Holy Staff',
  'Great Cursed Staff',
  'Great Arcane Staff',
  'Spear',
  'Pike',
  'Glaive',
  'Halberd',
  'Trident',
  'Scythe',
  'Battle Bracers',
  'Spiked Gauntlets',
  'Claws',
  'Wargloves',
  'Knuckles',
  'Fists',
  'Shield',
  'Torch',
  'Mistpiercer',
  'Cryptcandle',
  'Facebreaker',
  'Tome of Spells',
  'Eye of Secrets',
  'Muisak',
  'Taproot',
  'Lifecurse Staff',
  'Shadowcaller',
  'Demonic Staff',
  'Lifetouch Staff',
  'Wild Staff',
  'Ironroot Staff',
  'Druidic Staff',
  'Blight Staff',
  'Rampant Staff',
  'Thorn Staff',
  'Brimstone Staff',
  'Wildfire Staff',
  'Hoarfrost Staff',
  'Icicle Staff',
  'Permafrost Staff',
  'Great Arcane Staff',
  'Enigmatic Staff',
  'Witchwork Staff',
  'Occult Staff',
  'Evensong',
  'Dawnsong',
  'Dusktide',
  'Mistpiercer',
  'Cryptcandle',
  'Facebreaker',
  'Tome of Spells',
  'Eye of Secrets',
  'Muisak',
  'Taproot'
] as const

export type ContentType = typeof CONTENT_TYPES[number]
export type WeaponType = typeof WEAPON_TYPES[number]

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