import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { PDFDocument } from 'pdf-lib'

const bucket = 'knowledge-papers-private'
const privatePrefix = 'papers'
const apiBase = process.env.KNOWLEDGE_PAPERS_API_BASE || 'http://127.0.0.1:3000'
const batchSize = Number(process.env.KNOWLEDGE_PAPERS_BATCH_SIZE || 5)
const tempRoot = path.join(tmpdir(), 'cci-knowledge-papers-ingest')
const manifestPath = path.join(tempRoot, 'onboarding-report.json')
const coverage = JSON.parse(readFileSync('content/knowledge-paper-coverage.json', 'utf8'))
const localManifest = JSON.parse(readFileSync('scripts/knowledge-paper-source-manifest.json', 'utf8'))
const catalogue = JSON.parse(readFileSync('content/knowledge-papers.json', 'utf8'))
const catalogueById = new Map(catalogue.map((paper) => [paper.id, paper]))
const folderPreference = {
  'International & Sectoral': '1tj4Yy700YRNv9R6R4UKuTb4nuag5FEu_',
  'State & UT': '1jgedKEDRTzbugfT8Svn_aBK1uWVB_4vS',
  Ministry: '1AHFjNwIofVZgEDv-M5uEtWViM1aktYek',
}

function loadLocalEnv() {
  const file = path.resolve('.env.local')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match) continue
    process.env[match[1]] = match[2].trim().replace(/^['"]/, '').replace(/['"]$/, '')
  }
}

function decodeHtml(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

function normalizeName(value) {
  return decodeHtml(String(value || ''))
    .replace(/\s+PDF$/i, '')
    .replace(/\.pdf$/i, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en')
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function md5(bytes) {
  return createHash('md5').update(bytes).digest('hex')
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function timedFetch(url, init = {}, timeoutMs = 30_000) {
  const timeout = AbortSignal.timeout(timeoutMs)
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout
  return fetch(url, { ...init, signal })
}

async function driveFetch(url, options = {}, timeoutMs = 45000) {
  let lastResponse
  let lastError
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) })
      if (response.status < 500 && response.status !== 429) return response
      lastResponse = response
      await response.body?.cancel()
    } catch (error) {
      lastError = error
    }
    await pause(800 * (attempt + 1))
  }
  if (lastError && !lastResponse) throw lastError
  return lastResponse
}

function loadPreviousReport() {
  try { return JSON.parse(readFileSync(manifestPath, 'utf8')) } catch { return { startedAt: new Date().toISOString(), papers: {} } }
}

function saveReport(report) {
  writeFileSync(manifestPath, JSON.stringify(report, null, 2))
}

async function listDriveFiles(folderId) {
  const response = await fetch(`https://drive.google.com/drive/folders/${folderId}`)
  if (!response.ok) throw new Error(`DRIVE_FOLDER_UNAVAILABLE_${response.status}`)
  const html = await response.text()
  const matches = []
  const pattern = /<div\b[^>]*data-id="([A-Za-z0-9_-]{20,})"[^>]*data-tooltip="([^"]+)"/g
  let match
  while ((match = pattern.exec(html))) {
    const item = { fileId: match[1], name: decodeHtml(match[2].replace(/\s+PDF$/, '')) }
    if (!matches.some((entry) => entry.fileId === item.fileId)) matches.push(item)
  }
  return matches
}

async function buildDriveIndex() {
  const folderIds = [...new Set(coverage.driveFolderListings.map((folder) => folder.folderId))]
  const index = new Map()
  for (const folderId of folderIds) {
    try { index.set(folderId, await listDriveFiles(folderId)) }
    catch (error) { index.set(folderId, []); console.log(JSON.stringify({ event: 'drive-folder-unavailable', folderId, code: error.message })) }
  }
  return index
}

