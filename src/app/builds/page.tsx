'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Build, BUILD_CATEGORIES } from '@/types/albion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, Filter, Eye, Edit, Trash2, Sword, Shield, Zap, Heart, Flame, Snowflake, Tag, Package, Droplets, Apple } from 'lucide-react'

export default function BuildsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Session kontrolü
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  // Build'leri yükle
  useEffect(() => {
    fetchBuilds()
  }, [])

  const fetchBuilds = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/builds')
      
      if (response.ok) {
        const data = await response.json()
        setBuilds(data)
      } else {
        console.error('Failed to fetch builds')
      }
    } catch (error) {
      console.error('Error fetching builds:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtreleme
  const filteredBuilds = builds.filter(build => {
    const matchesSearch = build.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         build.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         build.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = categoryFilter === 'all' || build.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Equipment icon'u
  const getEquipmentIcon = (slot: string) => {
    switch (slot) {
      case 'weapon': return <Sword className="w-4 h-4" />
      case 'offhand': return <Shield className="w-4 h-4" />
      case 'helmet': case 'helmetOption': return <Heart className="w-4 h-4" />
      case 'chest': case 'chestOption': return <Package className="w-4 h-4" />
      case 'boots': case 'bootsOption': return <Snowflake className="w-4 h-4" />
      case 'cape': case 'capeOption': return <Flame className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Albion Builds
            </h1>
            <p className="text-gray-400 mt-2">
              Discover and share powerful builds for Albion Online
            </p>
          </div>
          
          <Button 
            onClick={() => router.push('/builds/create')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Build
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search builds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Categories</SelectItem>
              {BUILD_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => {
              setSearchTerm('')
              setCategoryFilter('all')
            }}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Builds Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : filteredBuilds.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {searchTerm || categoryFilter !== 'all'
                ? 'No builds match your filters' 
                : 'No builds found'
              }
            </div>
            <Button
              onClick={() => router.push('/builds/create')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Build
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuilds.map((build) => (
              <Card key={build.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4" />
                      <CardTitle className="text-lg text-white">{build.title}</CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/builds/${build.id}`)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {session?.user?.discordId === build.creator && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/builds/${build.id}/edit`)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteBuild(build.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {build.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {build.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Category:</span>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(build.category)}`}>
                        {build.category}
                      </span>
                    </div>
                    
                    {build.tags.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-sm">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {build.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                          {build.tags.length > 3 && (
                            <span className="text-gray-400 text-xs">+{build.tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Equipment:</span>
                      <span className="text-white text-sm">{Object.keys(build.equipment || {}).length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Spells:</span>
                      <span className="text-white text-sm">
                        {Object.values(build.spells || {}).reduce((total, category) => 
                          total + Object.keys(category || {}).length, 0
                        )}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Creator:</span>
                      <span className="text-white text-sm">{build.creatorName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Created:</span>
                      <span className="text-white text-sm">
                        {new Date(build.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  async function handleDeleteBuild(buildId: string) {
    if (!confirm('Are you sure you want to delete this build?')) return
    
    try {
      const response = await fetch(`/api/builds/${buildId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setBuilds(builds.filter(build => build.id !== buildId))
      } else {
        console.error('Failed to delete build')
      }
    } catch (error) {
      console.error('Error deleting build:', error)
    }
  }
} 