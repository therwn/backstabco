import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const slot = searchParams.get('slot') || ''
    const category = searchParams.get('category') || ''

    // Read spells.json file
    const spellsPath = path.join(process.cwd(), 'dataset', 'spells.json')
    const spellsData = fs.readFileSync(spellsPath, 'utf-8')
    const spells = JSON.parse(spellsData)

    // Filter spells based on query, slot, and category
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

    // Limit results to 20
    filteredSpells = filteredSpells.slice(0, 20)

    return NextResponse.json(filteredSpells)
  } catch (error) {
    console.error('Error loading spells:', error)
    return NextResponse.json({ error: 'Failed to load spells' }, { status: 500 })
  }
} 