function findSource(paper, driveIndex, localSources) {
  const preferredFolder = folderPreference[paper.collection]
  const candidates = (paper.sourceCandidates || []).map((candidate) => {
    const files = driveIndex.get(candidate.folderId) || []
    const matches = files.filter((file) => normalizeName(file.name) === normalizeName(candidate.driveName))
    return { candidate, matches }
  }).filter(({ matches }) => matches.length > 0)

  const preferred = candidates.filter(({ candidate }) => candidate.folderId === preferredFolder)
  const selected = preferred.length === 1 ? preferred[0] : preferred.length === 0 && candidates.length === 1 ? candidates[0] : null
  const local = localSources.get(paper.id)
  if (local) {
    const localPath = path.join('C:/Users/PC 02', local.sourceDirectory, local.sourceFile)
    if (existsSync(localPath)) {
      const localBytes = new Uint8Array(readFileSync(localPath))
      if (sha256(localBytes) === local.sha256) return { kind: 'local', sourcePath: localPath, sourceName: local.sourceFile }
    }
  }
  const archived = coverage.sourcePdfMetadata.additionalArchiveAudit.files.find((file) => file.candidateCatalogueId === paper.id)
  if (archived) {
    const archiveRoot = path.join(tmpdir(), 'cci-knowledge-paper-embassy-audit-20261015', ' knowledge paper-embassy (pdf)')
    const archivePath = path.join(archiveRoot, archived.sourceFile)
    if (existsSync(archivePath)) {
      const archiveBytes = new Uint8Array(readFileSync(archivePath))
      if (archiveBytes.byteLength === archived.sizeBytes && sha256(archiveBytes) === archived.sha256) {
        return { kind: 'local', sourcePath: archivePath, sourceName: archived.sourceFile }
      }
    }
  }
  if (!selected || selected.matches.length !== 1) {
    return { kind: candidates.length ? 'ambiguous' : 'missing', candidateCount: candidates.length }
  }
  return {
    kind: 'drive',
    fileId: selected.matches[0].fileId,
    sourceName: selected.matches[0].name,
    sourceFolderId: selected.candidate.folderId,
    candidateName: selected.candidate.driveName,
  }
}

function findCachedSource(paper, previous, localSources) {
  const saved = previous.source || previous
  const validStatus = ['validated', 'downloaded-and-pdf-validated', 'preview-verified', 'upload-or-api-failed'].includes(saved.status)
  if (!validStatus || !saved.sha256 || !Number.isSafeInteger(saved.sizeBytes) || !saved.sourceName) return null

  if (saved.path && existsSync(saved.path) && statSync(saved.path).size === saved.sizeBytes) {
    return { kind: 'cached', sourcePath: saved.path, sourceName: saved.sourceName, saved }
  }

  const local = localSources.get(paper.id)
  if (local?.sourceFile === saved.sourceName) {
    const sourcePath = path.join('C:/Users/PC 02', local.sourceDirectory, local.sourceFile)
    if (existsSync(sourcePath) && statSync(sourcePath).size === saved.sizeBytes) return { kind: 'cached', sourcePath, sourceName: saved.sourceName, saved }
  }

  const archived = coverage.sourcePdfMetadata.additionalArchiveAudit.files.find((file) => file.candidateCatalogueId === paper.id && file.sourceFile === saved.sourceName)
  if (archived) {
    const sourcePath = path.join(tmpdir(), 'cci-knowledge-paper-embassy-audit-20261015', ' knowledge paper-embassy (pdf)', archived.sourceFile)
    if (existsSync(sourcePath) && statSync(sourcePath).size === saved.sizeBytes) return { kind: 'cached', sourcePath, sourceName: saved.sourceName, saved }
  }

  const cachedFiles = readdirSync(tempRoot).filter((file) => file.startsWith(`${paper.id}.`) && file.endsWith('.pdf'))
  for (const file of cachedFiles) {
    const sourcePath = path.join(tempRoot, file)
    if (statSync(sourcePath).size === saved.sizeBytes) return { kind: 'cached', sourcePath, sourceName: saved.sourceName, saved }
  }
  return null
}

