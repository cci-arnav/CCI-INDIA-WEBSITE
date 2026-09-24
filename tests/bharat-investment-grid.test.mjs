import assert from 'node:assert/strict'
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

test('illustrative opportunities reference valid locations and derive location totals', () => {
  assert.equal(opportunities.length, 24)
  assert.ok(opportunities.every((item) => item.illustrative === true))
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
