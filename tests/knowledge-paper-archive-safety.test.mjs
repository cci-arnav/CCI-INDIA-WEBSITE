import test from 'node:test'
import assert from 'node:assert/strict'
import { safeArchivePath } from '../scripts/knowledgePaperArchiveSafety.mjs'

test('safe archive paths preserve nested relative paths', () => {
  assert.deepEqual(safeArchivePath('nested/year/Paper.pdf'), ['nested', 'year', 'Paper.pdf'])
  assert.deepEqual(safeArchivePath('folder /Paper.pdf'), ['folder', 'Paper.pdf'])
})

test('unsafe absolute, traversal, platform, and reserved-device archive paths are rejected', () => {
  for (const name of [
    '../outside.pdf',
    'nested/../../outside.pdf',
    '/absolute.pdf',
    'C:/outside.pdf',
    'nested\\outside.pdf',
    'nested//outside.pdf',
    'nested/CON.pdf',
    'nested/file?.pdf',
  ]) assert.equal(safeArchivePath(name), null, `Expected rejection for ${name}`)
})
