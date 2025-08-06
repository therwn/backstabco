'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X, Edit2, Save, ChevronDown, ChevronUp, Trash2, Lock, MapPin, DollarSign, Package, ArrowLeft, Edit } from 'lucide-react'
import { AlbionItem, searchItems, getItemImageUrl } from '@/lib/albion-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2Icon, AlertCircleIcon, InfoIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import Logo from '@/assets/logo.svg'
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from '@/lib/utils'

interface TableItem {
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

interface Table {
  id: string
  name: string
  password: string | null
  creator: string
  createdAt: Date
  items: TableItem[]
}

// Skeleton component'leri
const TableDetailSkeleton = () => (
  <div className="min-h-screen bg-black-900 text-white">
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Table Info Skeleton */}
      <Card className="bg-black-800 border border-gray-600 mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black-800 border border-gray-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="space-y-2">
                  {[1, 2].map((k) => (
                    <div key={k} className="flex items-center space-x-4 p-3 border border-gray-600 rounded">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
)

// Shadcn Alert Component
const CustomAlert = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2Icon className="h-4 w-4" />
      case 'error':
        return <AlertCircleIcon className="h-4 w-4" />
      case 'info':
        return <InfoIcon className="h-4 w-4" />
      default:
        return <InfoIcon className="h-4 w-4" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed inset-0 flex items-center justify-center z-[99999] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="max-w-sm mx-4">
        <Alert variant={type === 'error' ? 'destructive' : 'default'}>
          {getIcon()}
          <AlertTitle>
            {type === 'success' ? 'Başarılı!' : 
             type === 'error' ? 'Hata!' : 'Bilgi'}
          </AlertTitle>
          <AlertDescription>
            {message}
          </AlertDescription>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="absolute top-2 right-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      </div>
    </motion.div>
  )
}

export default function TableViewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [table, setTable] = useState<Table | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [editData, setEditData] = useState<Table | null>(null)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AlbionItem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Show custom alert
  const showAlert = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setAlert({ message, type })
    // Auto close after 5 seconds
    setTimeout(() => setAlert(null), 5000)
  }, [])

  // Close alert manually
  const closeAlert = useCallback(() => {
    setAlert(null)
  }, [])

  const fetchTableDetails = useCallback(async (tableId: string) => {
    try {
      // Debug için log'lar ekle
      if (process.env.NODE_ENV === 'development') {
        console.log('Table View: fetchTableDetails called with tableId:', tableId)
      }

      setIsLoading(true)
      const response = await fetch(`/api/tables/${tableId}`)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Table View: API response status:', response.status)
        console.log('Table View: API response ok:', response.ok)
      }
      
      if (response.ok) {
        const data = await response.json()
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Table View: Table data received:', data)
          console.log('Table View: Table has password:', !!data.password)
        }
        
        setTable(data)
        setEditData(data)
        
        // Şifre kontrolünü geciktir - timing sorunu için
        setTimeout(() => {
          if (data.password && data.password.trim() !== '') {
            if (process.env.NODE_ENV === 'development') {
              console.log('Table View: Showing password modal')
            }
            setShowPasswordModal(true)
          }
        }, 1000) // 1 saniye gecikme
      } else {
        const errorData = await response.json().catch(() => ({}))
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Table View: API error response:', errorData)
          console.log('Table View: Response status:', response.status)
        }
        
        if (response.status === 404) {
          showAlert('Tablo bulunamadı!', 'error')
        } else if (response.status === 500) {
          showAlert('Sunucu hatası!', 'error')
        } else {
          showAlert('Tablo yüklenirken hata oluştu!', 'error')
        }
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Tablo detayları getirilirken hata:', error)
      if (process.env.NODE_ENV === 'development') {
        console.log('Table View: Network error:', error)
      }
      showAlert('Tablo detayları yüklenirken hata oluştu!', 'error')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [router, showAlert])

  // Session kontrolü
  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated') {
      router.push('/auth')
      return
    }

    if (status === 'authenticated' && params.id) {
      fetchTableDetails(params.id as string)
    }
  }, [status, params.id, router, fetchTableDetails])

  const checkPassword = () => {
    // Debug için log'lar ekle
    if (process.env.NODE_ENV === 'development') {
      console.log('Password check - Input password:', password)
      console.log('Password check - Table password:', table?.password)
      console.log('Password check - Passwords match:', password === table?.password)
    }
    
    if (table && table.password && password === table.password) {
      setShowPasswordModal(false)
      setPassword('')
      showAlert('Şifre doğru!', 'success')
    } else {
      showAlert('Şifre yanlış!', 'error')
      setPassword('')
    }
  }

  const saveTable = async () => {
    if (!editData || !table) return

    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: table.name, // Orijinal tablo adını koru
          password: table.password, // Orijinal şifreyi koru
          items: editData.items // Sadece item'ları güncelle
        })
      })

      if (response.ok) {
        showAlert('Tablo başarıyla güncellendi!', 'success')
        setIsEditing(false)
        // Tablo adı ve şifreyi koruyarak güncelle
        setTable({
          ...editData,
          name: table.name,
          password: table.password
        })
      } else {
        const errorData = await response.json()
        if (errorData.error === 'Table not found or unauthorized') {
          showAlert('Bu tabloyu düzenleme yetkiniz yok! Sadece kendi oluşturduğunuz tabloları düzenleyebilirsiniz.', 'error')
        } else {
          showAlert('Tablo güncellenirken hata oluştu!', 'error')
        }
      }
    } catch (error) {
      console.error('Tablo güncelleme hatası:', error)
      showAlert('Tablo güncellenirken bir hata oluştu!', 'error')
    }
  }

  const updateEditData = (field: string, value: any) => {
    if (!editData) return
    setEditData({ ...editData, [field]: value })
  }

  const updateItem = (itemId: string, field: string, value: any) => {
    if (!editData) return
    setEditData({
      ...editData,
      items: editData.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }
          
          // Tier veya enchant değiştiğinde ID'yi güncelle
          if (field === 'itemTier' || field === 'itemEnchantment') {
            // Base item ID'sini al (tier ve enchant olmadan)
            const baseId = item.id.replace(/@\d+/, '').replace(/T\d+/, 'T' + updatedItem.itemTier)
            
            // Yeni ID'yi oluştur
            let newId = baseId
            if (updatedItem.itemEnchantment > 0) {
              newId = `${newId}@${updatedItem.itemEnchantment}`
            }
            
            updatedItem.id = newId
          }
          
          return updatedItem
        }
        return item
      })
    })
  }

  const updateCityPrice = (itemId: string, cityIndex: number, field: string, value: any) => {
    if (!editData) return
    setEditData({
      ...editData,
      items: editData.items.map(item => 
        item.id === itemId ? {
          ...item,
          cityPrices: item.cityPrices.map((cityPrice, index) => 
            index === cityIndex ? { ...cityPrice, [field]: value } : cityPrice
          )
        } : item
      )
    })
  }

  const removeItem = (itemId: string) => {
    if (!editData) return
    setEditData({
      ...editData,
      items: editData.items.filter(item => item.id !== itemId)
    })
  }

  const addItem = () => {
    if (!editData) return
    setShowAddItemModal(true)
  }

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

  const handleItemSelect = (item: AlbionItem) => {
    if (!editData) return
    
    const newItem: TableItem = {
      id: item.id,
      itemName: item.name,
      itemTier: item.tier,
      itemEnchantment: 0,
      itemQuality: 1,
      buyPrice: 0,
      buyQuantity: 0,
      cityPrices: []
    }
    
    setEditData({
      ...editData,
      items: [...editData.items, newItem]
    })
    
    setShowAddItemModal(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const addCityToItem = (itemId: string) => {
    if (!editData) return
    setEditData({
      ...editData,
      items: editData.items.map(item => 
        item.id === itemId ? {
          ...item,
          cityPrices: [...item.cityPrices, {
            city: 'Bridgewatch',
            sellOrder: 0,
            buyOrder: 0,
            quantity: 0
          }]
        } : item
      )
    })
  }

  const removeCityFromItem = (itemId: string, cityIndex: number) => {
    if (!editData) return
    setEditData({
      ...editData,
      items: editData.items.map(item => 
        item.id === itemId ? {
          ...item,
          cityPrices: item.cityPrices.filter((_, index) => index !== cityIndex)
        } : item
      )
    })
  }

  const deleteTable = async () => {
    if (!table || !confirm('Bu tabloyu silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showAlert('Tablo başarıyla silindi!', 'success')
        router.push('/dashboard')
      } else {
        showAlert('Tablo silinirken hata oluştu!', 'error')
      }
    } catch (error) {
      console.error('Tablo silme hatası:', error)
      showAlert('Tablo silinirken bir hata oluştu!', 'error')
    }
  }

  // Session yükleniyor
  if (status === 'loading') {
    return <TableDetailSkeleton />
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

  if (!table) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-800 to-black-900 relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-400">Tablo bulunamadı</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Dashboard'a Dön
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentData = isEditing ? editData! : table

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-800 to-black-900 relative overflow-hidden">
      {/* Custom Alert */}
      <AnimatePresence>
        {alert && (
          <CustomAlert
            message={alert.message}
            type={alert.type}
            onClose={closeAlert}
          />
        )}
      </AnimatePresence>

      {/* Password Dialog */}
      <Dialog open={showPasswordModal} onOpenChange={(open) => {
        if (!open) {
          setShowPasswordModal(false)
          router.push('/dashboard')
        }
      }}>
        <DialogContent className="bg-black-800 border border-gray-600 backdrop-blur-sm">
          <DialogHeader>
            <div className="text-center mb-6">
              <Lock className="w-12 h-12 text-[#F3B22D] mx-auto mb-4" />
              <DialogTitle className="text-xl font-bold text-white mb-2">Şifre Gerekli</DialogTitle>
              <DialogDescription className="text-gray-400">
                Bu tablo şifre korumalıdır.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Tablo şifresini girin..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkPassword()}
              className="w-full"
              autoFocus
            />
            <div className="flex space-x-3">
              <Button
                className="flex-1"
                onClick={checkPassword}
              >
                Giriş Yap
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-white border-white hover:bg-white hover:text-black-900"
                onClick={() => {
                  setShowPasswordModal(false)
                  router.push('/dashboard')
                }}
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemModal} onOpenChange={setShowAddItemModal}>
        <DialogContent className="bg-black-800 border border-gray-600 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white mb-2">Item Ekle</DialogTitle>
            <DialogDescription className="text-gray-400">
              Lütfen item'ın adını veya ID'sini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Item adı veya ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.trim()) {
                    handleSearch()
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
                autoFocus
              />
              {isSearching && (
                <div className="w-5 h-5 border-2 border-[#F3B22D] border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {searchResults.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:border-white cursor-pointer transition-colors"
                    onClick={() => handleItemSelect(item)}
                  >
                    <div className="w-12 h-12 rounded flex items-center justify-center">
                      <Image src={getItemImageUrl(item.id)} alt={item.name} width={48} height={48} className="w-10 h-10 object-contain" onError={(e) => { const target = e.target as HTMLImageElement; target.src = '/placeholder-item.png'; }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{item.name}</div>
                      <div className="text-gray-400 text-sm">T{item.tier} • {item.category}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1 text-white border-white hover:bg-white hover:text-black-900"
                onClick={() => setShowAddItemModal(false)}
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div className="flex items-center space-x-2">
              <Image 
                src={Logo} 
                alt="BACKSTAB.CO Logo" 
                width={32} 
                height={32}
              />
              <h1 className="text-2xl font-bold text-white">{currentData.name}</h1>
              {currentData.password && (
                <Lock className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-black-900"
                onClick={saveTable}
              >
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            ) : (
              <Button
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-black-900"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            )}
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-black-900"
              onClick={deleteTable}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1240px] mx-auto px-6 py-8 relative z-10">
        <div className="space-y-8">
          
          {/* Table Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white">Tablo Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">Oluşturan</div>
                    <div className="text-white font-medium">
                      {currentData.creator.includes('#') ? currentData.creator : `${currentData.creator}#0000`}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Oluşturulma Tarihi</div>
                    <div className="text-white font-medium">{new Date(currentData.createdAt).toLocaleDateString('tr-TR')}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Item Sayısı</div>
                    <div className="text-white font-medium">{currentData.items.length}</div>
                  </div>
                </div>
                
                {/* Düzenleme modunda tablo bilgileri */}
                {isEditing && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                      <div className="text-gray-400 text-sm mb-2">📝 Düzenleme Modu</div>
                      <div className="text-white text-sm">
                        Tablo adı ve şifre değiştirilemez. Sadece item'lar ve şehir bilgileri düzenlenebilir.
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Item'lar ({currentData.items.length})</CardTitle>
                  {isEditing && (
                    <Button
                      variant="outline"
                      onClick={addItem}
                      className="text-white border-white hover:bg-white hover:text-black-900"
                    >
                      + Item Ekle
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentData.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    className="border border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-20 h-20 rounded flex items-center justify-center">
                        <Image 
                          src={getItemImageUrl(item.id)} 
                          alt={item.itemName} 
                          width={80} 
                          height={80} 
                          className="w-18 h-18 object-contain" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-item.png'
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-lg">{item.itemName}</div>
                        {isEditing ? (
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 text-sm">Tier:</span>
                              <select
                                value={item.itemTier}
                                onChange={(e) => updateItem(item.id, 'itemTier', parseInt(e.target.value))}
                                className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
                              >
                                {[4, 5, 6, 7, 8].map(tier => (
                                  <option key={tier} value={tier}>T{tier}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-400 text-sm">Enchant:</span>
                              <select
                                value={item.itemEnchantment}
                                onChange={(e) => updateItem(item.id, 'itemEnchantment', parseInt(e.target.value))}
                                className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
                              >
                                {[0, 1, 2, 3].map(enchant => (
                                  <option key={enchant} value={enchant}>+{enchant}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-sm">
                            T{item.itemTier} • +{item.itemEnchantment} • {item.itemQuality} kalite
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <Button
                          variant="outline"
                          className="text-white border-white hover:bg-white hover:text-black-900"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Black Market Info */}
                    <div className="mb-4">
                      <div className="text-gray-400 text-sm mb-2">Black Market</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Alış Fiyatı (silver)</div>
                          {isEditing ? (
                            <Input
                              type="text"
                              value={formatCurrencyInput(item.buyPrice.toString())}
                              onChange={(e) => updateItem(item.id, 'buyPrice', parseCurrencyInput(e.target.value))}
                              className="text-sm"
                              placeholder="0"
                            />
                          ) : (
                            <div className="text-white font-medium">{formatCurrency(item.buyPrice)}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs mb-1">Alış Miktarı</div>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={item.buyQuantity}
                              onChange={(e) => updateItem(item.id, 'buyQuantity', parseInt(e.target.value) || 0)}
                              className="text-sm"
                              placeholder="0"
                            />
                          ) : (
                            <div className="text-white font-medium">{item.buyQuantity}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* City Prices */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-gray-400 text-sm">Şehir Fiyatları</div>
                        {isEditing && (
                          <Button
                            variant="outline"
                            onClick={() => addCityToItem(item.id)}
                            className="text-white border-white hover:bg-white hover:text-black-900 text-xs"
                          >
                            + Şehir Ekle
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {item.cityPrices.map((cityPrice, cityIndex) => (
                          <div key={cityIndex} className="border border-gray-600 rounded p-3 relative">
                            {isEditing && (
                              <Button
                                variant="outline"
                                onClick={() => removeCityFromItem(item.id, cityIndex)}
                                className="absolute -top-2 -right-2 w-6 h-6 p-0 text-white border-white hover:bg-white hover:text-black-900"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                            <div className="text-white font-medium mb-2">
                              {isEditing ? (
                                <select
                                  value={cityPrice.city}
                                  onChange={(e) => updateCityPrice(item.id, cityIndex, 'city', e.target.value)}
                                  className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 w-full"
                                >
                                  {['Bridgewatch', 'Martlock', 'Thetford', 'Fort Sterling', 'Lymhurst', 'Caerleon'].map(city => (
                                    <option key={city} value={city}>{city}</option>
                                  ))}
                                </select>
                              ) : (
                                cityPrice.city
                              )}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="text-gray-400 text-xs mb-1">Satış Fiyatı (silver)</div>
                                {isEditing ? (
                                  <Input
                                    type="text"
                                    value={formatCurrencyInput(cityPrice.sellOrder.toString())}
                                    onChange={(e) => updateCityPrice(item.id, cityIndex, 'sellOrder', parseCurrencyInput(e.target.value))}
                                    className="text-xs"
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className="text-white text-sm">{formatCurrency(cityPrice.sellOrder)}</span>
                                )}
                              </div>
                              <div>
                                <div className="text-gray-400 text-xs mb-1">Alış Fiyatı (silver)</div>
                                {isEditing ? (
                                  <Input
                                    type="text"
                                    value={formatCurrencyInput(cityPrice.buyOrder.toString())}
                                    onChange={(e) => updateCityPrice(item.id, cityIndex, 'buyOrder', parseCurrencyInput(e.target.value))}
                                    className="text-xs"
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className="text-white text-sm">{formatCurrency(cityPrice.buyOrder)}</span>
                                )}
                              </div>
                              <div>
                                <div className="text-gray-400 text-xs mb-1">Miktar</div>
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    value={cityPrice.quantity}
                                    onChange={(e) => updateCityPrice(item.id, cityIndex, 'quantity', parseInt(e.target.value) || 0)}
                                    className="text-xs"
                                    placeholder="0"
                                  />
                                ) : (
                                  <span className="text-white text-sm">{cityPrice.quantity}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Music Player */}
      {/* MusicPlayer component was removed from imports, so it's removed from here */}
    </div>
  )
} 