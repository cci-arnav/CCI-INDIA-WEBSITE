import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import papers from '../content/knowledge-papers.json' with { type: 'json' }
import { imageRegistry } from '../src/data/imageRegistry.js'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const assetExists = (publicPath) => existsSync(`${projectRoot}/public${publicPath}`)

test('all Knowledge Papers have a stable image-registry entry', () => {
  assert.equal(papers.length, 128)
  assert.equal(Object.keys(imageRegistry.knowledgePapers).length, papers.length)
  for (const paper of papers) assert.ok(imageRegistry.knowledgePapers[paper.id], `Missing artwork entry for ${paper.id}`)
})

test('all State and UT registry images exist locally', () => {
  assert.equal(Object.keys(imageRegistry.statesAndUTs).length, 36)
  for (const [slug, image] of Object.entries(imageRegistry.statesAndUTs)) {
    assert.ok(assetExists(image), `Missing State/UT image for ${slug}: ${image}`)
  }
})

test('all mapped local Knowledge Paper images exist and partner flags are direct image URLs', () => {
  for (const [paperId, artwork] of Object.entries(imageRegistry.knowledgePapers)) {
    if (artwork.image) assert.ok(assetExists(artwork.image), `Missing local artwork for ${paperId}: ${artwork.image}`)
    for (const flag of artwork.flags || []) {
      assert.match(flag.src, /^https:\/\/flagcdn\.com\/w160\/[a-z]{2}\.png$/)
      assert.match(flag.alt, /^Flag of /)
    }
  }
})

test('the 16 requested bilateral papers resolve to India and their catalogue partner flag thumbnails', () => {
  const expectedIds = [
    'india-chad-opportunities-2026', 'india-namibia-collaboration-2026', 'india-malawi-sustainable-prosperity-2026',
    'india-georgia-opportunity-2026', 'india-suriname-shared-future-2026', 'india-singapore-shaping-tomorrow-2026',
    'india-senegal-growth-opportunities-2026', 'india-russia-bilateral-growth-2026', 'india-nicaragua-shared-future-2026',
    'india-kenya-strengthening-ties-2026', 'india-iraq-shared-prosperity-2026', 'india-belarus-partnership-2026',
    'india-ecuador-partnership-2026', 'india-armenia-partnership-2026', 'india-dominican-republic-prosperity-2026',
    'india-tunisia-shared-future-2026',
  ]
  const selected = expectedIds.map((id) => papers.find((paper) => paper.id === id))
  assert.ok(selected.every(Boolean), 'all requested catalogue paper IDs must remain present')

  for (const paper of selected) {
    const artwork = imageRegistry.knowledgePapers[paper.id]
    assert.equal(artwork.image, null, `${paper.id} should prefer its flag composition over a cover image`)
    assert.deepEqual(artwork.flags.map((flag) => flag.alt), ['Flag of India', `Flag of ${paper.country}`])
    assert.deepEqual(artwork.flags.map((flag) => flag.src), [
      'https://flagcdn.com/w160/in.png',
      `https://flagcdn.com/w160/${paper.countryCode.toLowerCase()}.png`,
    ])
  }
})

test('every ministry paper uses a topic image or an explicit branded fallback', () => {
  const ministryPapers = papers.filter((paper) => paper.collection === 'Ministry')
  assert.equal(ministryPapers.length, 50)
  for (const paper of ministryPapers) {
    const artwork = imageRegistry.knowledgePapers[paper.id]
    assert.ok(artwork.image || artwork.fallback === 'ministry', `No image or fallback for ${paper.id}`)
  }
})

test('Knowledge Paper cards render image sources from the centralized registry', () => {
  const cardPath = new URL('../src/components/knowledge/KnowledgePaperCard.jsx', import.meta.url)
  const card = readFileSync(cardPath, 'utf8')
  assert.match(card, /getKnowledgePaperImage\(paper\.id\)/)
  assert.match(card, /<img src=\{artwork\.image\} alt=\{artwork\.alt\}/)
})

