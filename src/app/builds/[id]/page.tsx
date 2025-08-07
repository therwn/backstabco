'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Build } from '@/types/albion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Edit, Trash2, Share, Copy, Zap, Sword, Shield, Heart, Flame, Snowflake, Eye, Calendar, User } from 'lucide-react'

export default function BuildDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [build, setBuild] = useState<Build | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Session kontrolü
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  // Build'i yükle
  useEffect(() => {
    fetchBuild()
  }, [params.id])

  const fetchBuild = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/builds/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setBuild(data)
      } else {
        setError('Build not found')
      }
    } catch (error) {
      console.error('Error fetching build:', error)
      setError('Failed to load build')
    } finally {
      setLoading(false)
    }
  }

  // Build sil
  const deleteBuild = async () => {
    if (!confirm('Are you sure you want to delete this build?')) return
    
    try {
      const response = await fetch(`/api/builds/${params.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        router.push('/builds')
      } else {
        setError('Failed to delete build')
      }
    } catch (error) {
      console.error('Error deleting build:', error)
      setError('Failed to delete build')
    }
  }

  // URL'yi kopyala
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  // Equipment icon'u
  const getEquipmentIcon = (slot: string) => {
    switch (slot) {
      case 'weapon': return <Sword className="w-4 h-4" />
      case 'offhand': return <Shield className="w-4 h-4" />
      case 'helmet': case 'helmetOption': return <Heart className="w-4 h-4" />
      case 'chest': case 'chestOption': return <Flame className="w-4 h-4" />
      case 'boots': case 'bootsOption': return <Snowflake className="w-4 h-4" />
      case 'cape': case 'capeOption': return <Eye className="w-4 h-4" />
      default: return <Flame className="w-4 h-4" />
    }
  }

  // Category badge rengi
  const getCategoryColor = (category: string) => {
    if (category.includes('PvP')) return 'bg-red-500/10 text-red-500 border-red-500/20'
    if (category.includes('PvE')) return 'bg-green-500/10 text-green-500 border-green-500/20'
    if (category.includes('ZvZ')) return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    if (category.includes('Dungeon')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    if (category.includes('Arena')) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Alert className="border-red-500 bg-red-500/10">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push('/builds')}
              className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Builds
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!build) {
    return null
  }

  const isOwner = session?.user?.discordId === build.creator

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/builds')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Builds
            </Button>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {getWeaponIcon(build.weaponType)}
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {build.name}
                </h1>
              </div>
              <p className="text-gray-400">
                Created by {build.creatorName} • {new Date(build.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={copyUrl}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Share'}
            </Button>
            
            {isOwner && (
              <>
                <Button
                  onClick={() => router.push(`/builds/${build.id}/edit`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={deleteBuild}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Build Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Build Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Category:</span>
                <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(build.category)}`}>
                  {build.category}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Equipment:</span>
                <span className="text-white">{build.equipment ? Object.keys(build.equipment).length : 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Consumables:</span>
                <span className="text-white">{build.consumables ? Object.keys(build.consumables).length : 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Spells:</span>
                <span className="text-white">
                  {build.spells ? Object.values(build.spells).reduce((total, category) => 
                    total + (category ? Object.keys(category).length : 0), 0
                  ) : 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Creator:</span>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="text-white">{build.creatorName}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Created:</span>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-white">{new Date(build.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {build.description && (
                <div className="pt-4 border-t border-gray-600">
                  <span className="text-gray-400 block mb-2">Description:</span>
                  <p className="text-white text-sm">{build.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment & Spells */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Equipment & Spells</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Equipment */}
                  {build.equipment && Object.keys(build.equipment).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Equipment</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(build.equipment).map(([slot, item]) => (
                          <div key={slot} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                            <div className="flex items-center space-x-2 mb-2">
                              {getEquipmentIcon(slot)}
                              <span className="text-gray-400 text-sm capitalize">{slot}</span>
                            </div>
                            {item && (
                              <div className="text-white text-sm font-medium">{item.name}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spells */}
                  {build.spells && Object.keys(build.spells).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Spells</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(build.spells).map(([category, spells]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="text-md font-medium text-white capitalize">{category}</h4>
                            {spells && Object.entries(spells).map(([slot, spell]) => (
                              <div key={slot} className="p-2 bg-gray-700 rounded border border-gray-600">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400 text-sm capitalize">{slot}</span>
                                  {spell && (
                                    <span className="text-white text-sm">{spell.name}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!build.equipment || Object.keys(build.equipment).length === 0) && 
                   (!build.spells || Object.keys(build.spells).length === 0) && (
                    <div className="text-center py-8 text-gray-400">
                      <Zap className="w-12 h-12 mx-auto mb-4" />
                      <p>No equipment or spells found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 