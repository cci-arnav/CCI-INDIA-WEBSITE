import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const profiles = JSON.parse(fs.readFileSync(new URL('../content/council-profiles.json', import.meta.url), 'utf8'))

test('all parliamentarian and international councils have complete curated profiles', () => {
  assert.equal(profiles.length, 21)
  assert.equal(new Set(profiles.map(({ slug }) => slug)).size, 21)

  for (const profile of profiles) {
    assert.ok(profile.slug)
    assert.ok(profile.description.length >= 2, `${profile.slug} needs at least two description paragraphs`)
    assert.ok(profile.keyObjectives.length >= 3, `${profile.slug} needs at least three objectives`)
    assert.ok(profile.sources.length >= 1, `${profile.slug} needs at least one source`)
    assert.ok(profile.sources.every(({ url }) => url.startsWith('https://www.mea.gov.in/')), `${profile.slug} must use official MEA sources`)
  }
})
