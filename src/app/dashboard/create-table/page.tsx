'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateTablePage() {
  const router = useRouter()

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
        <div className="flex items-center justify-between py-6">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1240px] mx-auto px-6 py-8 relative z-10">
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="text-white">Yakında...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Tablo oluşturma özelliği yakında eklenecek.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 