'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, Plus, Trash2, Edit, Save, X, Calendar, User, MapPin, DollarSign, Package, Eye, EyeOff, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlbionItem, searchItems, getAvailableTiersForItem, getAvailableEnchantmentsForItem, getItemImageUrl } from '@/lib/albion-api'
import { AlbionCity, ALBION_CITIES } from '@/types/albion'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

interface SelectedItem {
  item: AlbionItem
  selectedTier: number
  selectedEnchantment: number
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
  isCollapsed: boolean
}

// Custom Alert Component
const CustomAlert = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-[99999] p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-600 text-white' :
        type === 'error' ? 'bg-red-600 text-white' :
        'bg-blue-600 text-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="text-white hover:bg-white/20 ml-2"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
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

export default function CreateTablePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchRef = useRef<HTMLDivElement>(null)
  const [tableName, setTableName] = useState('')
  const [tablePassword, setTablePassword] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AlbionItem[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [globalBuySwitch, setGlobalBuySwitch] = useState(false)
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Session kontrolü
  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated') {
      router.push('/auth')
      return
    }
  }, [status, router])

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

  // Show custom alert
  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  // Session yükleniyor
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-800 to-black-900 relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#F3B22D] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-2">Yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  // Session yoksa auth sayfasına yönlendir
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-800 to-black-900 relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#F3B22D] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-2">Yönlendiriliyor...</p>
          </div>
        </div>
      </div>
    )
  }

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
      selectedTier: item.tier,
      selectedEnchantment: 0,
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
      isEditing: false,
      isCollapsed: false
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

  // Item'ı collapse/expand et
  const toggleItemCollapse = (itemId: string) => {
    setSelectedItems(prev => prev.map(selectedItem => {
      if (selectedItem.item.id === itemId) {
        return { ...selectedItem, isCollapsed: !selectedItem.isCollapsed }
      }
      return selectedItem
    }))
  }

  // Tier değiştir
  const updateTier = (itemId: string, tier: number) => {
    setSelectedItems(prev => prev.map(selectedItem => {
      if (selectedItem.item.id === itemId) {
        return { 
          ...selectedItem, 
          selectedTier: tier,
          // Item'ı da güncelle ki görsel değişsin
          item: {
            ...selectedItem.item,
            tier: tier
          }
        }
      }
      return selectedItem
    }))
  }

  // Enchantment değiştir
  const updateEnchantment = (itemId: string, enchantment: number) => {
    setSelectedItems(prev => prev.map(selectedItem => {
      if (selectedItem.item.id === itemId) {
        return { 
          ...selectedItem, 
          selectedEnchantment: enchantment,
          // Item'ı da güncelle ki görsel değişsin
          item: {
            ...selectedItem.item,
            enchantment: enchantment
          }
        }
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
      showAlert('Tablo adı gerekli!', 'error')
      return
    }

    if (selectedItems.length === 0) {
      showAlert('En az bir item seçmelisiniz!', 'error')
      return
    }

    try {
      // Item'ları BlackMarketItem formatına çevir
      const blackMarketItems = selectedItems.map(selectedItem => ({
        id: selectedItem.item.id,
        itemName: selectedItem.item.name,
        itemTier: selectedItem.selectedTier,
        itemEnchantment: selectedItem.selectedEnchantment,
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
        showAlert('Tablo başarıyla oluşturuldu!', 'success')
        router.push('/dashboard')
      } else {
        showAlert('Tablo oluşturulurken hata: ' + result.error, 'error')
      }
    } catch (error) {
      console.error('Tablo oluşturma hatası:', error)
      showAlert('Tablo oluşturulurken bir hata oluştu.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-800 to-black-900 relative overflow-hidden">
      {/* Custom Alert */}
      <AnimatePresence>
        {alert && (
          <CustomAlert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}
      </AnimatePresence>

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
                        {/* Backdrop - Tüm siteyi kaplar */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                          onClick={() => setShowSearchModal(false)}
                        />
                        
                        {/* Modal */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
                        >
                          <div className="w-full max-w-5xl mx-4 bg-black-800 border border-gray-600 rounded-lg shadow-2xl pointer-events-auto">
                            <div className="p-6 border-b border-gray-600">
                              <div className="flex items-center space-x-2">
                                <Search className="w-5 h-5 text-gray-400" />
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
                                  className="flex-1 bg-transparent border-none focus:ring-0 text-white text-lg"
                                  autoFocus
                                />
                                {isSearching && (
                                  <div className="w-5 h-5 border-2 border-[#F3B22D] border-t-transparent rounded-full animate-spin"></div>
                                )}
                              </div>
                            </div>

                            <div className="max-h-96 overflow-y-auto">
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
                                      className="flex items-center space-x-4 p-4 hover:bg-black-700 cursor-pointer"
                                      whileHover={{ backgroundColor: '#374151' }}
                                      onClick={() => handleItemSelect(item)}
                                    >
                                      <div className="w-16 h-16 rounded flex items-center justify-center">
                                        <Image
                                          src={getItemImageUrl(item.id)}
                                          alt={item.name}
                                          width={64}
                                          height={64}
                                          className="w-14 h-14"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.style.display = 'none'
                                          }}
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-white font-medium text-lg">{item.name}</div>
                                        <div className="text-gray-400 text-sm">T{item.tier} • {item.category}</div>
                                      </div>
                                      <Plus className="w-5 h-5 text-[#F3B22D]" />
                                    </motion.div>
                                  ))}
                                </div>
                              ) : searchQuery && !isSearching ? (
                                <div className="p-6 text-center text-gray-400">
                                  Sonuç bulunamadı
                                </div>
                              ) : (
                                <div className="p-6 text-center text-gray-400">
                                  Arama yapmak için yazmaya başlayın
                                </div>
                              )}
                            </div>
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
                      className="border border-gray-600 rounded-lg"
                    >
                      {/* Item Header - Always Visible */}
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-20 h-20 rounded flex items-center justify-center">
                            <Image
                              src={getItemImageUrl(selectedItem.item.id, 1, selectedItem.selectedEnchantment)}
                              alt={selectedItem.item.name}
                              width={80}
                              height={80}
                              className="w-18 h-18"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-white font-medium text-lg">{selectedItem.item.name}</div>
                            <div className="text-gray-400 text-sm">T{selectedItem.selectedTier} • {selectedItem.item.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleItemCollapse(selectedItem.item.id)}
                            className="text-gray-400 border-gray-600 hover:bg-gray-700"
                          >
                            {selectedItem.isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          </Button>
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

                      {/* Item Content - Collapsible */}
                      <AnimatePresence>
                        {!selectedItem.isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-600 p-6"
                          >
                            {/* Tier ve Enchantment Seçimi */}
                            <div className="mb-6">
                              <div className="flex items-center space-x-2 mb-4">
                                <Package className="w-5 h-5 text-[#F3B22D]" />
                                <h3 className="text-white font-medium">Item Özellikleri</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-white text-sm font-medium mb-2 block">Tier</label>
                                  <Select
                                    value={selectedItem.selectedTier.toString()}
                                    onValueChange={(value) => updateTier(selectedItem.item.id, parseInt(value))}
                                    disabled={!selectedItem.isEditing}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Tier seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5, 6, 7, 8].map((tier) => (
                                        <SelectItem key={tier} value={tier.toString()}>
                                          T{tier}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-white text-sm font-medium mb-2 block">Enchantment</label>
                                  <Select
                                    value={selectedItem.selectedEnchantment.toString()}
                                    onValueChange={(value) => updateEnchantment(selectedItem.item.id, parseInt(value))}
                                    disabled={!selectedItem.isEditing}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Enchantment seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[0, 1, 2, 3, 4].map((enchant) => (
                                        <SelectItem key={enchant} value={enchant.toString()}>
                                          +{enchant}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>

                            {/* Black Market Section */}
                            <div className="mb-6">
                              <div className="flex items-center space-x-2 mb-4">
                                <DollarSign className="w-5 h-5 text-[#F3B22D]" />
                                <h3 className="text-white font-medium">Black Market</h3>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-white text-sm font-medium mb-2 block">Alış Fiyatı</label>
                                  <Input
                                    type="text"
                                    placeholder="Black Market'ten alacağınız fiyat"
                                    value={formatCurrencyInput(selectedItem.blackMarket.buyPrice.toString())}
                                    onChange={(e) => updateBlackMarket(selectedItem.item.id, 'buyPrice', parseCurrencyInput(e.target.value))}
                                    disabled={!selectedItem.isEditing}
                                  />
                                </div>
                                <div>
                                  <label className="text-white text-sm font-medium mb-2 block">Alış Miktarı</label>
                                  <Input
                                    type="number"
                                    placeholder="Black Market'ten alacağınız miktar"
                                    value={selectedItem.blackMarket.buyQuantity}
                                    onChange={(e) => updateBlackMarket(selectedItem.item.id, 'buyQuantity', parseInt(e.target.value) || 1)}
                                    disabled={!selectedItem.isEditing}
                                  />
                                </div>
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
                                        <div>
                                          <label className="text-white text-sm font-medium mb-2 block">Satış Fiyatı</label>
                                          <Input
                                            type="text"
                                            placeholder="Şehirde satacağınız fiyat"
                                            value={formatCurrencyInput(cityPrice.sellOrder.toString())}
                                            onChange={(e) => updateCityPrice(selectedItem.item.id, cityPrice.city, 'sellOrder', parseCurrencyInput(e.target.value))}
                                            className="text-sm"
                                            disabled={!selectedItem.isEditing}
                                          />
                                        </div>
                                        {globalBuySwitch && (
                                          <>
                                            <div>
                                              <label className="text-white text-sm font-medium mb-2 block">Alış Fiyatı</label>
                                              <Input
                                                type="text"
                                                placeholder="Şehirde alacağınız fiyat"
                                                value={formatCurrencyInput(cityPrice.buyOrder.toString())}
                                                onChange={(e) => updateCityPrice(selectedItem.item.id, cityPrice.city, 'buyOrder', parseCurrencyInput(e.target.value))}
                                                className="text-sm"
                                                disabled={!selectedItem.isEditing}
                                              />
                                            </div>
                                            <div>
                                              <label className="text-white text-sm font-medium mb-2 block">Miktar</label>
                                              <Input
                                                type="number"
                                                placeholder="Şehirde alacağınız miktar"
                                                value={cityPrice.quantity}
                                                onChange={(e) => updateCityPrice(selectedItem.item.id, cityPrice.city, 'quantity', parseInt(e.target.value) || 0)}
                                                className="text-sm"
                                                disabled={!selectedItem.isEditing}
                                              />
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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