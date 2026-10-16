import { randomUUID } from 'node:crypto'
import { readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const privateRoot = path.join(root, 'private-knowledge-papers')
const reportPath = path.join(privateRoot, 'knowledge-paper-import-final-report.json')
const load = async (file, optional = false) => {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (optional && error.code === 'ENOENT') return null
    throw error
  }
}

const [extraction, inventory, comparison, previewReport, uploadReport, catalogue] = await Promise.all([
  load(path.join(privateRoot, 'extraction-manifest.json')),
  load(path.join(privateRoot, 'knowledge-paper-source-inventory.json')),
  load(path.join(privateRoot, 'knowledge-paper-catalogue-comparison.json')),
  load(path.join(privateRoot, 'preview-generation-report.json')),
  load(path.join(privateRoot, 'preview-upload-report.json'), true),
  load(path.join(root, 'content', 'knowledge-papers.json')),
])
if (!previewReport?.summary || !comparison?.sourceByPaperId) throw new Error('IMPORT_REPORT_INPUTS_INCOMPLETE')
const revisionGroups = comparison.revisionsRequiringReview.map((group) => ({
  paperId: group.paperId,
  title: catalogue.find((paper) => paper.id === group.paperId)?.title || null,
  sourceCount: group.sources.length,
  canonicalSelection: 'requires_review',
}))
const revisionRows = Object.values(previewReport.files).filter((file) => file.revisionCandidate)
const uploadRows = Object.values(uploadReport?.files || {})
const uploadedCount = uploadRows.filter((file) => file.uploadStatus === 'passed').length
const servedCount = uploadRows.filter((file) => file.servingStatus === 'passed').length
const storageConfigured = Boolean(uploadReport?.setup?.bucketPrivateAndValidated
  && uploadReport?.setup?.previewRegistrySchemaAvailable)
const sourceCandidateIds = new Set([
  ...Object.keys(comparison.sourceByPaperId),
  ...comparison.revisionsRequiringReview.map((group) => group.paperId),
])
const report = {
  generatedAt: new Date().toISOString(),
  catalogue: {
    originalCount: comparison.originalCatalogueCount,
    newlyAddedCount: comparison.entriesAdded,
    finalCount: catalogue.length,
    uniqueIdCount: new Set(catalogue.map((paper) => paper.id)).size,
    newlyAddedPaperIds: comparison.confidentNewPapers.map((paper) => paper.id),
  },
  archives: {
    discovered: extraction.archiveCount,
    extracted: extraction.successfullyProcessed,
    originalsDeleted: false,
  },
  sources: {
    pdfCount: inventory.pdfCount,
    uniquePdfCount: inventory.uniquePdfCount,
    duplicateFileCount: inventory.duplicateFileCount,
    validPdfCount: inventory.validPdfCount,
    unreadableOrInvalidPdfCount: inventory.unreadablePdfCount,
    exactCatalogueMatches: comparison.exactMatches.length,
    newPapersVisuallyConfirmed: comparison.confidentNewPapers.length,
    unmatchedValidPdfCount: comparison.unmatchedValidFilesRequiringReview.length,
    missingCatalogueSourceIds: catalogue.filter((paper) => !sourceCandidateIds.has(paper.id)).map((paper) => paper.id),
    revisionGroups,
    revisionSourceCount: revisionRows.length,
  },
  previews: {
    pageLimit: previewReport.previewPageLimit,
    uniqueSourcesAttempted: previewReport.summary.attempted,
    locallyGeneratedAndValidated: previewReport.summary.passed,
    generationOrValidationFailures: previewReport.summary.failed,
    revisionCandidatesGeneratedLocally: revisionRows.filter((file) => file.validationStatus === 'passed').length,
    canonicalPaperMappingsPrepared: Object.keys(comparison.sourceByPaperId).length,
    uploadedToPrivateStorage: uploadedCount,
    mappingsVerified: uploadRows.filter((file) => file.registryStatus === 'passed').length,
    servedByPreviewApi: servedCount,
    servingStatus: servedCount > 0 ? 'api_verified_locally' : 'not_live_verified',
  },
  storage: {
    previewBucketCreated: Boolean(uploadReport?.setup?.bucketPrivateAndValidated),
    previewBucketConfigured: Boolean(uploadReport?.setup?.bucketPrivateAndValidated),
    registryMigrationApplied: Boolean(uploadReport?.setup?.previewRegistrySchemaAvailable),
    manualSetupRequired: !storageConfigured,
    note: 'Create a private PDF-only preview bucket and apply the documented migration before running the explicit upload command.',
  },
  actions: {
    committed: false,
    deployed: false,
    archivesDeleted: false,
  },
}

const temporary = `${reportPath}.partial-${process.pid}-${randomUUID()}`
await writeFile(temporary, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 })
await rename(temporary, reportPath)
console.log(JSON.stringify({
  event: 'private-import-report-created',
  catalogueCount: report.catalogue.finalCount,
  newPapers: report.catalogue.newlyAddedCount,
  validUniqueSources: report.previews.uniqueSourcesAttempted,
  previewsValidated: report.previews.locallyGeneratedAndValidated,
  previewsUploaded: report.previews.uploadedToPrivateStorage,
}))
