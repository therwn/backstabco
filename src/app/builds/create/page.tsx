'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CONTENT_TYPES, WEAPON_TYPES, BuildSkill } from '@/types/albion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Plus, Trash2, Save, Zap, Sword, Shield, Heart, Flame, Snowflake, Eye, Edit, X } from 'lucide-react'

interface SkillTemplate {
  type: BuildSkill['skillType']
  name: string
  description: string
}

// Skill şablonları - weapon type'a göre
const SKILL_TEMPLATES: Record<string, SkillTemplate[]> = {
  'Fire Staff': [
    { type: 'Q', name: 'Fire Bolt', description: 'Deals fire damage to target' },
    { type: 'W', name: 'Fire Wall', description: 'Creates a wall of fire' },
    { type: 'E', name: 'Meteor Shower', description: 'Calls down meteors from the sky' },
    { type: 'Passive', name: 'Pyromaniac', description: 'Increases fire damage' },
    { type: 'Consumable', name: 'Fire Potion', description: 'Temporary fire damage boost' },
    { type: 'Mount', name: 'Fire Horse', description: 'Fast mount with fire resistance' }
  ],
  'Frost Staff': [
    { type: 'Q', name: 'Ice Bolt', description: 'Deals ice damage and slows target' },
    { type: 'W', name: 'Ice Wall', description: 'Creates a wall of ice' },
    { type: 'E', name: 'Blizzard', description: 'Creates a blizzard area' },
    { type: 'Passive', name: 'Frost Master', description: 'Increases ice damage' },
    { type: 'Consumable', name: 'Ice Potion', description: 'Temporary ice damage boost' },
    { type: 'Mount', name: 'Ice Horse', description: 'Fast mount with ice resistance' }
  ],
  'Sword': [
    { type: 'Q', name: 'Slash', description: 'Basic sword attack' },
    { type: 'W', name: 'Parry', description: 'Block incoming attacks' },
    { type: 'E', name: 'Heroic Strike', description: 'Powerful sword strike' },
    { type: 'Passive', name: 'Sword Master', description: 'Increases sword damage' },
    { type: 'Consumable', name: 'Strength Potion', description: 'Temporary strength boost' },
    { type: 'Mount', name: 'War Horse', description: 'Combat mount with armor' }
  ],
  'Bow': [
    { type: 'Q', name: 'Precise Shot', description: 'Accurate bow shot' },
    { type: 'W', name: 'Multi Shot', description: 'Fires multiple arrows' },
    { type: 'E', name: 'Rain of Arrows', description: 'Shoots arrows in an area' },
    { type: 'Passive', name: 'Archer Master', description: 'Increases bow damage' },
    { type: 'Consumable', name: 'Agility Potion', description: 'Temporary agility boost' },
    { type: 'Mount', name: 'Swift Horse', description: 'Fast mount for archers' }
  ]
}

export default function CreateBuildPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [buildName, setBuildName] = useState('')
  const [buildDescription, setBuildDescription] = useState('')
  const [contentType, setContentType] = useState('')
  const [weaponType, setWeaponType] = useState('')
  const [skills, setSkills] = useState<Omit<BuildSkill, 'id' | 'buildId' | 'createdAt'>[]>([])

  // Session kontrolü
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  // Weapon type değiştiğinde skill şablonlarını yükle
  useEffect(() => {
    if (weaponType && SKILL_TEMPLATES[weaponType]) {
      const weaponSkills = SKILL_TEMPLATES[weaponType]
      setSkills(weaponSkills.map(skill => ({
        skillType: skill.type,
        skillName: skill.name,
        description: skill.description
      })))
    } else {
      setSkills([])
    }
  }, [weaponType])

  // Weapon type icon'u
  const getWeaponIcon = (weaponType: string) => {
    if (weaponType.includes('Staff')) return <Zap className="w-4 h-4" />
    if (weaponType.includes('Sword')) return <Sword className="w-4 h-4" />
    if (weaponType.includes('Shield')) return <Shield className="w-4 h-4" />
    if (weaponType.includes('Fire')) return <Flame className="w-4 h-4" />
    if (weaponType.includes('Frost')) return <Snowflake className="w-4 h-4" />
    return <Sword className="w-4 h-4" />
  }

  // Skill type icon'u
  const getSkillIcon = (skillType: BuildSkill['skillType']) => {
    switch (skillType) {
      case 'Q': return <Zap className="w-4 h-4" />
      case 'W': return <Shield className="w-4 h-4" />
      case 'E': return <Sword className="w-4 h-4" />
      case 'Passive': return <Heart className="w-4 h-4" />
      case 'Consumable': return <Flame className="w-4 h-4" />
      case 'Mount': return <Snowflake className="w-4 h-4" />
      default: return <Zap className="w-4 h-4" />
    }
  }

  // Skill güncelle
  const updateSkill = (index: number, field: keyof BuildSkill, value: string) => {
    const updatedSkills = [...skills]
    updatedSkills[index] = { ...updatedSkills[index], [field]: value }
    setSkills(updatedSkills)
  }

  // Skill sil
  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  // Skill ekle
  const addSkill = () => {
    setSkills([...skills, {
      skillType: 'Q',
      skillName: '',
      description: ''
    }])
  }

  // Build oluştur
  const createBuild = async () => {
    if (!buildName || !contentType || !weaponType) {
      setError('Please fill in all required fields')
      return
    }

    if (skills.length === 0) {
      setError('Please add at least one skill')
      return
    }

    // Skill validasyonu
    const invalidSkills = skills.filter(skill => !skill.skillName.trim())
    if (invalidSkills.length > 0) {
      setError('Please fill in all skill names')
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
          name: buildName,
          description: buildDescription,
          contentType,
          weaponType,
          skills
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
          {/* Build Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Build Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Build Name *
                </label>
                <Input
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  placeholder="Enter build name..."
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={buildDescription}
                  onChange={(e) => setBuildDescription(e.target.value)}
                  placeholder="Describe your build..."
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content Type *
                </label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {CONTENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Weapon Type *
                </label>
                <Select value={weaponType} onValueChange={setWeaponType}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select weapon type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {WEAPON_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {weaponType && (
                <div className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg">
                  {getWeaponIcon(weaponType)}
                  <span className="text-white font-medium">{weaponType}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Skills</CardTitle>
                <Button
                  onClick={addSkill}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Zap className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a weapon type to load skill templates</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getSkillIcon(skill.skillType)}
                          <span className="text-white font-medium">{skill.skillType}</span>
                        </div>
                        <Button
                          onClick={() => removeSkill(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Skill Name
                          </label>
                          <Input
                            value={skill.skillName}
                            onChange={(e) => updateSkill(index, 'skillName', e.target.value)}
                            placeholder="Enter skill name..."
                            className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                          </label>
                          <Textarea
                            value={skill.description}
                            onChange={(e) => updateSkill(index, 'description', e.target.value)}
                            placeholder="Describe the skill..."
                            className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 