async function bytesForSource(paper, source) {
  if (source.kind === 'cached') {
    const header = readFileSync(source.sourcePath).subarray(0, 5)
    if (statSync(source.sourcePath).size !== source.saved.sizeBytes || header.toString('ascii') !== '%PDF-') throw new Error('CACHED_SOURCE_MISMATCH')
    return { sha256: source.saved.sha256, sizeBytes: source.saved.sizeBytes, pageCount: source.saved.pageCount, path: source.sourcePath }
  }
  const outputPath = path.join(tempRoot, `${paper.id}.${source.kind === 'local' ? 'local' : source.fileId}.pdf`)
  let bytes
  if (source.kind === 'local') {
    bytes = new Uint8Array(readFileSync(source.sourcePath))
  } else {
    const url = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(source.fileId)}`
    let expectedSize = null
    if (existsSync(outputPath)) {
      const cached = new Uint8Array(readFileSync(outputPath))
      if (Buffer.from(cached.subarray(0, 5)).toString('ascii') === '%PDF-') {
        try { await PDFDocument.load(cached); bytes = cached } catch { bytes = null }
      }
    }
    if (!bytes) {
      const head = await driveFetch(url, { method: 'HEAD' })
      if (!head.ok) throw new Error(`DRIVE_HEAD_FAILED_${head.status}`)
      expectedSize = Number(head.headers.get('content-length'))
      if (!Number.isSafeInteger(expectedSize) || expectedSize <= 0) throw new Error('DRIVE_FILE_SIZE_UNAVAILABLE')
    }
    if (!bytes) {
      const chunkSize = 1024 * 1024
      const chunks = []
      for (let start = 0; start < expectedSize; start += chunkSize) {
        const end = Math.min(start + chunkSize, expectedSize) - 1
        const response = await driveFetch(url, { headers: { Range: `bytes=${start}-${end}` } })
        const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
        if (contentType === 'text/html') throw new Error('DRIVE_DOWNLOAD_INTERSTITIAL_OR_LOGIN_REQUIRED')
        if (response.status === 200) {
          const fullBytes = new Uint8Array(await response.arrayBuffer())
          if (fullBytes.byteLength !== expectedSize || Buffer.from(fullBytes.subarray(0, 5)).toString('ascii') !== '%PDF-') throw new Error('DRIVE_RANGE_IGNORED')
          bytes = fullBytes
          break
        }
        if (response.status !== 206) throw new Error(`DRIVE_RANGE_FAILED_${response.status}`)
        const range = response.headers.get('content-range') || ''
        if (!range.startsWith(`bytes ${start}-${end}/`)) throw new Error('DRIVE_RANGE_MISMATCH')
        const chunk = new Uint8Array(await response.arrayBuffer())
        if (chunk.byteLength !== end - start + 1) throw new Error('DRIVE_DOWNLOAD_INCOMPLETE')
        chunks.push(chunk)
      }
      if (!bytes) {
        bytes = new Uint8Array(expectedSize)
        let offset = 0
        for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
      }
      if (Buffer.from(bytes.subarray(0, 5)).toString('ascii') !== '%PDF-') throw new Error('DRIVE_RESPONSE_NOT_PDF')
      writeFileSync(outputPath, bytes)
    }
  }
  if (Buffer.from(bytes.subarray(0, 5)).toString('ascii') !== '%PDF-') throw new Error('DRIVE_RESPONSE_NOT_PDF')
  const parsed = await PDFDocument.load(bytes)
  return { sha256: sha256(bytes), sizeBytes: bytes.byteLength, pageCount: parsed.getPageCount(), path: source.sourcePath || outputPath }
}

async function getSupabase() {
  loadLocalEnv()
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SERVER_SUPABASE_CONFIGURATION_MISSING')
  const headers = { apikey: key, Authorization: `Bearer ${key}` }
  return { url, key, headers }
}

async function readRegistryRow(supa, paperId) {
  const response = await timedFetch(`${supa.url}/rest/v1/knowledge_papers_private?paper_id=eq.${encodeURIComponent(paperId)}&select=paper_id,storage_path,active`, { headers: supa.headers })
  if (!response.ok) throw new Error(`REGISTRY_READ_FAILED_${response.status}`)
  const rows = await response.json()
  return rows[0] || null
}

async function objectMetadata(supa, storagePath) {
  const url = `${supa.url}/storage/v1/object/${bucket}/${storagePath.split('/').map(encodeURIComponent).join('/')}`
  const response = await timedFetch(url, { method: 'HEAD', headers: supa.headers })
  if (response.status === 404) return null
  // Supabase Storage currently reports a missing object as HTTP 400 with a
  // NoSuchKey payload. Treat that exact response as absent; other 400s remain
  // failures so we never overwrite an object based on an ambiguous error.
  if (response.status === 400) {
    const error = await response.json().catch(() => null)
    if (error?.code === 'NoSuchKey') return null
    const probe = await timedFetch(url, { headers: { ...supa.headers, Range: 'bytes=0-0' } })
    if (probe.status === 400) {
      const probeError = await probe.json().catch(() => null)
      if (probeError?.code === 'NoSuchKey') return null
    }
    if (probe.ok) {
      const contentRange = probe.headers.get('content-range') || ''
      const total = Number(contentRange.split('/')[1])
      const metadata = { contentType: (probe.headers.get('content-type') || '').split(';')[0].trim().toLowerCase(), sizeBytes: total, etag: (probe.headers.get('etag') || '').replaceAll('"', '').toLowerCase() }
      await probe.body?.cancel().catch(() => {})
      if (Number.isSafeInteger(total) && total > 0) return metadata
    }
    await probe.body?.cancel().catch(() => {})
  }
  if (!response.ok) throw new Error(`PRIVATE_OBJECT_READ_FAILED_${response.status}`)
  return {
    contentType: (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase(),
    sizeBytes: Number(response.headers.get('content-length')),
    etag: (response.headers.get('etag') || '').replaceAll('"', '').toLowerCase(),
  }
}

function verifyObjectMetadata(metadata, source, bytes) {
  if (!metadata || metadata.contentType !== 'application/pdf' || metadata.sizeBytes !== source.sizeBytes) throw new Error('PRIVATE_OBJECT_METADATA_MISMATCH')
  if (/^[a-f0-9]{32}$/.test(metadata.etag) && metadata.etag !== md5(bytes)) throw new Error('PRIVATE_OBJECT_CONTENT_CONFLICT')
}

async function ensureUploaded(supa, paper, source) {
  const bytes = new Uint8Array(readFileSync(source.path))
  if (bytes.byteLength !== source.sizeBytes || Buffer.from(bytes.subarray(0, 5)).toString('ascii') !== '%PDF-') throw new Error('CACHED_SOURCE_MISMATCH')
  const storagePath = `${privatePrefix}/${paper.id}/original.pdf`
  const existing = await readRegistryRow(supa, paper.id)
  if (existing && existing.storage_path !== storagePath) throw new Error('REGISTRY_PATH_CONFLICT')
  const existingMetadata = await objectMetadata(supa, storagePath)
  if (existingMetadata) verifyObjectMetadata(existingMetadata, source, bytes)
  let objectCreated = false

  if (!existingMetadata) {
    const response = await timedFetch(`${supa.url}/storage/v1/object/${bucket}/${storagePath.split('/').map(encodeURIComponent).join('/')}`, {
      method: 'POST',
      headers: { ...supa.headers, 'content-type': 'application/pdf', 'x-upsert': 'false' },
      body: bytes,
    }, 60_000)
    await response.body?.cancel().catch(() => {})
    if (!response.ok && ![409, 400].includes(response.status)) throw new Error(`PRIVATE_UPLOAD_FAILED_${response.status}`)
    objectCreated = response.ok
  }

  const verifiedMetadata = await objectMetadata(supa, storagePath)
  verifyObjectMetadata(verifiedMetadata, source, bytes)
  let mappingCreated = false
  if (!existing) {
    const response = await timedFetch(`${supa.url}/rest/v1/knowledge_papers_private`, {
      method: 'POST',
      headers: { ...supa.headers, 'content-type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ paper_id: paper.id, storage_path: storagePath, active: true }),
    })
    if (!response.ok) {
      const concurrent = await readRegistryRow(supa, paper.id)
      if (concurrent?.storage_path !== storagePath || concurrent?.active !== true) throw new Error(`REGISTRY_INSERT_FAILED_${response.status}`)
    } else mappingCreated = true
  } else if (existing.active !== true) {
    const response = await timedFetch(`${supa.url}/rest/v1/knowledge_papers_private?paper_id=eq.${encodeURIComponent(paper.id)}`, {
      method: 'PATCH',
      headers: { ...supa.headers, 'content-type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ active: true }),
    })
    if (!response.ok) throw new Error(`REGISTRY_ACTIVATE_FAILED_${response.status}`)
  }

  const publicObject = await timedFetch(`${supa.url}/storage/v1/object/public/${bucket}/${storagePath.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'HEAD',
    headers: { apikey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '' },
  })
  await publicObject.body?.cancel().catch(() => {})
  if (publicObject.ok) throw new Error('PRIVATE_OBJECT_PUBLICLY_ACCESSIBLE')
  const registered = await readRegistryRow(supa, paper.id)
  if (registered?.storage_path !== storagePath || registered.active !== true) throw new Error('REGISTRY_MAPPING_VERIFICATION_FAILED')
  return { storagePath, objectCreated, mappingCreated }
}

