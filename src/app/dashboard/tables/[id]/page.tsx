'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Trash2, Edit, Save, X, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Logo from '@/assets/logo.svg'
import Image from 'next/image'
import MusicPlayer from '@/components/MusicPlayer'
import { getItemImageUrl } from '@/lib/albion-api'
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

export default function TableViewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [table, setTable] = useState<Table | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [editData, setEditData] = useState<Table | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchTableDetails(params.id as string)
    }
  }, [params.id])

  // Show custom alert
  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  const fetchTableDetails = async (tableId: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`)
      if (response.ok) {
        const data = await response.json()
        setTable(data)
        setEditData(data)
        
        // Sadece şifreli tablolar için şifre modal'ını göster
        if (data.password && data.password.trim() !== '') {
          setShowPasswordModal(true)
        }
      } else {
        showAlert('Tablo bulunamadı!', 'error')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Tablo detayları getirilirken hata:', error)
      showAlert('Tablo detayları yüklenirken hata oluştu!', 'error')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const checkPassword = () => {
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
    if (!editData) return

    try {
      const response = await fetch(`/api/tables/${table!.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editData.name,
          password: editData.password,
          items: editData.items
        })
      })

      if (response.ok) {
        showAlert('Tablo başarıyla güncellendi!', 'success')
        setIsEditing(false)
        setTable(editData)
      } else {
        showAlert('Tablo güncellenirken hata oluştu!', 'error')
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
      items: editData.items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-800 to-black-900 relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#F3B22D] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-400 mt-2">Tablo yükleniyor...</p>
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
            onClose={() => setAlert(null)}
          />
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
              onClick={() => {
                setShowPasswordModal(false)
                router.push('/dashboard')
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-[9999]"
            >
              <div className="w-full max-w-md mx-4 bg-black-800 border border-gray-600 rounded-lg shadow-2xl p-6">
                <div className="text-center mb-6">
                  <Lock className="w-12 h-12 text-[#F3B22D] mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Şifre Gerekli</h2>
                  <p className="text-gray-400">Bu tablo şifre korumalıdır.</p>
                </div>
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
              </div>
            </motion.div>
          </>
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
              {isEditing ? (
                <Input
                  value={currentData.name}
                  onChange={(e) => updateEditData('name', e.target.value)}
                  className="text-2xl font-bold text-white bg-transparent border-none focus:ring-0 p-0"
                />
              ) : (
                <h1 className="text-2xl font-bold text-white">{currentData.name}</h1>
              )}
              {currentData.password && (
                <Lock className="w-5 h-5 text-[#F3B22D]" />
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <Button
                className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
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
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
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
                    <div className="text-white font-medium">{currentData.creator}</div>
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
                <CardTitle className="text-white">Item'lar ({currentData.items.length})</CardTitle>
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
                      <div className="w-16 h-16 rounded flex items-center justify-center">
                        <Image
                          src={getItemImageUrl(item.id, 1, item.itemEnchantment)}
                          alt={item.itemName}
                          width={64}
                          height={64}
                          className="w-14 h-14"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium text-lg">{item.itemName}</div>
                        <div className="text-gray-400 text-sm">
                          T{item.itemTier} • +{item.itemEnchantment} • {item.itemQuality} kalite
                        </div>
                      </div>
                    </div>

                    {/* Black Market Info */}
                    <div className="mb-4">
                      <div className="text-gray-400 text-sm mb-2">Black Market</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-gray-400 text-xs">Alış Fiyatı</div>
                          {isEditing ? (
                            <Input
                              type="text"
                              value={formatCurrencyInput(item.buyPrice.toString())}
                              onChange={(e) => updateItem(item.id, 'buyPrice', parseCurrencyInput(e.target.value))}
                              className="text-sm"
                            />
                          ) : (
                            <div className="text-white font-medium">{formatCurrency(item.buyPrice)}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Alış Miktarı</div>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={item.buyQuantity}
                              onChange={(e) => updateItem(item.id, 'buyQuantity', parseInt(e.target.value) || 0)}
                              className="text-sm"
                            />
                          ) : (
                            <div className="text-white font-medium">{item.buyQuantity}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* City Prices */}
                    {item.cityPrices.length > 0 && (
                      <div>
                        <div className="text-gray-400 text-sm mb-2">Şehir Fiyatları</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {item.cityPrices.map((cityPrice, cityIndex) => (
                            <div key={cityIndex} className="border border-gray-600 rounded p-3">
                              <div className="text-white font-medium mb-2">{cityPrice.city}</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-400 text-xs">Satış Fiyatı:</span>
                                  {isEditing ? (
                                    <Input
                                      type="text"
                                      value={formatCurrencyInput(cityPrice.sellOrder.toString())}
                                      onChange={(e) => updateCityPrice(item.id, cityIndex, 'sellOrder', parseCurrencyInput(e.target.value))}
                                      className="text-xs w-20"
                                    />
                                  ) : (
                                    <span className="text-white text-sm">{formatCurrency(cityPrice.sellOrder)}</span>
                                  )}
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400 text-xs">Alış Fiyatı:</span>
                                  {isEditing ? (
                                    <Input
                                      type="text"
                                      value={formatCurrencyInput(cityPrice.buyOrder.toString())}
                                      onChange={(e) => updateCityPrice(item.id, cityIndex, 'buyOrder', parseCurrencyInput(e.target.value))}
                                      className="text-xs w-20"
                                    />
                                  ) : (
                                    <span className="text-white text-sm">{formatCurrency(cityPrice.buyOrder)}</span>
                                  )}
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400 text-xs">Miktar:</span>
                                  {isEditing ? (
                                    <Input
                                      type="number"
                                      value={cityPrice.quantity}
                                      onChange={(e) => updateCityPrice(item.id, cityIndex, 'quantity', parseInt(e.target.value) || 0)}
                                      className="text-xs w-20"
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
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Music Player */}
      <MusicPlayer />
    </div>
  )
} 