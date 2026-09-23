import councilsData from '../../content/councils.json'
import councilProfiles from '../../content/council-profiles.json'
import { toCouncilSlug } from './contentRules'

const CATEGORY_TAG = 'Business Intelligence, Policy Advocacy, Networking, Business Expansion'
const profileBySlug = new Map(councilProfiles.map((profile) => [profile.slug, profile]))

export { toCouncilSlug }

function normalizeCouncil(item, type) {
  if (typeof item === 'string') {
    const name = item
    const sectorLabel = name.replace(/ Council$/i, '').toLowerCase()
    return {
      name,
      slug: toCouncilSlug(name),
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
  const profile = profileBySlug.get(item.slug)
  if (!profile) return item
  return {
    ...item,
    ...profile,
    sourceStatus: 'curated',
  }
}

export const allCouncils = [
  ...councilsData.sectorCouncils.items.map((item) => normalizeCouncil(item, 'sector')),
  ...councilsData.parliamentarianCouncils.items.map((item) => normalizeCouncil(item, 'parliamentarian')),
  ...councilsData.internationalBusinessCouncils.items.map((item) => normalizeCouncil(item, 'international')),
]

export function getCouncilBySlug(slug) {
  return allCouncils.find((council) => council.slug === slug)
}

export function getCouncilsByType(type) {
  return allCouncils.filter((council) => council.type === type)
}
