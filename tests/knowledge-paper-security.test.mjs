import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { isMissingRegistrySchema, isMissingStorageObject, isRegistryPermissionError, isStoragePermissionError, isStorageTimeoutError } from '../api/knowledge-papers/[id].js'
import { createPdfDelivery, isPublicPreviewMode, PUBLIC_PREVIEW_PAGE_LIMIT } from '../src/lib/knowledgePaperPdfDelivery.js'
import { getKnowledgePaperRequestUrl } from '../src/lib/knowledgePapers.js'
import { createLocalPdfPreview, createPrivatePdfPreview, getPreviewFailureDiagnostic, PREVIEW_PAGE_LIMIT, PREVIEW_TRANSFER_BUDGET_BYTES, RANGE_CHUNK_BYTES } from '../src/lib/knowledgePaperRangePreview.js'

const repoFile = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8')

const makePdf = async (pages) => {
  const pdf = await PDFDocument.create()
  for (let index = 0; index < pages; index += 1) pdf.addPage([612, 792])
  return pdf.save()
}

const rangeFetcher = (source, rangeCalls = []) => async (_url, init) => {
  if (init.method === 'HEAD') {
    return new Response(null, { status: 200, headers: { 'Accept-Ranges': 'bytes', 'Content-Length': String(source.length) } })
  }
  const [begin, end] = init.headers.Range.match(/bytes=(\d+)-(\d+)/).slice(1).map(Number)
  rangeCalls.push([begin, end])
  const chunk = source.slice(begin, end + 1)
  return new Response(chunk, {
    status: 206,
    headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(chunk.length),
      'Content-Range': `bytes ${begin}-${end}/${source.length}`,
      'Content-Type': 'application/pdf',
    },
  })
}

test('public previews never exceed ten pages, even if a larger limit is supplied', async () => {
  assert.equal(PUBLIC_PREVIEW_PAGE_LIMIT, 10)
  assert.equal(PREVIEW_PAGE_LIMIT, 10)
  assert.equal(PREVIEW_TRANSFER_BUDGET_BYTES, 24 * 1024 * 1024)
  const result = await createPdfDelivery(await makePdf(15), 100)
  const delivered = await PDFDocument.load(result.bytes)
  assert.equal(result.pageCount, 15)
  assert.equal(result.deliveredPages, 10)
  assert.equal(delivered.getPageCount(), 10)
})

test('short papers are delivered in full within the preview limit', async () => {
  const result = await createPdfDelivery(await makePdf(3), 10)
  const delivered = await PDFDocument.load(result.bytes)
  assert.equal(result.pageCount, 3)
  assert.equal(result.deliveredPages, 3)
  assert.equal(delivered.getPageCount(), 3)
})

test('pre-generated local previews preserve the source page count and never exceed ten pages', async () => {
  const short = await createLocalPdfPreview(await makePdf(3))
  const shortPdf = await PDFDocument.load(short.bytes)
  assert.equal(short.pageCount, 3)
  assert.equal(short.deliveredPages, 3)
  assert.equal(shortPdf.getPageCount(), 3)

  const long = await createLocalPdfPreview(await makePdf(15))
  const longPdf = await PDFDocument.load(long.bytes)
  assert.equal(long.pageCount, 15)
  assert.equal(long.deliveredPages, 10)
  assert.equal(longPdf.getPageCount(), 10)
})

test('local preview generation rejects invalid PDF signatures', async () => {
  await assert.rejects(
    createLocalPdfPreview(new Uint8Array([1, 2, 3, 4])),
    (error) => error.code === 'INVALID_PDF_SOURCE' && error.stage === 'pdf_signature',
  )
})

test('invalid source documents fail preview generation instead of falling back to source bytes', async () => {
  await assert.rejects(createPdfDelivery(new Uint8Array([1, 2, 3, 4])))
})