async function verifyApi(paper) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60_000)
  let response
  let fullResponse
  try {
    response = await fetch(`${apiBase}/api/knowledge-papers/${encodeURIComponent(paper.id)}`, { signal: controller.signal })
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (response.status !== 200 || contentType !== 'application/pdf' || Buffer.from(bytes.subarray(0, 5)).toString('ascii') !== '%PDF-') {
      throw new Error(`PREVIEW_API_FAILED_${response.status}_${contentType || 'no-content-type'}`)
    }
    const preview = await PDFDocument.load(bytes)
    if (preview.getPageCount() < 1 || preview.getPageCount() > 5) throw new Error('PREVIEW_PAGE_LIMIT_FAILED')
    fullResponse = await fetch(`${apiBase}/api/knowledge-papers/${encodeURIComponent(paper.id)}?mode=full`, { signal: AbortSignal.timeout(5_000) })
    if (fullResponse.status !== 404) throw new Error(`FULL_MODE_NOT_REJECTED_${fullResponse.status}`)
    const fullType = (fullResponse.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    if (fullType !== 'application/json') throw new Error('FULL_MODE_NOT_JSON_REJECTION')
    return { pages: preview.getPageCount(), bytes: bytes.byteLength }
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') throw new Error('PREVIEW_API_TIMEOUT')
    throw error
  } finally {
    clearTimeout(timer)
    await response?.body?.cancel().catch(() => {})
    await fullResponse?.body?.cancel().catch(() => {})
  }
}

