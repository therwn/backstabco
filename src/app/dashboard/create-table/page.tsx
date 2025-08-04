'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Calendar, User, ShoppingCart, Edit, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchModal } from '@/components/ui/search-modal'
import { AlbionItem, getItemImageUrl, getAvailableTiersForItem, getAvailableEnchantmentsForItem } from '@/lib/albion-api'
import { AlbionCity, ALBION_CITIES, ITEM_QUALITIES, TIER_RANGES, ENCHANTMENT_LEVELS } from '@/types/albion'
import Image from 'next/image'

interface TableItem {
  id: string
  item: AlbionItem
  itemTier: number
  itemEnchantment: number
  itemQuality: number
  blackMarketBuyPrice: number
  blackMarketQuantity: number
  cityPrices: {
    city: AlbionCity
    sellPrice: number
    buyPrice: number
    quantity: number
  }[]
}

export default function CreateTablePage() {
  const router = useRouter()
  const [tableName, setTableName] = useState('')
  const [tablePassword, setTablePassword] = useState('')
  const [selectedItem, setSelectedItem] = useState<AlbionItem | null>(null)
  const [itemTier, setItemTier] = useState(4)
  const [itemEnchantment, setItemEnchantment] = useState(0)
  const [itemQuality, setItemQuality] = useState(1)
  const [selectedCities, setSelectedCities] = useState<AlbionCity[]>([])
  const [blackMarketBuyPrice, setBlackMarketBuyPrice] = useState(0)
  const [blackMarketQuantity, setBlackMarketQuantity] = useState(0)
  const [tableItems, setTableItems] = useState<TableItem[]>([])
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [buyOrderEnabled, setBuyOrderEnabled] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  
  // Available options for selected item
  const [availableTiers, setAvailableTiers] = useState<number[]>([])
  const [availableEnchantments, setAvailableEnchantments] = useState<number[]>([])

  // Item image URL'ini kontrol et ve güncelle
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('')
  const [imageError, setImageError] = useState<boolean>(false)

  // Image error handler
  const handleImageError = () => {
    setImageError(true)
  }

  // Image load handler
  const handleImageLoad = () => {
    setImageError(false)
  }

  // Item image URL'ini güncelle
  useEffect(() => {
    if (selectedItem) {
      const newImageUrl = getItemImageUrl(selectedItem.id, 1, itemEnchantment) // Quality her zaman 1
      setCurrentImageUrl(newImageUrl)
      setImageError(false) // Reset error state
    }
  }, [selectedItem, itemEnchantment]) // itemQuality'yi kaldırdık

  const normalCities = ALBION_CITIES.filter(city => city !== 'Black Market')

  const handleSelectItem = async (item: AlbionItem) => {
    setSelectedItem(item)
    setItemTier(item.tier)
    setItemEnchantment(0)
    setItemQuality(1)
    
    // Get available tiers for this item
    const tiers = await getAvailableTiersForItem(item.name)
    setAvailableTiers(tiers)
    
    // Get available enchantments for this tier
    const enchantments = await getAvailableEnchantmentsForItem(item.name, item.tier)
    setAvailableEnchantments(enchantments)
  }

  // Update available enchantments when tier changes
  useEffect(() => {
    if (selectedItem) {
      getAvailableEnchantmentsForItem(selectedItem.name, itemTier).then(enchantments => {
        setAvailableEnchantments(enchantments)
        // Eğer mevcut enchantment yeni tier'da yoksa, ilkini seç
        if (!enchantments.includes(itemEnchantment)) {
          setItemEnchantment(enchantments[0] || 0)
        }
      })
    }
  }, [itemTier, selectedItem, itemEnchantment])

  // Tier değiştiğinde item'ı güncelle
  useEffect(() => {
    if (selectedItem && availableTiers.length > 0) {
      // Eğer seçili tier mevcut değilse, ilk mevcut tier'ı seç
      if (!availableTiers.includes(itemTier)) {
        setItemTier(availableTiers[0] || selectedItem.tier)
      }
    }
  }, [availableTiers, selectedItem])

  const handleCityToggle = (city: AlbionCity) => {
    if (city === 'Black Market') return // Black Market is always selected
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city)
        : [...prev, city]
    )
  }

  const handleAddItem = () => {
    if (!selectedItem) return

    const newItem: TableItem = {
      id: `${selectedItem.id}_${Date.now()}`,
      item: selectedItem,
      itemTier,
      itemEnchantment,
      itemQuality,
      blackMarketBuyPrice,
      blackMarketQuantity,
      cityPrices: selectedCities.map(city => ({
        city,
        sellPrice: 0,
        buyPrice: 0,
        quantity: 0
      }))
    }

    setTableItems(prev => [...prev, newItem])
    
    // Reset form
    setSelectedItem(null)
    setItemTier(4)
    setItemEnchantment(0)
    setItemQuality(1)
    setBlackMarketBuyPrice(0)
    setBlackMarketQuantity(0)
    setAvailableTiers([])
    setAvailableEnchantments([])
  }

  const handleRemoveItem = (itemId: string) => {
    setTableItems(prev => prev.filter(item => item.id !== itemId))
  }

  const handleEditItem = (item: TableItem) => {
    setSelectedItem(item.item)
    setItemTier(item.itemTier)
    setItemEnchantment(item.itemEnchantment)
    setItemQuality(item.itemQuality)
    setBlackMarketBuyPrice(item.blackMarketBuyPrice)
    setBlackMarketQuantity(item.blackMarketQuantity)
    setEditingItemId(item.id)
    
    // Get available options
    getAvailableTiersForItem(item.item.name).then(setAvailableTiers)
    getAvailableEnchantmentsForItem(item.item.name, item.itemTier).then(setAvailableEnchantments)
  }

  const handleUpdateItem = () => {
    if (!selectedItem || !editingItemId) return

    setTableItems(prev => prev.map(item => 
      item.id === editingItemId 
        ? {
            ...item,
            itemTier,
            itemEnchantment,
            itemQuality,
            blackMarketBuyPrice,
            blackMarketQuantity
          }
        : item
    ))

    // Reset form
    setSelectedItem(null)
    setItemTier(4)
    setItemEnchantment(0)
    setItemQuality(1)
    setBlackMarketBuyPrice(0)
    setBlackMarketQuantity(0)
    setEditingItemId(null)
    setAvailableTiers([])
    setAvailableEnchantments([])
  }

  const handleSaveTable = () => {
    // Save table logic here
    console.log('Saving table:', { tableName, tablePassword, tableItems })
    router.push('/dashboard')
  }

  const qualityOptions = ITEM_QUALITIES.map(q => ({ value: q.value, label: q.label }))
  const tierOptions = availableTiers.length > 0 
    ? availableTiers.map(t => ({ value: t, label: `T${t}` }))
    : TIER_RANGES.map(t => ({ value: t, label: `T${t}` }))
  const enchantOptions = availableEnchantments.length > 0
    ? availableEnchantments.map(e => ({ value: e, label: e === 0 ? '.0' : `.${e}` }))
    : ENCHANTMENT_LEVELS.map(e => ({ value: e.value, label: e.label }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-800 to-black-900">
      {/* Header */}
      <div className="grid-container">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <h1 className="text-2xl font-bold text-white">Yeni Black Market Tablosu</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid-container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Table Info */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-white">Tablo Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Tablo Adı</label>
                  <Input
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Tablo adını girin..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Şifre (Opsiyonel)</label>
                  <Input
                    value={tablePassword}
                    onChange={(e) => setTablePassword(e.target.value)}
                    placeholder="Şifre girin..."
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item Selection */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-white">
                {editingItemId ? 'Item Düzenle' : 'Item Seçimi'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setIsSearchModalOpen(true)}
                variant="outline"
                className="w-full text-white border-white hover:bg-white hover:text-black-900"
              >
                <Search className="w-4 h-4 mr-2" />
                Item Ara...
              </Button>

              <SearchModal 
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onItemSelect={handleSelectItem}
                placeholder="Item ara..."
              />

              {selectedItem && (
                <div className="p-4 bg-black-700 rounded-lg">
                  <div className="flex items-center space-x-4 mb-4">
                    <Image
                      src={imageError ? '/placeholder-item.png' : currentImageUrl || getItemImageUrl(selectedItem.id, itemQuality, itemEnchantment)}
                      alt={selectedItem.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-contain"
                      onError={handleImageError}
                      onLoad={handleImageLoad}
                    />
                    <div>
                      <h3 className="text-white font-semibold text-lg">{selectedItem.name}</h3>
                      <p className="text-gray-400">{selectedItem.category} • {selectedItem.subcategory}</p>
                      {availableTiers.length > 0 && (
                        <p className="text-gray-500 text-sm">
                          Mevcut Tier&apos;lar: {availableTiers.map(t => `T${t}`).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Tier</label>
                      <select
                        value={itemTier}
                        onChange={(e) => setItemTier(Number(e.target.value))}
                        className="w-full bg-black-600 border border-black-500 rounded px-3 py-2 text-white"
                      >
                        {tierOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Enchant</label>
                      <select
                        value={itemEnchantment}
                        onChange={(e) => setItemEnchantment(Number(e.target.value))}
                        className="w-full bg-black-600 border border-black-500 rounded px-3 py-2 text-white"
                      >
                        {enchantOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Kalite</label>
                      <select
                        value={itemQuality}
                        onChange={(e) => setItemQuality(Number(e.target.value))}
                        className="w-full bg-black-600 border border-black-500 rounded px-3 py-2 text-white"
                      >
                        {qualityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Black Market Section */}
          <Card className="card-glass border-red-500" style={{ zIndex: 1 }}>
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Black Market (Caerleon)
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded">Sabit</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <ShoppingCart className="w-5 h-5 text-red-400" />
                  <h5 className="text-white font-semibold">Black Market (Caerleon)</h5>
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">Sabit</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Alış Fiyatı</label>
                    <Input 
                      type="number" 
                      value={blackMarketBuyPrice}
                      onChange={(e) => setBlackMarketBuyPrice(Number(e.target.value))}
                      placeholder="0" 
                      className="w-full" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Adet</label>
                    <Input 
                      type="number" 
                      value={blackMarketQuantity}
                      onChange={(e) => setBlackMarketQuantity(Number(e.target.value))}
                      placeholder="0" 
                      className="w-full" 
                    />
                  </div>
                </div>
              </div>

              {/* Normal Cities Selection */}
              <div className="mb-4" style={{ zIndex: 1 }}>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-gray-400 text-sm">Diğer Şehirler</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Buy Order</span>
                    <button
                      onClick={() => setBuyOrderEnabled(!buyOrderEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        buyOrderEnabled ? 'bg-blue-500' : 'bg-black-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          buyOrderEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {normalCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCityToggle(city)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCities.includes(city)
                          ? 'bg-blue-500 text-white'
                          : 'bg-black-600 text-gray-300 hover:bg-black-500'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {selectedCities.length}/6 şehir seçili (Black Market otomatik dahil)
                </p>
              </div>

              {/* Price Table for Normal Cities */}
              {selectedCities.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black-600">
                        <th className="text-left py-2 text-gray-400">Şehir</th>
                        <th className="text-left py-2 text-gray-400">Kalite</th>
                        {buyOrderEnabled && (
                          <th className="text-left py-2 text-gray-400">Alış Fiyatı</th>
                        )}
                        <th className="text-left py-2 text-gray-400">Satış Fiyatı</th>
                        <th className="text-left py-2 text-gray-400">Adet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCities.map((city) => (
                        <tr key={city} className="border-b border-black-600">
                          <td className="py-2 text-white">{city}</td>
                          <td className="py-2 text-white">
                            {qualityOptions.find(q => q.value === itemQuality)?.label}
                          </td>
                          {buyOrderEnabled && (
                            <td className="py-2">
                              <Input type="number" className="w-24" placeholder="0" />
                            </td>
                          )}
                          <td className="py-2">
                            <Input type="number" className="w-24" placeholder="0" />
                          </td>
                          <td className="py-2">
                            <Input type="number" className="w-24" placeholder="0" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add/Update Item Button */}
          {selectedItem && (
            <div className="text-center">
              <Button 
                onClick={editingItemId ? handleUpdateItem : handleAddItem} 
                className="btn-primary"
              >
                {editingItemId ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Item Güncelle
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Item Ekle
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Added Items List */}
          {tableItems.length > 0 && (
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white">Eklenen Itemlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tableItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-black-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={getItemImageUrl(item.item.id, item.itemQuality, item.itemEnchantment)}
                          alt={item.item.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-item.png'
                          }}
                        />
                        <div>
                          <h4 className="text-white font-semibold">{item.item.name}</h4>
                          <p className="text-gray-400 text-sm">
                            T{item.itemTier} • Enchant {item.itemEnchantment} • {qualityOptions.find(q => q.value === item.itemQuality)?.label}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditItem(item)}
                          variant="outline"
                          size="sm"
                          className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleRemoveItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSaveTable} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Tabloyu Kaydet
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 