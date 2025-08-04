'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, ShoppingCart, Plus, Trash2, Edit, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AlbionItem, searchItems, getAvailableTiersForItem, getAvailableEnchantmentsForItem, getItemImageUrl } from '@/lib/albion-api'
import Image from 'next/image'

export default function CreateTablePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AlbionItem[]>([])
  const [selectedItems, setSelectedItems] = useState<AlbionItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [availableTiers, setAvailableTiers] = useState<number[]>([])
  const [availableEnchantments, setAvailableEnchantments] = useState<number[]>([])

  // Item seçildiğinde tier ve enchantment seçeneklerini al
  const handleItemSelect = async (item: AlbionItem) => {
    try {
      const tiers = await getAvailableTiersForItem(item.name)
      const enchantments = await getAvailableEnchantmentsForItem(item.name, item.tier)
      
      setAvailableTiers(tiers)
      setAvailableEnchantments(enchantments)
      
      // Item'ı seçili listeye ekle
      setSelectedItems(prev => [...prev, item])
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Error getting item details:', error)
    }
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

  // Seçili item'ı kaldır
  const removeItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Tablo oluştur
  const createTable = () => {
    if (selectedItems.length === 0) {
      alert('En az bir item seçmelisiniz!')
      return
    }
    
    // TODO: Tablo oluşturma API'si
    console.log('Creating table with items:', selectedItems)
    alert('Tablo oluşturma özelliği yakında eklenecek!')
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Item Search Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white">Item Ara</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Item adı girin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((item) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center space-x-3 p-2 bg-black-700 rounded-lg hover:bg-black-600 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
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
                )}

                {isSearching && (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-[#F3B22D] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 mt-2">Aranıyor...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected Items Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white">Seçili Item'lar ({selectedItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Henüz item seçilmedi</p>
                    <p className="text-gray-500 text-sm">Sol taraftan item arayıp seçin</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center space-x-3 p-3 bg-black-700 rounded-lg"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {selectedItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
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