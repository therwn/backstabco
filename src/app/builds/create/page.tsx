'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BUILD_CATEGORIES, EQUIPMENT_SLOTS, SPELL_SLOTS, CONSUMABLE_TYPES, AlbionItem, AlbionSpell } from '@/types/albion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Plus, Trash2, Save, Zap, Sword, Shield, Heart, Flame, Snowflake, Eye, Edit, X, Tag, Package, Droplets, Apple } from 'lucide-react'

// Equipment slot icons
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

// Consumable type icons
const getConsumableIcon = (type: string) => {
  switch (type) {
    case 'potion': case 'potionOption': return <Droplets className="w-4 h-4" />
    case 'food': case 'foodOption': return <Apple className="w-4 h-4" />
    default: return <Droplets className="w-4 h-4" />
  }
}

// Spell slot icons
const getSpellIcon = (slot: string) => {
  switch (slot) {
    case 'q': return <Zap className="w-4 h-4" />
    case 'w': return <Shield className="w-4 h-4" />
    case 'e': return <Sword className="w-4 h-4" />
    case 'd': return <Heart className="w-4 h-4" />
    case 'r': return <Flame className="w-4 h-4" />
    case 'f': return <Snowflake className="w-4 h-4" />
    case 'passive': return <Eye className="w-4 h-4" />
    default: return <Zap className="w-4 h-4" />
  }
}

export default function CreateBuildPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [equipment, setEquipment] = useState<Record<string, AlbionItem | undefined>>({})
  const [consumables, setConsumables] = useState<Record<string, AlbionItem | undefined>>({})
  const [spells, setSpells] = useState<Record<string, Record<string, AlbionSpell | undefined>>>({
    weapon: {},
    head: {},
    armor: {},
    shoes: {}
  })

  // Session kontrolü
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  // Equipment güncelle
  const updateEquipment = (slot: string, item: AlbionItem | undefined) => {
    setEquipment(prev => ({
      ...prev,
      [slot]: item
    }))
  }

  // Consumable güncelle
  const updateConsumable = (type: string, item: AlbionItem | undefined) => {
    setConsumables(prev => ({
      ...prev,
      [type]: item
    }))
  }

  // Spell güncelle
  const updateSpell = (category: string, slot: string, spell: AlbionSpell | undefined) => {
    setSpells(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [slot]: spell
      }
    }))
  }

  // Tag ekle/çıkar
  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags(prev => [...prev, tag.trim()])
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  // Build oluştur
  const createBuild = async () => {
    if (!title || !category) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/builds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          category,
          tags,
          description,
          equipment,
          consumables,
          spells
        })
      })

      if (response.ok) {
        const newBuild = await response.json()
        setSuccess('Build created successfully!')
        setTimeout(() => {
          router.push(`/builds/${newBuild.id}`)
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create build')
      }
    } catch (error) {
      console.error('Error creating build:', error)
      setError('Failed to create build')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Create New Build
              </h1>
              <p className="text-gray-400 mt-2">
                Design your perfect Albion Online build
              </p>
            </div>
          </div>
          
          <Button 
            onClick={createBuild}
            disabled={loading}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Creating...' : 'Create Build'}
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-500 bg-red-500/10">
            <X className="h-4 w-4" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 bg-green-500/10">
            <Save className="h-4 w-4" />
            <AlertDescription className="text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Information Section */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Edit className="w-5 h-5" />
                  <span>Build Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Build Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter build title..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {BUILD_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add tag..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag(e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                      <Button
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Add tag..."]') as HTMLInputElement
                          if (input) {
                            addTag(input.value)
                            input.value = ''
                          }
                        }}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <div key={tag} className="flex items-center space-x-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-sm">
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                            <Button
                              onClick={() => removeTag(tag)}
                              size="sm"
                              variant="ghost"
                              className="text-blue-300 hover:text-red-300 p-0 h-auto"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your build..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Equipment Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Equipment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(EQUIPMENT_SLOTS).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-3">
                    {getEquipmentIcon(key)}
                    <span className="text-gray-300 text-sm flex-1">{label}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => {
                        // TODO: Implement item search modal
                        console.log('Select item for:', key)
                      }}
                    >
                      {equipment[key] ? equipment[key]?.name : 'Select Item'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Consumables Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                                 <CardTitle className="text-white flex items-center space-x-2">
                   <Droplets className="w-5 h-5" />
                   <span>Consumables</span>
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(CONSUMABLE_TYPES).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-3">
                    {getConsumableIcon(key)}
                    <span className="text-gray-300 text-sm flex-1">{label}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => {
                        // TODO: Implement item search modal
                        console.log('Select consumable for:', key)
                      }}
                    >
                      {consumables[key] ? consumables[key]?.name : 'Select Item'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Spells Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Spells</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(SPELL_SLOTS).map(([category, slots]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-semibold text-white capitalize">{category}</h3>
                  {Object.entries(slots).map(([slot, label]) => (
                    <div key={slot} className="flex items-center space-x-3">
                      {getSpellIcon(slot)}
                      <span className="text-gray-300 text-sm flex-1">{label}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => {
                          // TODO: Implement spell search modal
                          console.log('Select spell for:', category, slot)
                        }}
                      >
                        {spells[category]?.[slot] ? spells[category][slot]?.name : 'Select Spell'}
                      </Button>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 