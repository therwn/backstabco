const fs = require('fs')
const path = require('path')
const { XMLParser } = require('fast-xml-parser')

async function convertXmlToJson() {
  try {
    console.log('Converting spells.xml to spells.json...')
    
    // Read XML file
    const xmlPath = path.join(__dirname, '../dataset/spells.xml')
    const xmlData = fs.readFileSync(xmlPath, 'utf-8')
    
    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    })
    
    console.log('Parsing XML...')
    const spellsXml = parser.parse(xmlData)
    
    // Extract and transform spells
    const transformedSpells = []
    
    if (spellsXml.spells) {
      // Extract activespells
      if (spellsXml.spells.activespell) {
        const activeSpells = Array.isArray(spellsXml.spells.activespell) 
          ? spellsXml.spells.activespell 
          : [spellsXml.spells.activespell]
        
        activeSpells.forEach(spell => {
          transformedSpells.push({
            uniqueName: spell['@_uniquename'] || '',
            name: spell['@_namelocatag'] || spell['@_uniquename'] || '',
            description: spell['@_descriptionlocatag'] || '',
            slot: spell['@_slot'] || 'q',
            category: spell['@_category'] || 'weapon',
            type: 'active',
            weaponType: extractWeaponType(spell['@_uniquename'] || ''),
            target: spell['@_target'] || '',
            castingTime: spell['@_castingtime'] || '0',
            energyUsage: spell['@_energyusage'] || '0',
            castRange: spell['@_castrange'] || '0'
          })
        })
      }
      
      // Extract passivespells
      if (spellsXml.spells.passivespell) {
        const passiveSpells = Array.isArray(spellsXml.spells.passivespell) 
          ? spellsXml.spells.passivespell 
          : [spellsXml.spells.passivespell]
        
        passiveSpells.forEach(spell => {
          transformedSpells.push({
            uniqueName: spell['@_uniquename'] || '',
            name: spell['@_namelocatag'] || spell['@_uniquename'] || '',
            description: spell['@_descriptionlocatag'] || '',
            slot: spell['@_slot'] || 'passive',
            category: spell['@_category'] || 'weapon',
            type: 'passive',
            weaponType: extractWeaponType(spell['@_uniquename'] || ''),
            target: spell['@_target'] || '',
            castingTime: '0',
            energyUsage: '0',
            castRange: '0'
          })
        })
      }
    }
    
    console.log(`Transformed ${transformedSpells.length} spells`)
    
    // Write to JSON file
    const jsonPath = path.join(__dirname, '../dataset/spells-transformed.json')
    fs.writeFileSync(jsonPath, JSON.stringify(transformedSpells, null, 2))
    
    console.log(`✅ Successfully converted to ${jsonPath}`)
    console.log(`📊 Total spells: ${transformedSpells.length}`)
    
    // Show some statistics
    const weaponTypes = {}
    const categories = {}
    const slots = {}
    
    transformedSpells.forEach(spell => {
      weaponTypes[spell.weaponType] = (weaponTypes[spell.weaponType] || 0) + 1
      categories[spell.category] = (categories[spell.category] || 0) + 1
      slots[spell.slot] = (slots[spell.slot] || 0) + 1
    })
    
    console.log('\n📈 Statistics:')
    console.log('Weapon Types:', weaponTypes)
    console.log('Categories:', categories)
    console.log('Slots:', slots)
    
  } catch (error) {
    console.error('❌ Error converting XML to JSON:', error)
  }
}

function extractWeaponType(spellName) {
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

convertXmlToJson()