test('ministry thumbnails use relevant existing PNG/JPG assets or the branded fallback', () => {
  const expectedImages = {
    'agriculture-and-farmers-welfare': '/assets/councils/agriculture.jpg',
    ayush: '/assets/councils/ayurveda-and-herbal-ayush.jpg',
    'chemicals-and-fertilizers': '/assets/councils/petroleum-and-petrochemicals.jpg',
    'civil-aviation': '/assets/councils/civil-aviation.jpg',
    coal: '/assets/councils/coal.jpg',
    'commerce-and-industry': '/assets/councils/foreign-trade.jpg',
    communications: '/assets/councils/telecom.jpg',
    'consumer-affairs-food-and-public-distribution':
      '/assets/councils/food-processing-and-value-addition.jpg',
    cooperation: '/assets/councils/rural-development.jpg',
    'corporate-affairs': '/assets/councils/company-law-and-corporate-affairs.jpg',
    culture: '/assets/councils/cultural.jpg',
    defence: '/assets/councils/defence.jpg',
    'development-of-north-eastern-region':
      '/assets/councils/north-eastern-region-development-council.jpg',
    education: '/assets/councils/education.jpg',
    'electronics-and-information-technology':
      '/assets/councils/computers-and-electronic-committee.jpg',
    'environment-forest-and-climate-change':
      '/assets/councils/environment-and-climate-change.jpg',
    'external-affairs': '/images/hero/india-russia-leaders.jpg',
    finance: '/assets/councils/banking-and-finance.jpg',
    'food-processing-industries':
      '/assets/councils/food-processing-and-value-addition.jpg',
    'health-and-family-welfare': '/assets/councils/healthcare.jpg',
    'heavy-industries': '/assets/councils/manufacturing.jpg',
    'home-affairs': '/assets/councils/private-security.jpg',
    'housing-and-urban-affairs': '/assets/councils/urban-development.jpg',
    'information-and-broadcasting': '/assets/councils/media.jpg',
    'jal-shakti': '/assets/councils/hydro-power.jpg',
    'labour-and-employment': '/assets/councils/skill-development-centre.jpg',
    'law-and-justice': '/assets/councils/legal-affairs-and-ipr.jpg',
    'micro-small-and-medium-enterprises':
      '/assets/councils/entrepreneurship-development.jpg',
    mines: '/assets/councils/mines-and-minerals.jpg',
    'new-and-renewable-energy': '/assets/councils/new-and-renewable-energy.jpg',
    'personnel-public-grievances-and-pensions': '/assets/councils/hrd.jpg',
    'petroleum-and-natural-gas': '/assets/councils/petroleum-and-petrochemicals.jpg',
    'ports-shipping-and-waterways': '/assets/councils/shipping-and-logistics.jpg',
    power: '/assets/councils/thermal-power.jpg',
    railways: '/assets/councils/railways.jpg',
    'road-transport-and-highways': '/assets/councils/highway.jpg',
    'rural-development': '/assets/councils/rural-development.jpg',
    'science-and-technology': '/assets/councils/bio-and-nano-technology.jpg',
    'skill-development-and-entrepreneurship':
      '/assets/councils/skill-development-centre.jpg',
    'social-justice-and-empowerment': '/assets/councils/non-government-organization.jpg',
    steel: '/assets/councils/iron-and-steel.jpg',
    textiles: '/assets/councils/textile.jpg',
    tourism: '/assets/councils/tourism-and-hospitality.jpg',
  }
  const unmatchedMinistries = new Set([
    'earth-sciences', 'fisheries-animal-husbandry-and-dairying', 'minority-affairs',
    'panchayati-raj', 'parliamentary-affairs', 'statistics-and-programme-implementation',
    'tribal-affairs',
  ])
  const ministryPapers = papers.filter((paper) => paper.collection === 'Ministry')
  assert.equal(Object.keys(expectedImages).length, 43)
  assert.equal(unmatchedMinistries.size, 7)

  for (const paper of ministryPapers) {
    const slug = paper.id.replace(/^ministry-/, '').replace(/-knowledge-paper-2026$/, '')
    const artwork = imageRegistry.knowledgePapers[paper.id]
    const expectedPath = expectedImages[slug]
    if (expectedPath) {
      assert.equal(artwork.image, expectedPath, `Unexpected image for ${slug}`)
      assert.match(artwork.image, /\.(png|jpe?g)$/i, `${slug} must use PNG/JPG artwork`)
      assert.ok(assetExists(expectedPath), `Missing image for ${slug}: ${expectedPath}`)
    } else {
      assert.ok(unmatchedMinistries.has(slug), `Unreviewed ministry mapping: ${slug}`)
      assert.equal(artwork.image, null, `${slug} should use the established ministry fallback`)
      assert.equal(artwork.fallback, 'ministry')
    }
  }
  assert.equal(Object.keys(expectedImages).length + unmatchedMinistries.size, ministryPapers.length)
})
