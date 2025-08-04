'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, LogOut, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { signOut, useSession } from 'next-auth/react'
import Logo from '@/assets/logo.svg'
import Image from 'next/image'
import MusicPlayer from '@/components/MusicPlayer'

interface Table {
  id: string
  name: string
  password: string | null
  creator: string
  createdAt: Date
  itemCount: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables')
      if (response.ok) {
        const data = await response.json()
        setTables(data)
      }
    } catch (error) {
      console.error('Tablolar getirilirken hata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth' })
  }

  const deleteTable = async (tableId: string) => {
    if (!confirm('Bu tabloyu silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTables(prev => prev.filter(table => table.id !== tableId))
        alert('Tablo başarıyla silindi!')
      } else {
        alert('Tablo silinirken hata oluştu!')
      }
    } catch (error) {
      console.error('Tablo silme hatası:', error)
      alert('Tablo silinirken bir hata oluştu!')
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
            <motion.div 
              className="flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image 
                src={Logo} 
                alt="BACKSTAB.CO Logo" 
                width={48} 
                height={48}
                className="w-12 h-12"
              />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">BACKSTAB.CO Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-black-900"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1240px] mx-auto px-6 py-8 relative z-10">
        <div className="space-y-8">
          {/* Quick Actions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/dashboard/create-table">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="w-full btn-primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Tablo Oluştur
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Tables Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white">Aktif Tablolar ({tables.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-[#F3B22D] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 mt-2">Tablolar yükleniyor...</p>
                  </div>
                ) : tables.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Henüz tablo oluşturmadınız</p>
                    <p className="text-gray-500 text-sm">Yeni tablo oluşturmak için yukarıdaki butonu kullanın</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tables.map((table) => (
                      <motion.div
                        key={table.id}
                        className="flex items-center justify-between p-3 bg-black-700 rounded-lg hover:bg-black-600 transition-colors"
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div>
                          <div className="text-white font-medium">{table.name}</div>
                          <div className="text-gray-400 text-sm">
                            {table.itemCount} item • {new Date(table.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/tables/${table.id}`}>
                            <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black-900">
                              <Eye className="w-4 h-4 mr-1" />
                              Görüntüle
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                            onClick={() => deleteTable(table.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
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