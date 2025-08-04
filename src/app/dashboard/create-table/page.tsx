'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, Plus, Trash2, Edit, Save, X, Calendar, User, MapPin, DollarSign, Package, Eye, EyeOff, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { AlbionItem, searchItems, getAvailableTiersForItem, getAvailableEnchantmentsForItem, getItemImageUrl } from '@/lib/albion-api'
import { AlbionCity, ALBION_CITIES } from '@/types/albion'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

interface SelectedItem {
  item: AlbionItem
  blackMarket: {
    buyPrice: number
    buyQuantity: number
  }
  cityPrices: {
    city: AlbionCity
    enabled: boolean
    sellOrder: number
    buyOrder: number
    quantity: number
  }[]
  isEditing: boolean
}

// Skeleton Loading Component
const ItemSkeleton = () => (
  <div className="flex items-center space-x-3 p-3">
    <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
      <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
    </div>
  </div>
)

// Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
      {content}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black-800"></div>
    </div>
  </div>
)

export default function CreateTablePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const searchRef = useRef<HTMLDivElement>(null)
  const [tableName, setTableName] = useState('')
  const [tablePassword, setTablePassword] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AlbionItem[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [globalBuySwitch, setGlobalBuySwitch] = useState(false)

  // Click outside to close search modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchModal(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Arama yap
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
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
      blackMarket: {
        buyPrice: 0,
        buyQuantity: 1
      },
      cityPrices: ALBION_CITIES.map(city => ({
        city,
        enabled: false,
        sellOrder: 0,
        buyOrder: 0,
        quantity: 0
      })),
      isEditing: false
    }
    
    setSelectedItems(prev => [...prev, newSelectedItem])
    setSearchQuery('')
    setSearchResults([])
    setShowSearchModal(false)
  }

  // Seçili item'ı kaldır
  const removeItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(selectedItem => selectedItem.item.id !== itemId))
  }

  // Item'ı düzenleme moduna al
  const editItem = (itemId: string) => {
    setSelectedItems(prev => prev.map(selectedItem => {
      if (selectedItem.item.id === itemId) {
        return { ...selectedItem, isEditing: true }
      }
      return selectedItem
    }))
  }

  // Item'ı kaydet
  const saveItem = (itemId: string) => {
    setSelectedItems(prev => prev.map(selectedItem => {
      if (selectedItem.item.id === itemId) {
        return { ...selectedItem, isEditing: false }
      }
      return selectedItem
    }))
  }

  // Black Market bilgilerini güncelle
  const updateBlackMarket = (itemId: string, field: string, value: number) => {
    setSelectedItems(prev => prev.map(selectedItem => {
      if (selectedItem.item.id === itemId) {
        return {
          ...selectedItem,
          blackMarket: {
            ...selectedItem.blackMarket,
            [field]: value
          }
        }
      }
      return selectedItem
    }))
  }

  // Şehir toggle et
  const toggleCity = (itemId: string, city: AlbionCity) => {
    setSelectedItems(prev => prev.map(selectedItem => {
      if (selectedItem.item.id === itemId) {
        return {
          ...selectedItem,
          cityPrices: selectedItem.cityPrices.map(cityPrice => {
            if (cityPrice.city === city) {
              return { ...cityPrice, enabled: !cityPrice.enabled }
            }
            return cityPrice
          })
        }
      }
      return selectedItem
    }))
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
        buyPrice: selectedItem.blackMarket.buyPrice,
        buyQuantity: selectedItem.blackMarket.buyQuantity,
        cityPrices: selectedItem.cityPrices.filter(cp => cp.enabled)
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

          {/* Section 2: Item Arama */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Item Arama
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative" ref={searchRef}>
                  <Button 
                    className="w-full justify-start text-left font-normal bg-black-700 border-gray-600 hover:bg-black-600"
                    onClick={() => setShowSearchModal(true)}
                  >
                    <Search className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-400">Item arayın...</span>
                  </Button>

                  {/* Search Modal with Backdrop */}
                  <AnimatePresence>
                    {showSearchModal && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                          onClick={() => setShowSearchModal(false)}
                        />
                        
                        {/* Modal */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-black-800 border border-gray-600 rounded-lg shadow-2xl z-50"
                        >
                          <div className="p-4 border-b border-gray-600">
                            <div className="flex items-center space-x-2">
                              <Search className="w-4 h-4 text-gray-400" />
                              <Input
                                type="text"
                                placeholder="Item adı yazın..."
                                value={searchQuery}
                                onChange={(e) => {
                                  setSearchQuery(e.target.value)
                                  if (e.target.value.trim()) {
                                    handleSearch()
                                  }
                                }}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-white"
                                autoFocus
                              />
                              {isSearching && (
                                <div className="w-4 h-4 border-2 border-[#F3B22D] border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </div>
                          </div>

                          <div className="max-h-80 overflow-y-auto">
                            {isSearching ? (
                              <div className="py-2">
                                {[...Array(5)].map((_, i) => (
                                  <ItemSkeleton key={i} />
                                ))}
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
                                    <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                                      <Image
                                        src={getItemImageUrl(item.id)}
                                        alt={item.name}
                                        width={24}
                                        height={24}
                                        className="w-6 h-6"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.style.display = 'none'
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-white font-medium">{item.name}</div>
                                      <div className="text-gray-400 text-sm">T{item.tier} • {item.category}</div>
                                    </div>
                                    <Plus className="w-4 h-4 text-[#F3B22D]" />
                                  </motion.div>
                                ))}
                              </div>
                            ) : searchQuery && !isSearching ? (
                              <div className="p-4 text-center text-gray-400">
                                Sonuç bulunamadı
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-400">
                                Arama yapmak için yazmaya başlayın
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 3: Seçili Item'lar */}
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="card-glass">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Seçili Item'lar ({selectedItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedItems.map((selectedItem, index) => (
                    <motion.div
                      key={selectedItem.item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-600 rounded-lg p-6"
                    >
                      {/* Item Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                            <Image
                              src={getItemImageUrl(selectedItem.item.id)}
                              alt={selectedItem.item.name}
                              width={32}
                              height={32}
                              className="w-8 h-8"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-white font-medium text-lg">{selectedItem.item.name}</div>
                            <div className="text-gray-400 text-sm">T{selectedItem.item.tier} • {selectedItem.item.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedItem.isEditing ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveItem(selectedItem.item.id)}
                              className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editItem(selectedItem.item.id)}
                              className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeItem(selectedItem.item.id)}
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Black Market Section */}
                      <div className="mb-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <DollarSign className="w-5 h-5 text-[#F3B22D]" />
                          <h3 className="text-white font-medium">Black Market</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Tooltip content="Black Market'ten alacağınız fiyat">
                            <div>
                              <label className="text-white text-sm font-medium mb-2 block">Alış Fiyatı</label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={selectedItem.blackMarket.buyPrice}
                                onChange={(e) => updateBlackMarket(selectedItem.item.id, 'buyPrice', parseInt(e.target.value) || 0)}
                                disabled={!selectedItem.isEditing}
                              />
                            </div>
                          </Tooltip>
                          <Tooltip content="Black Market'ten alacağınız miktar">
                            <div>
                              <label className="text-white text-sm font-medium mb-2 block">Alış Miktarı</label>
                              <Input
                                type="number"
                                placeholder="1"
                                value={selectedItem.blackMarket.buyQuantity}
                                onChange={(e) => updateBlackMarket(selectedItem.item.id, 'buyQuantity', parseInt(e.target.value) || 1)}
                                disabled={!selectedItem.isEditing}
                              />
                            </div>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Global Buy Switch */}
                      <div className="mb-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <Switch
                            checked={globalBuySwitch}
                            onCheckedChange={setGlobalBuySwitch}
                          />
                          <span className="text-white text-sm">Tüm şehirlerde alış fiyatı göster</span>
                        </div>
                      </div>

                      {/* Şehir Fiyatları */}
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <MapPin className="w-5 h-5 text-[#F3B22D]" />
                          <h3 className="text-white font-medium">Şehir Fiyatları</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                          {selectedItem.cityPrices.map((cityPrice) => (
                            <Button
                              key={cityPrice.city}
                              variant={cityPrice.enabled ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleCity(selectedItem.item.id, cityPrice.city)}
                              className={`text-xs ${cityPrice.enabled ? 'bg-[#F3B22D] text-black' : 'text-white border-gray-600 hover:bg-gray-700'}`}
                            >
                              {cityPrice.city}
                            </Button>
                          ))}
                        </div>
                        
                        {/* Enabled Cities */}
                        {selectedItem.cityPrices.filter(cp => cp.enabled).length > 0 && (
                          <div className="mt-4 space-y-3">
                            {selectedItem.cityPrices.filter(cp => cp.enabled).map((cityPrice) => (
                              <motion.div
                                key={cityPrice.city}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border border-gray-600 rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span className="text-white font-medium">{cityPrice.city}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleCity(selectedItem.item.id, cityPrice.city)}
                                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <Tooltip content="Şehirde satacağınız fiyat">
                                    <Input
                                      type="number"
                                      placeholder="Satış Fiyatı"
                                      value={cityPrice.sellOrder}
                                      onChange={(e) => updateCityPrice(selectedItem.item.id, cityPrice.city, 'sellOrder', parseInt(e.target.value) || 0)}
                                      className="text-sm"
                                      disabled={!selectedItem.isEditing}
                                    />
                                  </Tooltip>
                                  {globalBuySwitch && (
                                    <>
                                      <Tooltip content="Şehirde alacağınız fiyat">
                                        <Input
                                          type="number"
                                          placeholder="Alış Fiyatı"
                                          value={cityPrice.buyOrder}
                                          onChange={(e) => updateCityPrice(selectedItem.item.id, cityPrice.city, 'buyOrder', parseInt(e.target.value) || 0)}
                                          className="text-sm"
                                          disabled={!selectedItem.isEditing}
                                        />
                                      </Tooltip>
                                      <Tooltip content="Şehirde alacağınız miktar">
                                        <Input
                                          type="number"
                                          placeholder="Miktar"
                                          value={cityPrice.quantity}
                                          onChange={(e) => updateCityPrice(selectedItem.item.id, cityPrice.city, 'quantity', parseInt(e.target.value) || 0)}
                                          className="text-sm"
                                          disabled={!selectedItem.isEditing}
                                        />
                                      </Tooltip>
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4 pt-4">
                    <Button 
                      className="btn-primary"
                      onClick={createTable}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Tablo Oluştur
                    </Button>
                    <Button 
                      variant="outline"
                      className="text-white border-white hover:bg-white hover:text-black-900"
                      onClick={() => setShowSearchModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Item Ekle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 