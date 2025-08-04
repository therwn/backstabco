'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Trash2, Edit, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Logo from '@/assets/logo.svg'
import Image from 'next/image'
import MusicPlayer from '@/components/MusicPlayer'
import { getItemImageUrl } from '@/lib/albion-api'

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

export default function TableViewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [table, setTable] = useState<Table | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTableDetails(params.id as string)
    }
  }, [params.id])

  const fetchTableDetails = async (tableId: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`)
      if (response.ok) {
        const data = await response.json()
        setTable(data)
      } else {
        alert('Tablo bulunamadı!')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Tablo detayları getirilirken hata:', error)
      alert('Tablo detayları yüklenirken hata oluştu!')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTable = async () => {
    if (!table || !confirm('Bu tabloyu silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Tablo başarıyla silindi!')
        router.push('/dashboard')
      } else {
        alert('Tablo silinirken hata oluştu!')
      }
    } catch (error) {
      console.error('Tablo silme hatası:', error)
      alert('Tablo silinirken bir hata oluştu!')
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
              <h1 className="text-2xl font-bold text-white">{table.name}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black-900"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {isEditing ? 'Kaydet' : 'Düzenle'}
            </Button>
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
                    <div className="text-white font-medium">{table.creator}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Oluşturulma Tarihi</div>
                    <div className="text-white font-medium">{new Date(table.createdAt).toLocaleDateString('tr-TR')}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Item Sayısı</div>
                    <div className="text-white font-medium">{table.items.length}</div>
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
                <CardTitle className="text-white">Item'lar ({table.items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {table.items.map((item, index) => (
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
                          <div className="text-white font-medium">{item.buyPrice.toLocaleString()} gümüş</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-xs">Alış Miktarı</div>
                          <div className="text-white font-medium">{item.buyQuantity}</div>
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
                                  <span className="text-white text-sm">{cityPrice.sellOrder.toLocaleString()} gümüş</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400 text-xs">Alış Fiyatı:</span>
                                  <span className="text-white text-sm">{cityPrice.buyOrder.toLocaleString()} gümüş</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400 text-xs">Miktar:</span>
                                  <span className="text-white text-sm">{cityPrice.quantity}</span>
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