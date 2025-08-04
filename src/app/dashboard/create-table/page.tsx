'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, ShoppingCart, Plus, Trash2, Edit, Save, X, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AlbionItem, searchItems, getAvailableTiersForItem, getAvailableEnchantmentsForItem, getItemImageUrl } from '@/lib/albion-api'
import { AlbionCity, ALBION_CITIES } from '@/types/albion'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

interface SelectedItem {
  item: AlbionItem
  buyPrice: number
  buyQuantity: number
  cityPrices: {
    city: AlbionCity
    sellOrder: number
    buyOrder: number
    quantity: number
    quality: number
  }[]
}

export default function CreateTablePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [tableName, setTableName] = useState('')
  const [tablePassword, setTablePassword] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AlbionItem[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Arama yap
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setShowSearchResults(true)
    try {
      const results = await searchItems(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Item seç
  const handleItemSelect = (item: AlbionItem) => {
    const newSelectedItem: SelectedItem = {
      item,
      buyPrice: 0,
      buyQuantity: 1,
      cityPrices: ALBION_CITIES.map(city => ({
        city,
        sellOrder: 0,
        buyOrder: 0,
        quantity: 0,
        quality: 1
      }))
    }
    
    setSelectedItems(prev => [...prev, newSelectedItem])
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
  }

  // Seçili item'ı kaldır
  const removeItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(selectedItem => selectedItem.item.id !== itemId))
  }

  // Şehir fiyatını güncelle
  const updateCityPrice = (itemId: string, city: AlbionCity, field: string, value: number) => {
    setSelectedItems(prev => prev.map(selectedItem => {
      if (selectedItem.item.id === itemId) {
        return {
          ...selectedItem,
          cityPrices: selectedItem.cityPrices.map(cityPrice => {
            if (cityPrice.city === city) {
              return { ...cityPrice, [field]: value }
            }
            return cityPrice
          })
        }
      }
      return selectedItem
    }))
  }

  // Tablo oluştur
  const createTable = async () => {
    if (!tableName.trim()) {
      alert('Tablo adı gerekli!')
      return
    }

    if (selectedItems.length === 0) {
      alert('En az bir item seçmelisiniz!')
      return
    }

    try {
      // Item'ları BlackMarketItem formatına çevir
      const blackMarketItems = selectedItems.map(selectedItem => ({
        id: selectedItem.item.id,
        itemName: selectedItem.item.name,
        itemTier: selectedItem.item.tier,
        itemEnchantment: 0,
        itemQuality: 1,
        buyPrice: selectedItem.buyPrice,
        buyQuantity: selectedItem.buyQuantity,
        cityPrices: selectedItem.cityPrices
      }))

      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tableName,
          password: tablePassword || null,
          items: blackMarketItems
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Tablo başarıyla oluşturuldu!')
        router.push('/dashboard')
      } else {
        alert('Tablo oluşturulurken hata: ' + result.error)
      }
    } catch (error) {
      console.error('Tablo oluşturma hatası:', error)
      alert('Tablo oluşturulurken bir hata oluştu.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-800 to-black-900 relative overflow-hidden">
      {/* Animated Background Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="lines">
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-[1240px] mx-auto px-6 relative z-10">
        <motion.div 
          className="flex items-center justify-between py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-black-900"
              onClick={() => router.back()}
            >
              ← Geri
            </Button>
            <h1 className="text-2xl font-bold text-white">Tablo Oluştur</h1>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1240px] mx-auto px-6 py-8 relative z-10">
        <div className="space-y-8">
          
          {/* Section 1: Tablo Bilgileri */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Tablo Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Tablo Adı *</label>
                    <Input
                      type="text"
                      placeholder="Tablo adını girin..."
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium mb-2 block">Şifre (Opsiyonel)</label>
                    <Input
                      type="password"
                      placeholder="Tablo şifresi..."
                      value={tablePassword}
                      onChange={(e) => setTablePassword(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">
                      Oluşturan: {session?.user?.name || 'Bilinmeyen'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">
                      Tarih: {new Date().toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2: Item ve Şehir Bilgileri */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Item ve Şehir Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Item Arama */}
                <div className="relative">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        placeholder="Item arayın... (macOS Finder gibi)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full"
                      />
                      <Button 
                        size="sm" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={handleSearch}
                        disabled={isSearching}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Search Results - macOS Finder Style */}
                  {showSearchResults && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-black-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                    >
                      {isSearching ? (
                        <div className="p-4 text-center">
                          <div className="w-6 h-6 border-2 border-[#F3B22D] border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-gray-400 mt-2">Aranıyor...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-2">
                          {searchResults.map((item) => (
                            <motion.div
                              key={item.id}
                              className="flex items-center space-x-3 p-3 hover:bg-black-700 cursor-pointer"
                              whileHover={{ backgroundColor: '#374151' }}
                              onClick={() => handleItemSelect(item)}
                            >
                              <Image
                                src={getItemImageUrl(item.id)}
                                alt={item.name}
                                width={32}
                                height={32}
                                className="w-8 h-8"
                              />
                              <div className="flex-1">
                                <div className="text-white font-medium">{item.name}</div>
                                <div className="text-gray-400 text-sm">T{item.tier} • {item.category}</div>
                              </div>
                              <Plus className="w-4 h-4 text-[#F3B22D]" />
                            </motion.div>
                          ))}
                        </div>
                      ) : searchQuery && (
                        <div className="p-4 text-center text-gray-400">
                          Sonuç bulunamadı
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Seçili Item'lar */}
                {selectedItems.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-white font-medium">Seçili Item'lar ({selectedItems.length})</h3>
                    {selectedItems.map((selectedItem, index) => (
                      <motion.div
                        key={selectedItem.item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-600 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Image
                              src={getItemImageUrl(selectedItem.item.id)}
                              alt={selectedItem.item.name}
                              width={32}
                              height={32}
                              className="w-8 h-8"
                            />
                            <div>
                              <div className="text-white font-medium">{selectedItem.item.name}</div>
                              <div className="text-gray-400 text-sm">T{selectedItem.item.tier} • {selectedItem.item.category}</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(selectedItem.item.id)}
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Buy Price ve Quantity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-white text-sm font-medium mb-2 block">Alış Fiyatı</label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={selectedItem.buyPrice}
                              onChange={(e) => {
                                const newSelectedItems = [...selectedItems]
                                newSelectedItems[index].buyPrice = parseInt(e.target.value) || 0
                                setSelectedItems(newSelectedItems)
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-white text-sm font-medium mb-2 block">Alış Miktarı</label>
                            <Input
                              type="number"
                              placeholder="1"
                              value={selectedItem.buyQuantity}
                              onChange={(e) => {
                                const newSelectedItems = [...selectedItems]
                                newSelectedItems[index].buyQuantity = parseInt(e.target.value) || 1
                                setSelectedItems(newSelectedItems)
                              }}
                            />
                          </div>
                        </div>

                        {/* Şehir Fiyatları */}
                        <div>
                          <h4 className="text-white font-medium mb-3">Şehir Fiyatları</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {selectedItem.cityPrices.map((cityPrice, cityIndex) => (
                              <div key={cityPrice.city} className="border border-gray-600 rounded p-3">
                                <div className="text-white font-medium text-sm mb-2">{cityPrice.city}</div>
                                <div className="space-y-2">
                                  <Input
                                    type="number"
                                    placeholder="Satış Siparişi"
                                    value={cityPrice.sellOrder}
                                    onChange={(e) => updateCityPrice(selectedItem.item.id, cityPrice.city, 'sellOrder', parseInt(e.target.value) || 0)}
                                    className="text-xs"
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Alış Siparişi"
                                    value={cityPrice.buyOrder}
                                    onChange={(e) => updateCityPrice(selectedItem.item.id, cityPrice.city, 'buyOrder', parseInt(e.target.value) || 0)}
                                    className="text-xs"
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Miktar"
                                    value={cityPrice.quantity}
                                    onChange={(e) => updateCityPrice(selectedItem.item.id, cityPrice.city, 'quantity', parseInt(e.target.value) || 0)}
                                    className="text-xs"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Tablo Oluştur Butonu */}
                {selectedItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pt-4"
                  >
                    <Button 
                      className="w-full btn-primary"
                      onClick={createTable}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Tablo Oluştur
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 