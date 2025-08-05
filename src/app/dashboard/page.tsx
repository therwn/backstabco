'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Eye, Trash2, LogOut, User, Calendar, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession, signOut } from 'next-auth/react'
import Logo from '@/assets/logo.svg'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence } from 'framer-motion'

interface Table {
  id: string
  name: string
  password: string | null
  creator: string
  createdAt: Date
  items: any[]
}

// Skeleton component'leri
const TableSkeleton = () => (
  <Card className="bg-black-800 border border-gray-600 hover:border-[#F3B22D] transition-colors">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex space-x-2 mt-4">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </CardContent>
  </Card>
)

const DashboardSkeleton = () => (
  <div className="min-h-screen bg-black-900 text-white">
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black-800 border border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tables Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TableSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
)

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLogout, setShowLogout] = useState(false)

  useEffect(() => {
    // Session yükleniyor mu kontrol et
    if (status === 'loading') {
      return
    }

    // Session yoksa auth sayfasına yönlendir
    if (status === 'unauthenticated') {
      router.push('/auth')
      return
    }

    // Session varsa tabloları yükle
    if (status === 'authenticated' && session) {
      fetchTables()
    }
  }, [status, session, router])

  const fetchTables = async () => {
    try {
      // Debug için log'lar ekle
      if (process.env.NODE_ENV === 'development') {
        console.log('Dashboard: fetchTables called')
      }

      const response = await fetch('/api/tables')
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Dashboard: API response status:', response.status)
      }

      if (response.ok) {
        const data = await response.json()
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Dashboard: Tables data received:', data)
          console.log('Dashboard: Number of tables:', data.length)
          if (data.length > 0) {
            console.log('Dashboard: First table:', data[0])
          }
        }
        
        setTables(data)
      } else {
        console.error('Failed to fetch tables')
        const errorText = await response.text()
        console.error('Dashboard: API error response:', errorText)
      }
    } catch (error) {
      console.error('Error fetching tables:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTable = async (tableId: string) => {
    if (!confirm('Bu tabloyu silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Tabloyu listeden kaldır
        setTables(prev => prev.filter(table => table.id !== tableId))
        alert('Tablo başarıyla silindi!')
      } else {
        alert('Tablo silinirken hata oluştu!')
      }
    } catch (error) {
      console.error('Error deleting table:', error)
      alert('Tablo silinirken hata oluştu!')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/auth')
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/auth')
    }
  }

  const isTableOwner = (table: Table) => {
    return table.creator === session?.user?.discordId
  }

  // Loading durumunda skeleton göster
  if (status === 'loading' || isLoading) {
    return <DashboardSkeleton />
  }

  // Session yoksa auth sayfasına yönlendir
  if (status === 'unauthenticated') {
    return null
  }

  // Session yoksa loading göster
  if (!session) {
    return <DashboardSkeleton />
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
            <Image 
              src={Logo} 
              alt="BACKSTAB.CO Logo" 
              width={40} 
              height={40}
            />
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          </div>
          
          {/* Profile & Logout */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-white" />
              <span className="text-white font-medium">{session?.user?.name || 'Kullanıcı'}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-400 hover:text-white p-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1240px] mx-auto px-6 py-8 relative z-10">
        <div className="space-y-8">
          
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    className="btn-primary"
                    onClick={() => router.push('/dashboard/create-table')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Tablo Oluştur
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Tüm Tablolar ({tables.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-[#F3B22D] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-400 mt-2">Tablolar yükleniyor...</p>
                  </div>
                ) : tables.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Henüz tablo oluşturulmamış</p>
                    <Button 
                      className="mt-4"
                      onClick={() => router.push('/dashboard/create-table')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      İlk Tabloyu Oluştur
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tables.map((table, index) => (
                      <motion.div
                        key={table.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                        className="border border-gray-600 rounded-lg p-4 hover:border-[#F3B22D] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-medium text-lg">{table.name}</h3>
                          {table.password && (
                            <span className="text-[#F3B22D] text-xs">🔒 Şifreli</span>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-400 text-sm">
                            <User className="w-4 h-4 mr-2" />
                            <span>{table.creator}</span>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{new Date(table.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Package className="w-4 h-4 mr-2" />
                            <span>{table.items.length} item</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link href={`/dashboard/tables/${table.id}`}>
                            <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black-900">
                              <Eye className="w-4 h-4 mr-1" />
                              Görüntüle
                            </Button>
                          </Link>
                          
                          {isTableOwner(table) && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                                onClick={() => router.push(`/dashboard/tables/${table.id}`)}
                              >
                                <Package className="w-4 h-4 mr-1" />
                                Düzenle
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                                onClick={() => deleteTable(table.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Sil
                              </Button>
                            </>
                          )}
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
      {/* Music Player */}
    </div>
  )
} 