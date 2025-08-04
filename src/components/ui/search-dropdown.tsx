'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from './input'
import { Button } from './button'
import { AlbionItem, searchItems } from '@/lib/albion-api'
import Image from 'next/image'

interface SearchDropdownProps {
  onItemSelect: (item: AlbionItem) => void
  placeholder?: string
  className?: string
}

export function SearchDropdown({ 
  onItemSelect, 
  placeholder = "Item ara...", 
  className = "" 
}: SearchDropdownProps) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<AlbionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedItemRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true)
        try {
          const results = await searchItems(query)
          setItems(results.slice(0, 10)) // İlk 10 sonucu göster
          setIsOpen(true)
          setSelectedIndex(-1)
        } catch (error) {
          console.error('Search error:', error)
          setItems([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setItems([])
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < items.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && items[selectedIndex]) {
            handleItemSelect(items[selectedIndex])
          }
          break
        case 'Escape':
          setIsOpen(false)
          setSelectedIndex(-1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, items, selectedIndex])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemSelect = (item: AlbionItem) => {
    onItemSelect(item)
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const formatItemName = (item: AlbionItem) => {
    return `${item.name} (T${item.tier})`
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ zIndex: 99999999 }}>
      <div className="relative">
        <div className="flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            onFocus={() => setIsOpen(true)}
          />
          {isLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
        </div>
        
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ zIndex: 99999999 }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                ref={index === selectedIndex ? selectedItemRef : null}
                className={`flex items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-gray-800 ${
                  index === selectedIndex ? 'bg-blue-600' : ''
                }`}
                onClick={() => handleItemSelect(item)}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-item.png'
                  }}
                />
                <div className="flex-1">
                  <div className="text-white font-medium">{formatItemName(item)}</div>
                  <div className="text-gray-400 text-sm">{item.category} • {item.subcategory}</div>
                </div>
              </div>
            ))}
            {items.length === 0 && !isLoading && (
              <div className="px-3 py-2 text-gray-400">Sonuç bulunamadı</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 