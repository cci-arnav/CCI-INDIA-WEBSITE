import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { KNOWLEDGE_PAPER_PREVIEW_PAGE_LIMIT } from '../src/lib/knowledgePaperPreviewLimits.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const privateRoot = path.join(root, 'private-knowledge-papers')
const staticRoot = path.join(root, 'public', 'knowledge-papers')
const registryPath = path.join(root, 'src', 'data', 'knowledgePaperPreviewRegistry.json')
const comparisonPath = path.join(privateRoot, 'knowledge-paper-catalogue-comparison.json')
const reportPath = path.join(privateRoot, 'preview-generation-report.json')
const cataloguePath = path.join(root, 'content', 'knowledge-papers.json')
const checksum = (bytes) => createHash('sha256').update(bytes).digest('hex')
const isWithin = (parent, child) => child.startsWith(`${parent}${path.sep}`)

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'))
}

async function validatePreview(metadata, sourceSha256) {
  const sourcePath = path.resolve(privateRoot, ...String(metadata.previewPath).split('/'))
  if (!isWithin(privateRoot, sourcePath)) throw new Error('PREVIEW_PATH_INVALID')
  const bytes = await readFile(sourcePath)
  if (bytes.length !== metadata.previewBytes
    || checksum(bytes) !== metadata.previewSha256
    || new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
    throw new Error(`PREVIEW_CHECKSUM_OR_SIGNATURE_INVALID_${sourceSha256}`)
  }
  const pdf = await PDFDocument.load(bytes, { updateMetadata: false })
  const expectedPageCount = Math.min(KNOWLEDGE_PAPER_PREVIEW_PAGE_LIMIT, metadata.sourcePageCount)
  if (metadata.validationStatus !== 'passed'
    || metadata.previewPageCount !== expectedPageCount
    || pdf.getPageCount() !== expectedPageCount) {
    throw new Error(`PREVIEW_PAGE_COUNT_INVALID_${sourceSha256}`)
  }
  return { sourcePath, previewPages: pdf.getPageCount(), previewBytes: bytes.length, previewSha256: metadata.previewSha256 }
}

const [comparison, previewReport, catalogue] = await Promise.all([
  readJson(comparisonPath),
  readJson(reportPath),
  readJson(cataloguePath),
])
if (previewReport.previewPageLimit !== KNOWLEDGE_PAPER_PREVIEW_PAGE_LIMIT) {
  throw new Error('PREVIEW_PAGE_LIMIT_CONFIGURATION_MISMATCH')
}

const publishedIds = new Set(catalogue.filter((paper) => paper.published === true).map((paper) => paper.id))
const revisionsUnderReview = new Set((comparison.revisionsRequiringReview || []).map((item) => item.paperId))
const canonical = Object.entries(comparison.sourceByPaperId || {})
if (canonical.length !== 125) throw new Error('CANONICAL_PREVIEW_COUNT_MISMATCH')

const registry = {}
const validated = []
for (const [paperId, source] of canonical) {
  if (!/^[a-z0-9][a-z0-9-]{0,119}$/.test(paperId)
    || !publishedIds.has(paperId)
    || revisionsUnderReview.has(paperId)
    || !/^[a-f0-9]{64}$/.test(source.sha256 || '')) {
    throw new Error(`CANONICAL_PAPER_MAPPING_INVALID_${paperId}`)
  }
  const metadata = previewReport.files?.[source.sha256]
  if (!metadata || metadata.sourceSha256 !== source.sha256) {
    throw new Error(`CANONICAL_PREVIEW_METADATA_MISSING_${paperId}`)
  }
  const validatedPreview = await validatePreview(metadata, source.sha256)
  const fileName = `${paperId}.pdf`
  const destination = path.join(staticRoot, fileName)
  registry[paperId] = {
    url: `/knowledge-papers/${fileName}`,
    pageCount: metadata.sourcePageCount,
    previewPages: validatedPreview.previewPages,
  }
  validated.push({ paperId, destination, ...validatedPreview })
}

const ambiguousIds = new Set(revisionsUnderReview)
const missingIds = [...publishedIds].filter((paperId) => !registry[paperId])
if (missingIds.length !== 3 || missingIds.some((paperId) => !ambiguousIds.has(paperId))) {
  throw new Error('UNEXPECTED_UNMAPPED_PUBLISHED_PAPER')
}

await mkdir(staticRoot, { recursive: true })
await mkdir(path.dirname(registryPath), { recursive: true })
for (const { paperId, sourcePath, destination, previewBytes, previewSha256 } of validated) {
  const sourceBytes = await readFile(sourcePath)
  if (sourceBytes.length !== previewBytes || checksum(sourceBytes) !== previewSha256) {
    throw new Error(`PREVIEW_CHANGED_AFTER_VALIDATION_${paperId}`)
  }
  await copyFile(sourcePath, destination)
  const copiedBytes = await readFile(destination)
  if (copiedBytes.length !== previewBytes || checksum(copiedBytes) !== previewSha256) {
    throw new Error(`STATIC_PREVIEW_COPY_VERIFICATION_FAILED_${paperId}`)
  }
}

await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`)

console.log(JSON.stringify({
  event: 'static-knowledge-paper-previews-published-locally',
  canonicalPreviews: validated.length,
  missingAmbiguousPreviews: missingIds.length,
  totalBytes: validated.reduce((total, item) => total + item.previewBytes, 0),
  targetDirectory: path.relative(root, staticRoot),
  registry: path.relative(root, registryPath),
}, null, 2))