async function preflight(supa, requireApi) {
  const projectRef = new URL(supa.url).hostname.split('.')[0]
  const publicKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!publicKey) throw new Error('ANONYMOUS_SUPABASE_KEY_MISSING')
  const requests = [
    timedFetch(`${supa.url}/storage/v1/bucket/${bucket}`, { headers: supa.headers }),
    timedFetch(`${supa.url}/rest/v1/knowledge_papers_private?select=paper_id,storage_path,active&limit=1`, { headers: supa.headers }),
    timedFetch(`${supa.url}/rest/v1/knowledge_papers_private?select=paper_id&limit=1`, { headers: { apikey: publicKey, Authorization: `Bearer ${publicKey}` } }),
  ]
  if (requireApi) requests.push(fetch(`${apiBase}/api/knowledge-papers/runtime-check?mode=preview`, { signal: AbortSignal.timeout(5_000) }))
  const [bucketResponse, registryResponse, anonResponse, apiProbe] = await Promise.all(requests)
  const bucketInfo = bucketResponse.ok ? await bucketResponse.json() : null
  let rowProbe = []
  if (registryResponse.ok) rowProbe = await registryResponse.json()
  if (!bucketInfo || bucketInfo.public !== false || bucketInfo.file_size_limit !== 52428800 || !bucketInfo.allowed_mime_types?.includes('application/pdf')) throw new Error('PRIVATE_BUCKET_CONFIGURATION_NOT_VERIFIED')
  if (!registryResponse.ok || rowProbe.some((row) => !['paper_id', 'storage_path', 'active'].every((column) => column in row))) throw new Error('REGISTRY_SCHEMA_NOT_VERIFIED')
  if (anonResponse.ok) throw new Error('ANONYMOUS_REGISTRY_READ_IS_NOT_BLOCKED')
  const apiType = apiProbe && (apiProbe.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
  if (requireApi && apiType !== 'application/json') throw new Error('LOCAL_VERCEL_API_RUNTIME_NOT_REACHABLE')
  console.log(JSON.stringify({ event: 'preflight-passed', projectRef, bucketPrivate: true, registryColumns: true, anonymousRegistryReadBlocked: true, apiRuntime: requireApi }))
}

