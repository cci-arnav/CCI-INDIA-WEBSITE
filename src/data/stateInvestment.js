import { locations } from './bharatInvestmentGrid.js'

// State-page editorial content is progressively populated from the existing BIG
// location registry. Never infer official policies or government statements here.
// Add reviewed state-specific fields by slug here (for example officialResources,
// infrastructure, chiefMinister, approvedMessage, messageSourceUrl,
// messagePublishedAt, and lastVerifiedAt) after the content is approved.
const approvedStateContent = {}

export const stateInvestmentProfiles = Object.fromEntries(locations.map((location) => [location.slug, {
  id: location.id,
  slug: location.slug,
  name: location.name,
  type: location.type,
  region: location.region,
  capital: location.capital,
  introduction: location.shortWriteup,
  investmentOverview: location.ideaHighlight,
  prioritySectors: location.keySectors,
  infrastructure: null,
  officialResources: [],
  heroImage: location.heroImage,
  heroImageAlt: location.heroImageAlt,
  heroImagePosition: location.heroImagePosition,
  imageCredit: location.imageCredit,
  imageCreditUrl: location.imageCreditUrl,
  imageLicense: location.imageLicense,
  imageLicenseUrl: location.imageLicenseUrl,
  chiefMinister: null,
  chiefMinisterDesignation: null,
  approvedMessage: null,
  messageSourceUrl: null,
  messagePublishedAt: null,
  lastVerifiedAt: null,
  ...approvedStateContent[location.slug],
}]))

export const getStateInvestmentProfile = (slug) => stateInvestmentProfiles[slug] ?? null
