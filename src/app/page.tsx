'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Ana sayfaya gelen kullanıcıları direkt auth sayfasına yönlendir
    router.push('/auth')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-800 to-black-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-[#F3B22D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Yönlendiriliyor...</p>
      </motion.div>
    </div>
  )
}