async function main() {
  mkdirSync(tempRoot, { recursive: true })
  const apply = process.argv.includes('--apply')
  const verifyPreviews = process.argv.includes('--verify-previews')
  const report = loadPreviousReport()
  report.papers ||= {}
  const supa = await getSupabase()
  await preflight(supa, verifyPreviews)
  const available = []
  const localSources = new Map(localManifest.localVerifiedSources.map((source) => [source.catalogueId, source]))
  const jobs = []
  const unresolved = []
  for (const paper of coverage.papers) {
    const record = catalogueById.get(paper.id)
    const prior = report.papers[paper.id] || {}
    const source = findCachedSource(paper, prior, localSources)
    if (source) {
      jobs.push({ paper, source, record, prior })
      continue
    }
    unresolved.push({ paper, record, prior })
  }

  let driveIndex
  if (unresolved.length) driveIndex = await buildDriveIndex()
  for (const { paper, record, prior } of unresolved) {
    const source = findSource(paper, driveIndex, localSources)
    if (source.kind === 'missing' || source.kind === 'ambiguous') {
      const entry = report.papers[paper.id] || { title: paper.title }
      entry.source = { ...(entry.source || {}), status: source.kind, candidateCount: source.candidateCount || 0 }
      if (!entry.preview?.status || entry.preview.status !== 'verified') entry.status = source.kind
      report.papers[paper.id] = entry
      saveReport(report)
      continue
    }
    jobs.push({ paper, source, record, prior })
  }
  for (const job of jobs) {
    try {
      const verified = await bytesForSource(job.paper, job.source)
      const entry = report.papers[job.paper.id] || { title: job.paper.title }
      entry.title = job.paper.title
      entry.source = { status: 'validated', sourceName: job.source.sourceName, sizeBytes: verified.sizeBytes, pageCount: verified.pageCount, sha256: verified.sha256, path: verified.path }
      entry.sourceName = job.source.sourceName
      entry.sizeBytes = verified.sizeBytes
      entry.pageCount = verified.pageCount
      entry.sha256 = verified.sha256
      if (entry.preview?.status !== 'verified' && entry.status !== 'preview-verified') entry.status = 'source-validated'
      report.papers[job.paper.id] = entry
      available.push({ paper: { id: job.paper.id, title: job.paper.title }, source: { ...job.source, ...verified }, catalogueMatch: !!job.record && job.record.id === job.paper.id })
    } catch (error) {
      const entry = report.papers[job.paper.id] || { title: job.paper.title }
      entry.source = { ...(entry.source || {}), status: 'failed', code: error.message }
      if (entry.preview?.status !== 'verified' && entry.status !== 'preview-verified') entry.status = 'source-failed'
      report.papers[job.paper.id] = entry
      console.log(JSON.stringify({ event: 'source-failed', paperId: job.paper.id, code: error.message }))
    }
    saveReport(report)
  }

  if (!apply && !verifyPreviews) {
    report.lastSourceCheckpointAt = new Date().toISOString()
    saveReport(report)
    console.log(JSON.stringify({ event: 'source-checkpoint-complete', mode: 'no-upload', catalogueCount: coverage.papers.length, sourceReady: available.length, reportPath: manifestPath }))
    return
  }

  let uploadedThisRun = 0
  let mappedThisRun = 0
  let previewVerified = 0
  let failed = 0
  if (verifyPreviews) {
    for (const item of available) {
      try {
        const row = await readRegistryRow(supa, item.paper.id)
        if (!row || row.storage_path !== `${privatePrefix}/${item.paper.id}/original.pdf` || row.active !== true) throw new Error('PRIVATE_MAPPING_NOT_READY')
        const result = await verifyApi(item.paper)
        const entry = report.papers[item.paper.id]
        entry.preview = { status: 'verified', pages: result.pages, bytes: result.bytes, verifiedAt: new Date().toISOString() }
        entry.status = 'preview-verified'
        previewVerified += 1
        console.log(JSON.stringify({ event: 'preview-verified', paperId: item.paper.id, previewPages: result.pages }))
      } catch (error) {
        const entry = report.papers[item.paper.id]
        const lastAttempt = { status: 'failed', code: error.message, testedAt: new Date().toISOString() }
        const previouslyVerified = entry.preview?.status === 'verified' || entry.status === 'preview-verified'
        entry.preview = previouslyVerified
          ? { ...(entry.preview || { status: 'verified' }), lastAttempt }
          : { ...lastAttempt }
        failed += 1
        console.log(JSON.stringify({ event: 'preview-failed', paperId: item.paper.id, code: error.message }))
      }
      saveReport(report)
    }
  } else if (apply) {
    const uploadItems = available.filter(({ paper }) => report.papers[paper.id]?.mapping?.status !== 'verified')
    for (let start = 0; start < uploadItems.length; start += batchSize) {
      const batch = uploadItems.slice(start, start + batchSize)
      for (const item of batch) {
        const entry = report.papers[item.paper.id]
        try {
          const result = await ensureUploaded(supa, item.paper, item.source)
          if (result.objectCreated) uploadedThisRun += 1
          if (result.mappingCreated) mappedThisRun += 1
          entry.upload = { status: 'verified', storagePath: result.storagePath, sourceSha256: item.source.sha256, verifiedAt: new Date().toISOString() }
          entry.mapping = { status: 'verified', storagePath: result.storagePath, active: true, sourceSha256: item.source.sha256, verifiedAt: new Date().toISOString() }
          if (entry.preview?.status !== 'verified' && entry.status !== 'preview-verified') entry.status = 'mapped'
          console.log(JSON.stringify({ event: 'mapping-verified', paperId: item.paper.id, uploaded: result.objectCreated, mappingCreated: result.mappingCreated }))
        } catch (error) {
          entry.mapping = { ...(entry.mapping || {}), status: 'failed', code: error.message, testedAt: new Date().toISOString() }
          failed += 1
          console.log(JSON.stringify({ event: 'mapping-failed', paperId: item.paper.id, code: error.message }))
        }
        saveReport(report)
      }
      console.log(JSON.stringify({ event: 'batch-checkpoint', batch: Math.floor(start / batchSize) + 1, batchCount: batch.length, uploadedThisRun, mappedThisRun, failed }))
    }
  }

  const counts = { sourceValidated: 0, uploaded: 0, mapped: 0, previewVerified: 0, missing: 0, failed: 0 }
  for (const paper of coverage.papers) {
    const entry = report.papers[paper.id] || {}
    if (entry.source?.status === 'validated' || ['downloaded-and-pdf-validated', 'source-validated', 'mapped', 'preview-verified'].includes(entry.status)) counts.sourceValidated += 1
    if (entry.upload?.status === 'verified') counts.uploaded += 1
    if (entry.mapping?.status === 'verified') counts.mapped += 1
    if (entry.preview?.status === 'verified' || entry.status === 'preview-verified') counts.previewVerified += 1
    if (entry.source?.status === 'missing' || entry.status === 'missing') counts.missing += 1
    if (entry.source?.status === 'failed' || entry.mapping?.status === 'failed' || entry.preview?.status === 'failed') counts.failed += 1
  }
  report.lastOperationAt = new Date().toISOString()
  saveReport(report)
  console.log(JSON.stringify({ event: 'operation-complete', catalogueCount: coverage.papers.length, sourceReady: available.length, uploadedThisRun, mappedThisRun, previewVerifiedThisRun: previewVerified, failedThisRun: failed, totals: counts, reportPath: manifestPath }))
}

main().catch((error) => {
  console.error(JSON.stringify({ event: 'aborted', code: error.message }))
  process.exitCode = 1
})
