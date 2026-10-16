import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { getPublishedKnowledgePapers } from '../src/lib/knowledgePapers.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const catalogue = JSON.parse(await readFile(path.join(root, 'content', 'knowledge-papers.json'), 'utf8'))
const registry = JSON.parse(await readFile(path.join(root, 'src', 'data', 'knowledgePaperPreviewRegistry.json'), 'utf8'))
const published = getPublishedKnowledgePapers(catalogue)

test('static preview registry covers all canonical papers and leaves only unresolved editions unmapped', async () => {
  assert.equal(published.length, 128)
  assert.equal(Object.keys(registry).length, 125)
  const missingIds = published.map((paper) => paper.id).filter((id) => !registry[id]).sort()
  assert.deepEqual(missingIds, [
    'india-iraq-shared-prosperity-2026',
    'india-kenya-strengthening-ties-2026',
    'india-tunisia-shared-future-2026',
  ])

  const files = (await readdir(path.join(root, 'public', 'knowledge-papers'))).filter((file) => file.endsWith('.pdf')).sort()
  assert.equal(files.length, 125)
  assert.deepEqual(files, Object.keys(registry).map((id) => `${id}.pdf`).sort())
})

test('every published static preview is a valid PDF with at most ten pages', async () => {
  for (const [paperId, preview] of Object.entries(registry)) {
    assert.match(preview.url, new RegExp(`^/knowledge-papers/${paperId}\\.pdf$`))
    assert.ok(Number.isSafeInteger(preview.pageCount) && preview.pageCount > 0, `${paperId} has an invalid source page count`)
    assert.ok(Number.isSafeInteger(preview.previewPages) && preview.previewPages > 0 && preview.previewPages <= 10, `${paperId} exceeds the page limit`)
    assert.equal(preview.previewPages, Math.min(10, preview.pageCount), `${paperId} has inconsistent preview metadata`)
    const bytes = await readFile(path.join(root, 'public', 'knowledge-papers', `${paperId}.pdf`))
    assert.equal(new TextDecoder().decode(bytes.subarray(0, 5)), '%PDF-', `${paperId} has an invalid PDF signature`)
    const document = await PDFDocument.load(bytes, { updateMetadata: false })
    assert.equal(document.getPageCount(), preview.previewPages, `${paperId} has an invalid page count`)
  }
})
