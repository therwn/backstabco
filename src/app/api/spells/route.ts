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

    // Read spells.json file
    const spellsPath = path.join(process.cwd(), 'dataset', 'spells.json')
    const spellsData = fs.readFileSync(spellsPath, 'utf-8')
    const spellsJson = JSON.parse(spellsData)

    // Extract spells from the complex structure
    let spells: any[] = []
    
    if (spellsJson.spells && spellsJson.spells.spell) {
      spells = Array.isArray(spellsJson.spells.spell) 
        ? spellsJson.spells.spell 
        : [spellsJson.spells.spell]
    }

    // Filter spells based on query, slot, category, and weapon type
    let filteredSpells = spells

    if (query) {
      filteredSpells = filteredSpells.filter((spell: any) =>
        spell.name?.toLowerCase().includes(query.toLowerCase()) ||
        spell.description?.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (slot) {
      filteredSpells = filteredSpells.filter((spell: any) =>
        spell.slot?.toLowerCase() === slot.toLowerCase()
      )
    }

    if (category) {
      filteredSpells = filteredSpells.filter((spell: any) =>
        spell.category?.toLowerCase() === category.toLowerCase()
      )
    }

    if (weaponType) {
      filteredSpells = filteredSpells.filter((spell: any) =>
        spell.weaponType?.toLowerCase() === weaponType.toLowerCase()
      )
    }

    // Transform spells to match our interface
    const transformedSpells = filteredSpells.map((spell: any) => ({
      id: spell.id || spell.name,
      name: spell.name,
      category: spell.category || 'weapon',
      slot: spell.slot || 'q',
      description: spell.description || '',
      weaponType: spell.weaponType
    })).slice(0, 20)

    return NextResponse.json(transformedSpells)
  } catch (error) {
    console.error('Error loading spells:', error)
    return NextResponse.json({ error: 'Failed to load spells' }, { status: 500 })
  }
} 