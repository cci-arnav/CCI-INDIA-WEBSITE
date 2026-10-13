import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import home from '../content/home.json' with { type: 'json' }
import editorial from '../content/home-editorial.json' with { type: 'json' }
import about from '../content/about.json' with { type: 'json' }

const publicFile = (path) => fileURLToPath(new URL(`../public${path}`, import.meta.url))

test('all homepage service and centre items have structured, editable modal content', () => {
  assert.deepEqual(Object.keys(editorial.whatWeDo).sort(), home.whatWeDo.flows.map(({ label }) => label).sort())
  assert.deepEqual(Object.keys(editorial.centers).sort(), home.centers.items.map(({ name }) => name).sort())

  for (const item of [...Object.values(editorial.whatWeDo), ...Object.values(editorial.centers)]) {
    assert.ok(item.eyebrow)
    assert.ok(item.placeholderLabel)
    assert.ok(item.intro)
    assert.ok(item.sections.length >= 1)
    if (item.image) assert.ok(existsSync(publicFile(item.image)), `missing modal image: ${item.image}`)
  }
})

test('DG note uses an existing official leadership profile and is clearly marked as a draft', () => {
  const director = about.leadership.members.find(({ title }) => title === 'Director General')
  assert.ok(director)
  assert.equal(editorial.dgNote.name, director.name)
  assert.equal(editorial.dgNote.designation, `${director.title}, CCI India`)
  assert.equal(editorial.dgNote.image, director.image)
  assert.ok(existsSync(publicFile(editorial.dgNote.image)))
  assert.match(editorial.dgNote.reviewNotice, /draft/i)
  assert.match(editorial.dgNote.reviewNotice, /not an approved statement/i)

  const wordCount = editorial.dgNote.paragraphs.join(' ').trim().split(/\s+/).length
  assert.ok(wordCount >= 200 && wordCount <= 300, `DG draft has ${wordCount} words`)
})
