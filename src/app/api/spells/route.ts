import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const slot = searchParams.get('slot') || ''
    const category = searchParams.get('category') || ''
    const weaponType = searchParams.get('weaponType') || ''

    // Read transformed JSON file
    const spellsPath = path.join(process.cwd(), 'dataset', 'spells-transformed.json')
    const spellsData = fs.readFileSync(spellsPath, 'utf-8')
    const spells = JSON.parse(spellsData)

    // Filter spells based on query, slot, category, and weapon type
    let filteredSpells = spells

    if (query) {
      filteredSpells = filteredSpells.filter((spell: any) =>
        spell.uniqueName?.toLowerCase().includes(query.toLowerCase()) ||
        spell.name?.toLowerCase().includes(query.toLowerCase()) ||
        spell.description?.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (slot) {
      filteredSpells = filteredSpells.filter((spell: any) => {
        // Map slot names to our slot format
        const slotMapping: Record<string, string> = {
          'mainhand1': 'q',
          'mainhand2': 'w', 
          'mainhand3': 'e',
          'head1': 'd',
          'armor1': 'r',
          'shoes1': 'f',
          'passive': 'passive'
        }
        
        const mappedSlot = slotMapping[slot] || slot
        return spell.slot?.toLowerCase() === mappedSlot.toLowerCase()
      })
    }

    if (category) {
      filteredSpells = filteredSpells.filter((spell: any) =>
        spell.category?.toLowerCase() === category.toLowerCase()
      )
    }

    if (weaponType) {
      filteredSpells = filteredSpells.filter((spell: any) => {
        const spellName = spell.uniqueName?.toLowerCase() || ''
        return spellName.includes(weaponType.toLowerCase())
      })
    }

    // Return filtered spells (limit to 50 for performance)
    return NextResponse.json(filteredSpells.slice(0, 50))
  } catch (error) {
    console.error('Error loading spells:', error)
    return NextResponse.json({ error: 'Failed to load spells' }, { status: 500 })
  }
} 