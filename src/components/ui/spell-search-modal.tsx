'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Search, Loader2, X, Zap, Shield, Sword, Heart, Flame, Snowflake, Eye } from 'lucide-react'

interface AlbionSpell {
  id: string
  name: string
  category: string
  slot: string
  description: string
  icon?: string
}

interface SpellSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSpellSelect: (spell: AlbionSpell) => void
  placeholder?: string
  slot?: string
  weaponType?: string
}

// Spell slot icons
const getSpellIcon = (slot: string) => {
  switch (slot.toLowerCase()) {
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



export function SpellSearchModal({ 
  isOpen, 
  onClose, 
  onSpellSelect, 
  placeholder = "Spell ara...",
  slot,
  weaponType
}: SpellSearchModalProps) {
  const [query, setQuery] = useState('')
  const [spells, setSpells] = useState<AlbionSpell[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true)
        try {
          // Fetch spells from API
          const params = new URLSearchParams({
            q: query,
            ...(slot && { slot }),
            ...(slot && { category: getCategoryFromSlot(slot) }),
            ...(weaponType && { weaponType })
          })
          
          const response = await fetch(`/api/spells?${params}`)
          if (response.ok) {
            const data = await response.json()
            setSpells(data)
          } else {
            console.error('Failed to fetch spells')
            setSpells([])
          }
          setSelectedIndex(-1)
        } catch (error) {
          console.error('Search error:', error)
          setSpells([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSpells([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, slot])

  // Helper function to get category from slot
  const getCategoryFromSlot = (slot: string) => {
    switch (slot.toLowerCase()) {
      case 'q':
      case 'w':
      case 'e':
      case 'passive':
        return 'weapon'
      case 'd':
        return 'head'
      case 'r':
        return 'armor'
      case 'f':
        return 'shoes'
      default:
        return ''
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < spells.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && spells[selectedIndex]) {
            handleSpellSelect(spells[selectedIndex])
          }
          break
        case 'Escape':
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, spells, selectedIndex, onClose])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSpellSelect = (spell: AlbionSpell) => {
    onSpellSelect(spell)
    setQuery('')
    setSpells([])
    setSelectedIndex(-1)
    onClose()
  }

  const formatSpellName = (spell: AlbionSpell) => {
    return `${spell.name} (${spell.slot.toUpperCase()})`
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999999] flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-black-800 border border-black-600 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black-600">
          <h2 className="text-xl font-semibold text-white">Spell Arama</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-black-700 border border-black-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:border-blue-500 transition-colors"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="px-6 pb-6 max-h-96 overflow-y-auto">
          {spells.length > 0 ? (
            <div className="space-y-2">
              {spells.map((spell, index) => (
                <div
                  key={spell.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-black-700'
                  }`}
                  onClick={() => handleSpellSelect(spell)}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-black-700 rounded">
                    {getSpellIcon(spell.slot)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{formatSpellName(spell)}</div>
                    <div className="text-sm opacity-70">{spell.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="text-center py-8 text-gray-400">
              Sonuç bulunamadı
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-8 text-gray-400">
              Arama yapmak için en az 2 karakter yazın
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
} 