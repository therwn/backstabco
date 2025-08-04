'use client'

import Link from 'next/link'
import { Plus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'motion/react'
import { signOut } from 'next-auth/react'
import Logo from '@/assets/logo.svg'
import Image from 'next/image'
import MusicPlayer from '@/components/MusicPlayer'

export default function DashboardPage() {
  const handleLogout = () => {
    signOut({ callbackUrl: '/auth' })
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
                <CardTitle className="text-white">Aktif Tablolar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <motion.div 
                    className="flex items-center justify-between p-3 bg-black-700 rounded-lg hover:bg-black-600 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <div className="text-white font-medium">Black Market T8</div>
                      <div className="text-gray-400 text-sm">5 item • 2 saat önce</div>
                    </div>
                    <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black-900">
                      Görüntüle
                    </Button>
                  </motion.div>
                  <motion.div 
                    className="flex items-center justify-between p-3 bg-black-700 rounded-lg hover:bg-black-600 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <div className="text-white font-medium">Materials T6</div>
                      <div className="text-gray-400 text-sm">12 item • 6 saat önce</div>
                    </div>
                    <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black-900">
                      Görüntüle
                    </Button>
                  </motion.div>
                  <motion.div 
                    className="flex items-center justify-between p-3 bg-black-700 rounded-lg hover:bg-black-600 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <div className="text-white font-medium">Weapons T4-T6</div>
                      <div className="text-gray-400 text-sm">8 item • 1 gün önce</div>
                    </div>
                    <Button size="sm" variant="outline" className="text-white border-white hover:bg-white hover:text-black-900">
                      Görüntüle
                    </Button>
                  </motion.div>
                </div>
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