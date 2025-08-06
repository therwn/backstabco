'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BUILD_CATEGORIES, EQUIPMENT_SLOTS, SPELL_SLOTS, CONSUMABLE_TYPES, AlbionSpell } from '@/types/albion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Plus, Trash2, Save, Zap, Sword, Shield, Heart, Flame, Snowflake, Eye, Edit, X, Tag, Package, Droplets, Apple } from 'lucide-react'
import { SearchModal } from '@/components/ui/search-modal'
import { SpellSearchModal } from '@/components/ui/spell-search-modal'
import { AlbionItem } from '@/lib/albion-api'
import Image from 'next/image'

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

// Equipment slot categories for filtering
const getSlotCategory = (slot: string) => {
  switch (slot) {
    case 'weapon': return 'weapons'
    case 'offhand': return 'weapons'
    case 'helmet': case 'helmetOption': return 'armor'
    case 'chest': case 'chestOption': return 'armor'
    case 'boots': case 'bootsOption': return 'armor'
    case 'cape': case 'capeOption': return 'accessories'
    default: return 'weapons'
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
  const [isLoading, setIsLoading] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showSpellModal, setShowSpellModal] = useState(false)
  const [currentSelection, setCurrentSelection] = useState<{ type: 'equipment' | 'consumables', slot: string } | null>(null)
  const [currentSpellSelection, setCurrentSpellSelection] = useState<{ category: string, slot: string, weaponType?: string } | null>(null)

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

  const handleItemSelect = (item: AlbionItem) => {
    if (currentSelection) {
      if (currentSelection.type === 'equipment') {
        setEquipment(prev => ({
          ...prev,
          [currentSelection.slot]: item
        }))
      } else if (currentSelection.type === 'consumables') {
        setConsumables(prev => ({
          ...prev,
          [currentSelection.slot]: item
        }))
      }
    }
    setCurrentSelection(null)
  }

  const openItemModal = (type: 'equipment' | 'consumables', slot: string) => {
    setCurrentSelection({ type, slot })
    setShowItemModal(true)
  }

  const removeItem = (type: 'equipment' | 'consumables', slot: string) => {
    if (type === 'equipment') {
      updateEquipment(slot, undefined)
    } else {
      updateConsumable(slot, undefined)
    }
  }

  const handleSpellSelect = (spell: any) => {
    if (currentSpellSelection) {
      updateSpell(currentSpellSelection.category, currentSpellSelection.slot, spell)
    }
    setShowSpellModal(false)
    setCurrentSpellSelection(null)
  }

  const openSpellModal = (category: string, slot: string) => {
    setCurrentSpellSelection({ category, slot })
    setShowSpellModal(true)
  }

  const removeSpell = (category: string, slot: string) => {
    updateSpell(category, slot, undefined)
  }

  // Character Inventory View Component
  const CharacterInventoryView = () => (
    <div className="bg-black-800 border border-gray-600 rounded-lg p-6">
      <h3 className="text-white font-bold text-lg mb-4">Character Inventory</h3>
      <div className="grid grid-cols-3 gap-4">
        {/* Helmet */}
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#F3B22D] transition-colors"
            onClick={() => openItemModal('equipment', 'helmet')}
          >
            {equipment.helmet ? (
              <Image 
                src={`https://render.albiononline.com/v1/item/${equipment.helmet.id}`} 
                alt={equipment.helmet.name} 
                width={48} 
                height={48} 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-item.png'
                }}
              />
            ) : (
              <Heart className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <span className="text-gray-400 text-xs mt-1">Helmet</span>
        </div>

        {/* Cape */}
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#F3B22D] transition-colors"
            onClick={() => openItemModal('equipment', 'cape')}
          >
            {equipment.cape ? (
              <Image 
                src={`https://render.albiononline.com/v1/item/${equipment.cape.id}`} 
                alt={equipment.cape.name} 
                width={48} 
                height={48} 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-item.png'
                }}
              />
            ) : (
              <Flame className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <span className="text-gray-400 text-xs mt-1">Cape</span>
        </div>

        {/* Empty space */}
        <div></div>

        {/* Weapon */}
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#F3B22D] transition-colors"
            onClick={() => openItemModal('equipment', 'weapon')}
          >
            {equipment.weapon ? (
              <Image 
                src={`https://render.albiononline.com/v1/item/${equipment.weapon.id}`} 
                alt={equipment.weapon.name} 
                width={48} 
                height={48} 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-item.png'
                }}
              />
            ) : (
              <Sword className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <span className="text-gray-400 text-xs mt-1">Weapon</span>
        </div>

        {/* Chest */}
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#F3B22D] transition-colors"
            onClick={() => openItemModal('equipment', 'chest')}
          >
            {equipment.chest ? (
              <Image 
                src={`https://render.albiononline.com/v1/item/${equipment.chest.id}`} 
                alt={equipment.chest.name} 
                width={48} 
                height={48} 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-item.png'
                }}
              />
            ) : (
              <Package className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <span className="text-gray-400 text-xs mt-1">Chest</span>
        </div>

        {/* Offhand */}
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#F3B22D] transition-colors"
            onClick={() => openItemModal('equipment', 'offhand')}
          >
            {equipment.offhand ? (
              <Image 
                src={`https://render.albiononline.com/v1/item/${equipment.offhand.id}`} 
                alt={equipment.offhand.name} 
                width={48} 
                height={48} 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-item.png'
                }}
              />
            ) : (
              <Shield className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <span className="text-gray-400 text-xs mt-1">Offhand</span>
        </div>

        {/* Empty space */}
        <div></div>

        {/* Boots */}
        <div className="flex flex-col items-center">
          <div 
            className="w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#F3B22D] transition-colors"
            onClick={() => openItemModal('equipment', 'boots')}
          >
            {equipment.boots ? (
              <Image 
                src={`https://render.albiononline.com/v1/item/${equipment.boots.id}`} 
                alt={equipment.boots.name} 
                width={48} 
                height={48} 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-item.png'
                }}
              />
            ) : (
              <Snowflake className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <span className="text-gray-400 text-xs mt-1">Boots</span>
        </div>

        {/* Empty space */}
        <div></div>
      </div>

      {/* Consumables */}
      <div className="mt-6">
        <h4 className="text-white font-medium mb-3">Consumables</h4>
        <div className="flex space-x-4">
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-12 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#F3B22D] transition-colors"
              onClick={() => openItemModal('consumables', 'potion')}
            >
              {consumables.potion ? (
                <Image 
                  src={`https://render.albiononline.com/v1/item/${consumables.potion.id}`} 
                  alt={consumables.potion.name} 
                  width={32} 
                  height={32} 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-item.png'
                  }}
                />
              ) : (
                <Droplets className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="text-gray-400 text-xs mt-1">Potion</span>
          </div>

          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-12 border-2 border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#F3B22D] transition-colors"
              onClick={() => openItemModal('consumables', 'food')}
            >
              {consumables.food ? (
                <Image 
                  src={`https://render.albiononline.com/v1/item/${consumables.food.id}`} 
                  alt={consumables.food.name} 
                  width={32} 
                  height={32} 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-item.png'
                  }}
                />
              ) : (
                <Apple className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <span className="text-gray-400 text-xs mt-1">Food</span>
          </div>
        </div>
      </div>
    </div>
  )

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
            <CharacterInventoryView />

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
                      onClick={() => openItemModal('consumables', key)}
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
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => openSpellModal(category, slot)}
                        >
                          {spells[category]?.[slot] ? spells[category][slot]?.name : 'Select Spell'}
                        </Button>
                        {spells[category]?.[slot] && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-300 hover:bg-red-700"
                            onClick={() => removeSpell(category, slot)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        onItemSelect={handleItemSelect}
        placeholder={`${currentSelection?.type === 'equipment' ? 'Equipment' : 'Consumable'} ara...`}
        categoryFilter={currentSelection?.type === 'equipment' ? getSlotCategory(currentSelection.slot) : undefined}
      />

      {/* Spell Search Modal */}
      <SpellSearchModal
        isOpen={showSpellModal}
        onClose={() => {
          setShowSpellModal(false)
          setCurrentSpellSelection(null)
        }}
        onSpellSelect={handleSpellSelect}
        placeholder="Spell ara..."
        slot={currentSpellSelection?.slot}
        weaponType={currentSpellSelection?.weaponType}
      />
    </div>
  )
} 