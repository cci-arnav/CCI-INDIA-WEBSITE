import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import {
  getLocation,
  getLocationOpportunities,
  locations,
  mapLocationById,
  opportunities,
} from '../src/data/bharatInvestmentGrid.js'

test('BIG includes all 28 states and 8 union territories with unique stable slugs', () => {
  assert.equal(locations.length, 36)
  assert.equal(locations.filter((item) => item.type === 'state').length, 28)
  assert.equal(locations.filter((item) => item.type === 'union-territory').length, 8)
  assert.equal(new Set(locations.map((item) => item.slug)).size, 36)
  assert.ok(locations.every((item) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)))
})

test('investment opportunities reference valid locations and derive location totals', () => {
  assert.equal(opportunities.length, 24)
  assert.ok(opportunities.every((item) => !('illustrative' in item)))
  assert.ok(opportunities.every((item) => !/illustrative|prototype|fictional|demonstration|sample/i.test([item.name, item.description, item.overview, item.investmentRequirement].join(' '))))
  assert.ok(opportunities.every((item) => getLocation(item.stateSlug)))
  assert.equal(getLocationOpportunities('gujarat').length, 2)
  assert.equal(getLocationOpportunities('andhra-pradesh').length, 0)
})

test('map identifiers resolve through the shared location dataset', () => {
  assert.equal(mapLocationById.mh.slug, 'maharashtra')
  assert.equal(mapLocationById.dn.slug, 'dadra-and-nagar-haveli-and-daman-and-diu')
  assert.equal(mapLocationById.dd.slug, 'dadra-and-nagar-haveli-and-daman-and-diu')
  assert.equal(mapLocationById.ld.slug, 'lakshadweep')
})

test('every location has unique, complete hero content and a local image asset', () => {
  assert.equal(new Set(locations.map((item) => item.heroImage)).size, 36)

  for (const item of locations) {
    const wordCount = item.shortWriteup.trim().split(/\s+/).length
    assert.ok(wordCount >= 35 && wordCount <= 65, `${item.name} write-up has ${wordCount} words`)
    assert.ok(item.heroImageAlt.length >= 20, `${item.name} is missing descriptive alt text`)
    assert.match(item.heroImagePosition, /^(left|center|right|\d+%) (top|center|bottom|\d+%)$/)
    assert.ok(item.imageSubject)
    assert.ok(item.imageCredit)
    assert.match(item.imageCreditUrl, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
    assert.ok(item.imageLicense)
    assert.match(item.imageLicenseUrl, /^https:\/\//)

    const assetUrl = new URL(`../public${item.heroImage}`, import.meta.url)
    assert.ok(existsSync(fileURLToPath(assetUrl)), `${item.name} hero asset is missing`)
  }
})
