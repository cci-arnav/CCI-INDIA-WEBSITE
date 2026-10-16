import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { locations } from '../src/data/bharatInvestmentGrid.js'
import { getStateInvestmentProfile, stateInvestmentProfiles } from '../src/data/stateInvestment.js'

const appSource = readFileSync(fileURLToPath(new URL('../src/App.jsx', import.meta.url)), 'utf8')
const mapSource = readFileSync(fileURLToPath(new URL('../src/components/big/BIGMap.jsx', import.meta.url)), 'utf8')
const stateLandingSource = readFileSync(fileURLToPath(new URL('../src/pages/StatesInvestment.jsx', import.meta.url)), 'utf8')
const detailSource = readFileSync(fileURLToPath(new URL('../src/pages/StateInvestmentDetail.jsx', import.meta.url)), 'utf8')

test('state investment profiles cover all 28 states and 8 Union Territories with stable BIG slugs', () => {
  assert.equal(Object.keys(stateInvestmentProfiles).length, 36)
  assert.equal(locations.filter((item) => item.type === 'state').length, 28)
  assert.equal(locations.filter((item) => item.type === 'union-territory').length, 8)
  for (const location of locations) {
    const profile = getStateInvestmentProfile(location.slug)
    assert.equal(profile?.name, location.name)
    assert.equal(profile?.type, location.type)
    assert.ok(profile?.heroImage)
    assert.ok(profile?.prioritySectors.length)
  }
  assert.equal(getStateInvestmentProfile('not-a-location'), null)
})

test('State Investment reuses BIGMap and routes selections to state investment detail pages', () => {
  assert.ok(stateLandingSource.includes("import BIGMap from '../components/big/BIGMap'"))
  assert.match(stateLandingSource, /<BIGMap stateRouteBase="\/state-investment" navigateOnTouch \/>/)
  assert.match(mapSource, /stateRouteBase = '\/bharat-investment-grid\/state'/)
  assert.match(mapSource, /navigate\(`\$\{stateRouteBase\}\/\$\{location\.slug\}`\)/)
  assert.match(appSource, /path="\/state-investment\/:stateSlug"/)
  assert.match(stateLandingSource, /locations\.map\(\(location\)/)
})

test('Chief Minister content stays an explicit approved-content placeholder until sourced', () => {
  assert.ok(locations.every((location) => {
    const profile = getStateInvestmentProfile(location.slug)
    return profile.chiefMinister === null && profile.approvedMessage === null && profile.messageSourceUrl === null
  }))
  assert.match(detailSource, /will be added after CCI India confirms and approves the letter/)
  assert.match(detailSource, /No statement or endorsement is attributed/)
  assert.match(detailSource, /Official links pending verification/)
})
