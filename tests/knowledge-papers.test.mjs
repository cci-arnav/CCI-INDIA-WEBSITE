import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { filterKnowledgePapers, getPublishedKnowledgePapers, isSafePdfUrl, normalizeSearchQuery, validDate } from '../src/lib/knowledgePapers.js'

const papers = getPublishedKnowledgePapers([
  { id: 'draft', title: 'Draft', country: 'India', publishedAt: '2026-09-01', published: false },
  { id: 'older', title: 'Trade Outlook', country: 'India', countryCode: 'in', region: 'South Asia', description: 'Trade and investment', publishedAt: '2025-01-01', pdfUrl: '/knowledge-papers/trade.pdf', tags: ['Trade'], published: true },
  { id: 'newer', title: 'Market Brief', country: 'Japan', countryCode: 'JP', region: 'East Asia', year: 2026, publishedAt: 'invalid', pdfUrl: 'javascript:alert(1).pdf', published: true },
])

test('published papers are normalized, safely linked and sorted newest first', () => {
  assert.deepEqual(papers.map(({ id }) => id), ['newer', 'older'])
  assert.equal(papers[0].pdfUrl, '')
  assert.equal(papers[1].countryCode, 'IN')
  assert.equal(isSafePdfUrl('/knowledge-papers/trade.PDF'), true)
  assert.equal(isSafePdfUrl('javascript:alert(1).pdf'), false)
})

test('search is trimmed, case-insensitive and covers metadata', () => {
  assert.equal(normalizeSearchQuery('  TRADE   Outlook '), 'trade outlook')
  assert.deepEqual(filterKnowledgePapers(papers, { query: '  investment ' }).map(({ id }) => id), ['older'])
  assert.deepEqual(filterKnowledgePapers(papers, { query: '2026', country: 'Japan' }).map(({ id }) => id), ['newer'])
  assert.deepEqual(filterKnowledgePapers(papers, { region: 'South Asia' }).map(({ id }) => id), ['older'])
})

test('invalid dates and malformed collections fail safely', () => {
  assert.equal(validDate('not-a-date'), null)
  assert.deepEqual(getPublishedKnowledgePapers(null), [])
  assert.deepEqual(getPublishedKnowledgePapers([{ published: true }]), [])
})

test('published knowledge paper records resolve to local PDF and cover assets', () => {
  const content = JSON.parse(readFileSync(fileURLToPath(new URL('../content/knowledge-papers.json', import.meta.url)), 'utf8'))
  const published = getPublishedKnowledgePapers(content)

  assert.equal(published.length, 22)
  assert.equal(new Set(published.map((paper) => paper.id)).size, published.length)
  assert.equal(new Set(published.map((paper) => paper.pdfUrl)).size, published.length)

  for (const paper of published) {
    const pdf = fileURLToPath(new URL(`../public${paper.pdfUrl}`, import.meta.url))
    assert.ok(existsSync(pdf), `${paper.title} is missing its PDF`)
    if (paper.coverImage) {
      const cover = fileURLToPath(new URL(`../public${paper.coverImage}`, import.meta.url))
      assert.ok(existsSync(cover), `${paper.title} is missing its cover image`)
    }
  }
})