test('public endpoint accepts preview mode only and does not expose full-document mode', () => {
  assert.equal(isPublicPreviewMode(undefined), true)
  assert.equal(isPublicPreviewMode('preview'), true)
  assert.equal(isPublicPreviewMode('full'), false)
  assert.equal(isPublicPreviewMode('access'), false)
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /if \(!isPublicPreviewMode\(mode\)\)/)
  assert.match(endpoint, /createPrivatePdfPreview\(/)
  assert.match(endpoint, /admin\.storage\.from\(previewBucket\)\.download\(paper\.preview_storage_path\)/)
  assert.doesNotMatch(endpoint, /storage\.from\(['"]knowledge-papers-private['"]\)\.download\(/)
  assert.doesNotMatch(endpoint, /knowledge_paper_access/)
  assert.doesNotMatch(endpoint, /mode === ['"]full['"]/)
})

test('a missing or inactive private registry mapping fails safely without returning a source PDF', () => {
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /if \(!paper\) return error\(res, 404, 'REGISTRY_MAPPING_MISSING'/)
  assert.match(endpoint, /if \(!paper\.active\) return error\(res, 404, 'PAPER_INACTIVE'/)
  assert.match(endpoint, /bucket: 'knowledge-papers-private'/)
  assert.match(endpoint, /storagePath: paper\.storage_path/)
  assert.doesNotMatch(endpoint, /\.createSignedUrl\(|\.getPublicUrl\(/)
})

test('private range transport emits a ten-page PDF and limits each origin read to a byte range', async () => {
  const source = await makePdf(15)
  const padded = source
  const rangeCalls = []
  const result = await createPrivatePdfPreview({
    supabaseUrl: 'https://example.supabase.co',
    serviceRoleKey: 'server-only-test-key',
    bucket: 'knowledge-papers-private',
    storagePath: 'papers/test/original.pdf',
    fetchImpl: rangeFetcher(padded, rangeCalls),
  })
  const delivered = await PDFDocument.load(result.bytes)
  assert.equal(result.pageCount, 15)
  assert.equal(result.deliveredPages, 10)
  assert.equal(delivered.getPageCount(), 10)
  assert.ok(rangeCalls.length > 0)
  assert.ok(result.transferredBytes <= padded.length)
  assert.ok(rangeCalls.every(([begin, end]) => end - begin + 1 <= RANGE_CHUNK_BYTES))
  assert.equal(result.rangeRequestCount, rangeCalls.length)
  assert.equal(new Set(rangeCalls.map(([begin, end]) => `${begin}-${end}`)).size, rangeCalls.length, 'overlapping requests should reuse cached private ranges')
})

test('PDF.js Node worker is a statically loaded dependency for serverless packaging', () => {
  assert.equal(typeof globalThis.pdfjsWorker?.WorkerMessageHandler, 'function')
  assert.match(repoFile('../src/lib/knowledgePaperRangePreview.js'), /import ['"]pdfjs-dist\/legacy\/build\/pdf\.worker\.mjs['"]\s*;?/)
})

test('private range preview distinguishes a byte-zero signature failure', async () => {
  const source = new TextEncoder().encode('NOT-A-PDF document bytes')
  await assert.rejects(
    createPrivatePdfPreview({
      supabaseUrl: 'https://example.supabase.co',
      serviceRoleKey: 'server-only-test-key',
      bucket: 'knowledge-papers-private',
      storagePath: 'papers/test/original.pdf',
      fetchImpl: rangeFetcher(source),
    }),
    (error) => error.code === 'INVALID_PDF_SOURCE' && error.stage === 'pdf_signature' && error.status === 206,
  )
})

test('private range preview distinguishes PDF.js parsing failure after a valid signature', async () => {
  const source = new TextEncoder().encode('%PDF-1.7\nThis is not a structurally valid PDF document.')
  await assert.rejects(
    createPrivatePdfPreview({
      supabaseUrl: 'https://example.supabase.co',
      serviceRoleKey: 'server-only-test-key',
      bucket: 'knowledge-papers-private',
      storagePath: 'papers/test/original.pdf',
      fetchImpl: rangeFetcher(source),
    }),
    (error) => error.code === 'INVALID_PDF_SOURCE' && error.stage === 'pdfjs_parse',
  )
})

test('private ranged preview includes all pages for papers shorter than ten pages', async () => {
  const source = await makePdf(3)
  const result = await createPrivatePdfPreview({
    supabaseUrl: 'https://example.supabase.co',
    serviceRoleKey: 'server-only-test-key',
    bucket: 'knowledge-papers-private',
    storagePath: 'papers/short/original.pdf',
    fetchImpl: rangeFetcher(source),
  })
  const delivered = await PDFDocument.load(result.bytes)
  assert.equal(result.pageCount, 3)
  assert.equal(result.deliveredPages, 3)
  assert.equal(delivered.getPageCount(), 3)
})

test('private ranged preview rejects a server that ignores the Range header', async () => {
  const source = await makePdf(7)
  const fetchImpl = async (_url, init) => init.method === 'HEAD'
    ? new Response(null, { status: 200, headers: { 'Accept-Ranges': 'bytes', 'Content-Length': String(source.length) } })
    : new Response(source, { status: 200, headers: { 'Content-Type': 'application/pdf', 'Content-Length': String(source.length) } })
  await assert.rejects(
    createPrivatePdfPreview({
      supabaseUrl: 'https://example.supabase.co',
      serviceRoleKey: 'server-only-test-key',
      bucket: 'knowledge-papers-private',
      storagePath: 'papers/test/original.pdf',
      fetchImpl,
    }),
    (error) => error.code === 'PRIVATE_STORAGE_RANGE_RESPONSE_INVALID',
  )
})

test('private API diagnostics distinguish missing server configuration and registry/storage/PDF failures without leaking details', () => {
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /url: process\.env\.SUPABASE_URL/)
  assert.match(endpoint, /service: process\.env\.SUPABASE_SERVICE_ROLE_KEY/)
  assert.doesNotMatch(endpoint, /process\.env\.VITE_SUPABASE/)
  for (const code of [
    'SERVER_CONFIGURATION_MISSING',
    'SUPABASE_CONFIGURATION_INVALID',
    'REGISTRY_UNAVAILABLE',
    'REGISTRY_SCHEMA_MISSING',
    'REGISTRY_ACCESS_DENIED',
    'REGISTRY_MAPPING_MISSING',
    'PREVIEW_REGISTRY_UNAVAILABLE',
    'PREVIEW_REGISTRY_SCHEMA_MISSING',
    'PREVIEW_REGISTRY_ACCESS_DENIED',
    'PREVIEW_METADATA_INVALID',
    'PREVIEW_OBJECT_INVALID',
    'PREGENERATED_PREVIEW_MISSING',
    'PREVIEW_STORAGE_ACCESS_DENIED',
    'PREVIEW_STORAGE_UNAVAILABLE',
    'PRIVATE_STORAGE_UNAVAILABLE',
    'PRIVATE_STORAGE_TIMEOUT',
    'PRIVATE_STORAGE_ACCESS_DENIED',
    'PRIVATE_STORAGE_RANGE_TOO_LARGE',
    'PRIVATE_STORAGE_RANGE_RESPONSE_INVALID',
    'PRIVATE_OBJECT_MISSING',
    'INVALID_PDF_SOURCE',
  ]) assert.ok(endpoint.includes(`'${code}'`), `expected safe diagnostic ${code}`)
  assert.doesNotMatch(endpoint, /paperError\.message|fileError\.message/)
  assert.match(endpoint, /getPreviewFailureDiagnostic\(deliveryError/)
  assert.match(endpoint, /console\.error\(JSON\.stringify\(/)
  assert.equal(isMissingStorageObject({ statusCode: '404', message: 'private internal detail' }), true)
  assert.equal(isMissingStorageObject({ status: 503, message: 'private internal detail' }), false)
  assert.equal(isStoragePermissionError({ statusCode: '403' }), true)
  assert.equal(isStoragePermissionError({ status: 503 }), false)
  assert.equal(isStorageTimeoutError({ name: 'TimeoutError' }), true)
  assert.equal(isStorageTimeoutError({ name: 'AbortError' }), true)
  assert.equal(isStorageTimeoutError({ name: 'StorageError' }), false)
  assert.equal(isMissingRegistrySchema({ code: '42P01' }), true)
  assert.equal(isMissingRegistrySchema({ code: 'PGRST205' }), true)
  assert.equal(isMissingRegistrySchema({ code: '42501' }), false)
  assert.equal(isRegistryPermissionError({ code: '42501' }), true)
  assert.equal(isRegistryPermissionError({ code: '42P01' }), false)
})

test('private Storage diagnostics identify a failed operation without logging secrets or error messages', async () => {
  const failure = Object.assign(new TypeError('request failed at https://private.example/object using do-not-log-key'), { code: 'ECONNRESET' })
  await assert.rejects(
    createPrivatePdfPreview({
      supabaseUrl: 'https://example.supabase.co',
      serviceRoleKey: 'do-not-log-key',
      bucket: 'knowledge-papers-private',
      storagePath: 'papers/private/original.pdf',
      fetchImpl: async () => { throw failure },
    }),
    (error) => {
      const diagnostic = getPreviewFailureDiagnostic(error, {
        supabaseUrl: 'https://example.supabase.co',
        serviceRoleKey: 'do-not-log-key',
      })
      assert.equal(error.code, 'PRIVATE_STORAGE_UNAVAILABLE')
      assert.deepEqual(diagnostic, {
        stage: 'storage_head_request',
        errorClass: 'TypeError',
        errorCode: 'ECONNRESET',
        status: null,
        hasSupabaseUrl: true,
        hasServiceRoleKey: true,
      })
      assert.doesNotMatch(JSON.stringify(diagnostic), /do-not-log-key|private\.example|original\.pdf|request failed/)
      return true
    },
  )
  const unsafeFailure = Object.assign(new Error('secret detail'), {
    stage: 'https://private.example/path',
    name: 'Error\nsecret',
    code: 'secret-key-value',
    status: 900,
  })
  assert.deepEqual(getPreviewFailureDiagnostic(unsafeFailure), {
    stage: 'preview_pipeline',
    errorClass: 'Error',
    errorCode: null,
    status: null,
    hasSupabaseUrl: false,
    hasServiceRoleKey: false,
  })
})

test('local server environment uses server-only variable names in an ignored file', () => {
  const localEnvPath = fileURLToPath(new URL('../.env.local', import.meta.url))
  const contents = readFileSync(localEnvPath, 'utf8')
  const entries = Object.fromEntries(contents.split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    return match ? [[match[1], match[2].trim()]] : []
  }))
  assert.ok(Object.hasOwn(entries, 'SUPABASE_URL'))
  assert.ok(Object.hasOwn(entries, 'SUPABASE_SERVICE_ROLE_KEY'))
  assert.ok(entries.SUPABASE_URL === '' || /^https:\/\//.test(entries.SUPABASE_URL))
  assert.ok(entries.SUPABASE_SERVICE_ROLE_KEY === '' || entries.SUPABASE_SERVICE_ROLE_KEY.length > 20)
  assert.doesNotMatch(contents, /^VITE_SUPABASE_SERVICE_ROLE_KEY=/m)
  assert.match(repoFile('../.gitignore'), /^\.env\.\*$/m)
})

test('ambiguous source matching cannot automatically create registry records', () => {
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /\.maybeSingle\(\)/)
  assert.doesNotMatch(endpoint, /\.insert\(|\.upsert\(/)
})

test('reader loads registered static PDFs only and keeps the request workflow', () => {
  const reader = repoFile('../src/pages/KnowledgePaperReader.jsx')
  assert.match(reader, /import previewRegistry from '\.\.\/data\/knowledgePaperPreviewRegistry\.json'/)
  assert.match(reader, /const preview = paper \? previewRegistry\[paper\.id\] : null/)
  assert.match(reader, /fetch\(preview\.url, \{ signal: abortController\.signal \}\)/)
  assert.match(reader, /import\('pdfjs-dist'\)/)
  assert.match(reader, /import\('pdfjs-dist\/build\/pdf\.worker\.min\.mjs\?url'\)/)
  assert.match(reader, /getDocument\(\{ data: bytes \}\)/)
  assert.match(reader, /abortController\.abort\(\)/)
  assert.match(reader, /renderTaskRef\.current\?\.cancel\(\)/)
  assert.match(reader, /loadingTask\.destroy\(\)\.catch/)
  assert.doesNotMatch(reader, /loadedDocument\.destroy\(/)
  assert.match(reader, /loadedDocument\.numPages > PUBLIC_PREVIEW_PAGES/)
  assert.match(reader, /const previewPageCount = Math\.min\(pageCount \|\| PUBLIC_PREVIEW_PAGES, PUBLIC_PREVIEW_PAGES\)/)
  assert.match(reader, /Page \{wantedPage\} of \{previewPageCount\}/)
  assert.match(reader, /page\.render\(\{/)
  assert.match(reader, /<canvas ref=\{canvasRef\}/)
  assert.match(reader, /A static preview is not available for this paper yet/)
  assert.match(reader, /Preview not available yet/)
  assert.match(reader, /Request Full Knowledge Paper/)
  assert.doesNotMatch(reader, /\/api\/knowledge-papers|readKnowledgePaperPreview|SUPABASE|PRESENTATION_MODE/)
  assert.doesNotMatch(reader, /<iframe/)
})

test('SPA fallback explicitly excludes API routes', () => {
  const config = JSON.parse(repoFile('../vercel.json'))
  assert.equal(config.rewrites[0].source, '/:path((?!api/).*)')
  assert.equal(config.functions['api/knowledge-papers/*.js'].maxDuration, 60)
})

test('Knowledge Papers API directory contains only the intended public function entry point', () => {
  const routes = readdirSync(fileURLToPath(new URL('../api/knowledge-papers/', import.meta.url))).sort()
  assert.deepEqual(routes, ['[id].js'])
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /from '\.\.\/\.\.\/src\/lib\/knowledgePaperPdfDelivery\.js'/)
})

test('request button pre-fills titles for mapped and unmapped catalogue papers', () => {
  const catalogue = JSON.parse(repoFile('../content/knowledge-papers.json'))
  const papers = [
    catalogue.find((paper) => paper.id === 'india-spain-shared-growth-2026'),
    catalogue.find((paper) => paper.id === 'india-tea-industry-growth-2026'),
  ]
  assert.ok(papers.every(Boolean))
  for (const paper of papers) {
    const url = new URL(getKnowledgePaperRequestUrl(paper))
    assert.equal(url.hostname, 'docs.google.com')
    assert.equal(url.searchParams.get('entry.79280790'), paper.title)
  }
  const url = new URL(getKnowledgePaperRequestUrl(papers[0]))
  assert.equal(url.searchParams.get('entry.79280790'), 'India & Spain: Strengthening Partnership, Shaping Shared Growth')
  const reader = repoFile('../src/pages/KnowledgePaperReader.jsx')
  assert.match(reader, /Request Full Knowledge Paper/)
  assert.match(reader, /href=\{requestUrl\}/)
  assert.match(reader, /getKnowledgePaperRequestUrl\(paper\)/)
  assert.equal(url.searchParams.get('entry.26019014'), 'International & Sectoral')
})

test('public catalogue explains the no-login Google Form request flow', () => {
  const cataloguePage = repoFile('../src/pages/KnowledgePapers.jsx')
  const reader = repoFile('../src/pages/KnowledgePaperReader.jsx')
  assert.match(cataloguePage, /without signing in/)
  assert.match(cataloguePage, /enquiry form/)
  assert.doesNotMatch(cataloguePage, /signed-in readers|log in|sign in to request/i)
  assert.match(reader, /Request Full Knowledge Paper/)
  assert.match(reader, /href=\{requestUrl\}/)
})

test('catalogue source mappings remain absent until verified private registry records exist', () => {
  const catalogue = JSON.parse(repoFile('../content/knowledge-papers.json'))
  assert.equal(catalogue.length, 128)
  assert.equal(new Set(catalogue.map((paper) => paper.id)).size, 128)
  assert.ok(catalogue.some((paper) => paper.id === 'india-mozambique-shaping-futures-2026'))
  assert.ok(catalogue.some((paper) => paper.id === 'india-fiji-shaping-futures-2026'))
  assert.ok(catalogue.every((paper) => !paper.storagePath && !paper.pdfUrl))
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.match(endpoint, /if \(!paper\) return error\(res, 404, 'REGISTRY_MAPPING_MISSING'/)
})

test('every published paper card opens the shared paper-ID reader route', () => {
  const catalogue = JSON.parse(repoFile('../content/knowledge-papers.json'))
  const card = repoFile('../src/components/knowledge/KnowledgePaperCard.jsx')
  const app = repoFile('../src/App.jsx')
  assert.equal(catalogue.length, 128)
  assert.match(card, /to=\{`\/knowledge-papers\/\$\{encodeURIComponent\(paper\.id\)\}`\}/)
  assert.match(app, /path="\/knowledge-papers\/:paperId"/)
})

test('source audit manifest is inventory-only and excludes ambiguous sources from verified imports', () => {
  const manifest = JSON.parse(repoFile('../scripts/knowledge-paper-source-manifest.json'))
  const catalogue = JSON.parse(repoFile('../content/knowledge-papers.json'))
  const catalogueIds = new Set(catalogue.map((paper) => paper.id))
  assert.equal(manifest.uploadApproved, false)
  assert.equal(manifest.localVerifiedSources.length, 7)
  assert.ok(manifest.localVerifiedSources.every((source) => catalogueIds.has(source.catalogueId) && source.status === 'verified-local-not-uploaded'))
  assert.ok(manifest.reviewDriveCandidates.some((source) => source.matchConfidence === 'ambiguous' && source.status === 'human-review-required'))
  assert.ok(manifest.unmatchedDriveCountries.length > 0)
})

test('coverage inventory includes every catalogue ID without inventing private paths', () => {
  const coverage = JSON.parse(repoFile('../content/knowledge-paper-coverage.json'))
  const catalogue = JSON.parse(repoFile('../content/knowledge-papers.json'))
  const endpoint = repoFile('../api/knowledge-papers/[id].js')
  assert.equal(coverage.catalogueCount, 128)
  assert.equal(coverage.papers.length, catalogue.length)
  assert.deepEqual(coverage.papers.map((paper) => paper.id), catalogue.map((paper) => paper.id))
  assert.ok(coverage.papers.every((paper) => paper.privateStoragePath === null && paper.actualApiPreviewVerified === false))
  assert.equal(coverage.statusCounts['source-pdf-ready-private-storage-upload-mapping-pending'], 125)
  assert.equal(coverage.statusCounts['source-pdf-found-match-needs-review'], 3)
  assert.equal(coverage.statusCounts['source-pdf-not-found-in-accessible-sources'], undefined)
  assert.doesNotMatch(endpoint, /india-(?:cyprus|laos|sudan|tajikistan|indonesia|tunisia|spain)-/i)
  assert.match(endpoint, /req\.query\.id/)
})

test('existing news-admin routes and authentication checks remain present', () => {
  const app = repoFile('../src/App.jsx')
  const login = repoFile('../src/pages/admin/AdminLogin.jsx')
  const guard = repoFile('../src/components/admin/AdminGuard.jsx')
  assert.match(app, /path="\/admin\/login"/)
  assert.match(app, /path="\/admin\/news"/)
  assert.match(app, /path="\/admin\/news\/new"/)
  assert.match(login, /signInWithPassword/)
  assert.match(login, /isCurrentUserAdmin/)
  assert.match(guard, /isCurrentUserAdmin/)
})
