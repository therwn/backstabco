'use client'

import { motion } from 'framer-motion'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import Logo from '@/assets/logo.svg'
import Image from 'next/image'

export default function AuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Debug logging (sadece development'ta)
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth Page - Status:', status)
      console.log('Auth Page - Session:', session)
      console.log('Auth Page - Is Redirecting:', isRedirecting)
    }

    // Session yükleniyor mu kontrol et
    if (status === 'loading') {
      return
    }

    // Session varsa dashboard'a yönlendir
    if (status === 'authenticated' && session && !isRedirecting) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth Page - Redirecting to dashboard')
      }
      setIsRedirecting(true)
      
      // Kısa bir gecikme ile yönlendirme
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }
  }, [session, status, router, isRedirecting])

  // Session yükleniyor
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Session varsa dashboard'a yönlendir
  if (status === 'authenticated' && session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg">Dashboard'a yönlendiriliyor...</p>
          <p className="text-gray-400 text-sm mt-2">Hoş geldin, {session.user?.name}!</p>
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

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center space-x-3">
          <Image 
            src={Logo} 
            alt="BACKSTAB.CO Logo" 
            width={40} 
            height={40}
            className="w-10 h-10"
          />
          <span className="font-bold text-white text-xl">BACKSTAB.CO</span>
        </div>
      </nav>

      {/* Auth Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full"
        >
          <div className="card-glass p-8 rounded-xl border border-gray-700">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <Image 
                  src={Logo} 
                  alt="BACKSTAB.CO Logo" 
                  width={80} 
                  height={80}
                  className="w-20 h-20"
                />
              </motion.div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                BACKSTAB CO
              </h1>
              <p className="text-gray-300">
                Guild yönetim sistemine hoş geldiniz
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <button
                onClick={() => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Auth Page - Discord sign in clicked')
                  }
                  signIn('discord', { callbackUrl: '/dashboard' })
                }}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-4 px-6 rounded-lg flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <Users className="w-5 h-5" />
                <span className="text-lg">Discord ile Giriş Yap</span>
              </button>

              <div className="text-center text-sm text-gray-400 mt-8">
                <p className="mb-2">
                  Discord hesabınızla giriş yaparak guild yönetim sistemine erişim sağlayın.
                </p>
                <p className="text-xs">
                  Sadece BACKSTAB CO guild üyeleri erişebilir.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 