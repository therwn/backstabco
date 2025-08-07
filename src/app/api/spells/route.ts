import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { XMLParser } from 'fast-xml-parser'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const slot = searchParams.get('slot') || ''
    const category = searchParams.get('category') || ''
    const weaponType = searchParams.get('weaponType') || ''

    // Read spells.xml file
    const spellsPath = path.join(process.cwd(), 'dataset', 'spells.xml')
    const spellsData = fs.readFileSync(spellsPath, 'utf-8')
    
    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    })
    const spellsXml = parser.parse(spellsData)

    // Extract spells from XML structure
    let spells: any[] = []
    
    if (spellsXml.spells) {
      const allSpells = []
      
      // Extract activespells
      if (spellsXml.spells.activespell) {
        const activeSpells = Array.isArray(spellsXml.spells.activespell) 
          ? spellsXml.spells.activespell 
          : [spellsXml.spells.activespell]
        allSpells.push(...activeSpells)
      }
      
      // Extract passivespells
      if (spellsXml.spells.passivespell) {
        const passiveSpells = Array.isArray(spellsXml.spells.passivespell) 
          ? spellsXml.spells.passivespell 
          : [spellsXml.spells.passivespell]
        allSpells.push(...passiveSpells)
      }
      
      spells = allSpells
    }

    // Filter spells based on query, slot, category, and weapon type
    let filteredSpells = spells

    if (query) {
      filteredSpells = filteredSpells.filter((spell: any) =>
        spell['@_uniquename']?.toLowerCase().includes(query.toLowerCase()) ||
        spell['@_namelocatag']?.toLowerCase().includes(query.toLowerCase()) ||
        spell['@_descriptionlocatag']?.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (slot) {
      filteredSpells = filteredSpells.filter((spell: any) => {
        // Map slot names to XML slot format
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
        return spell['@_slot']?.toLowerCase() === mappedSlot.toLowerCase()
      })
    }

    if (category) {
      filteredSpells = filteredSpells.filter((spell: any) =>
        spell['@_category']?.toLowerCase() === category.toLowerCase()
      )
    }

    if (weaponType) {
      filteredSpells = filteredSpells.filter((spell: any) => {
        const spellName = spell['@_uniquename']?.toLowerCase() || ''
        return spellName.includes(weaponType.toLowerCase())
      })
    }

    // Transform spells to match our interface
    const transformedSpells = filteredSpells.map((spell: any) => ({
      uniqueName: spell['@_uniquename'] || '',
      name: spell['@_namelocatag'] || spell['@_uniquename'] || '',
      description: spell['@_descriptionlocatag'] || '',
      slot: spell['@_slot'] || 'q',
      category: spell['@_category'] || 'weapon',
      type: spell['@_target'] ? 'active' : 'passive',
      weaponType: extractWeaponType(spell['@_uniquename'] || '')
    })).slice(0, 50)

    return NextResponse.json(transformedSpells)
  } catch (error) {
    console.error('Error loading spells:', error)
    return NextResponse.json({ error: 'Failed to load spells' }, { status: 500 })
  }
}

// Extract weapon type from spell uniqueName
function extractWeaponType(spellName: string): string {
  const name = spellName.toLowerCase()
  if (name.includes('sword')) return 'sword'
  if (name.includes('bow')) return 'bow'
  if (name.includes('staff')) return 'staff'
  if (name.includes('mace')) return 'mace'
  if (name.includes('axe')) return 'axe'
  if (name.includes('dagger')) return 'dagger'
  if (name.includes('spear')) return 'spear'
  if (name.includes('crossbow')) return 'crossbow'
  if (name.includes('fire_staff')) return 'fire_staff'
  if (name.includes('frost_staff')) return 'frost_staff'
  if (name.includes('arcane_staff')) return 'arcane_staff'
  if (name.includes('holy_staff')) return 'holy_staff'
  if (name.includes('nature_staff')) return 'nature_staff'
  if (name.includes('hammer')) return 'hammer'
  if (name.includes('quarterstaff')) return 'quarterstaff'
  return 'general'
} 