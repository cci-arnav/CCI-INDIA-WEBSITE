import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.join(__dirname, '../content/councils.json')

const CATEGORY_TAG = 'Business Intelligence, Policy Advocacy, Networking, Business Expansion'

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function makeCouncil(name, type = 'sector') {
  const sectorLabel = name.replace(/ Council$/i, '').toLowerCase()
  return {
    name,
    slug: toSlug(name),
    type,
    categoryTag: CATEGORY_TAG,
    description: [
      `The ${name} at CCI India works on policy advocacy, business expansion and networking opportunities for stakeholders in the ${sectorLabel} space.`,
      'The council engages with government, industry and international partners to represent member interests, facilitate dialogue and support sustainable growth across the sector.',
      'Detailed council-specific content will be published here soon.',
    ],
    keyObjectives: [],
  }
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

data.sectorCouncils.items = data.sectorCouncils.items.map((name) => makeCouncil(name, 'sector'))
data.parliamentarianCouncils.items = data.parliamentarianCouncils.items.map((name) =>
  makeCouncil(name, 'parliamentarian'),
)
data.internationalBusinessCouncils.items = data.internationalBusinessCouncils.items.map((name) =>
  makeCouncil(name, 'international'),
)

fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
console.log('Updated councils.json with', data.sectorCouncils.items.length, 'sector councils')
