import test from 'node:test'
import assert from 'node:assert/strict'
import { canAccessAdmin, COUNCIL_CATEGORY_ROUTES, publishedOnly, toCouncilSlug, validateNews } from '../src/lib/contentRules.js'

test('council slugs preserve stable ampersand mapping', () => {
  assert.equal(toCouncilSlug('India-Russia & CIS Business Council'), 'india-russia-and-cis-business-council')
  assert.equal(new Set(COUNCIL_CATEGORY_ROUTES).size, 3)
  assert.deepEqual(COUNCIL_CATEGORY_ROUTES, ['/councils', '/councils/parliamentarian', '/councils/international'])
})

test('public feed excludes drafts and future publications, newest first', () => {
  const now = new Date('2026-09-17T12:00:00Z')
  const items = [
    { id: 'draft', status: 'draft', published_at: '2026-09-16T00:00:00Z' },
    { id: 'future', status: 'published', published_at: '2026-09-18T00:00:00Z' },
    { id: 'older', status: 'published', published_at: '2026-09-15T00:00:00Z' },
    { id: 'newer', status: 'published', published_at: '2026-09-16T00:00:00Z' },
  ]
  assert.deepEqual(publishedOnly(items, now).map(({ id }) => id), ['newer', 'older'])
})

test('news validation requires publication metadata', () => {
  assert.deepEqual(Object.keys(validateNews({ title: '', description: '', category: '', status: 'published', published_at: '' })).sort(), ['category', 'description', 'published_at', 'title'])
  assert.deepEqual(validateNews({ title: 'Update', description: 'Summary', category: 'News', status: 'draft', published_at: '' }), {})
})

test('admin routes require configuration, authentication and authorization', () => {
  assert.equal(canAccessAdmin({ configured: true, authenticated: true, admin: true }), true)
  assert.equal(canAccessAdmin({ configured: true, authenticated: true, admin: false }), false)
  assert.equal(canAccessAdmin({ configured: false, authenticated: true, admin: true }), false)
})
