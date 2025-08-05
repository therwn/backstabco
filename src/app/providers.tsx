'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import MusicPlayer from '@/components/MusicPlayer'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <MusicPlayer />
    </SessionProvider>
  )
} 