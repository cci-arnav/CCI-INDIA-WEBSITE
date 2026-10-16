import { createClient } from '@supabase/supabase-js'
import process from 'node:process'
import { Buffer } from 'node:buffer'
import { createPrivatePdfPreview, PrivatePdfRangeError } from '../../src/lib/knowledgePaperRangePreview.js'
import { isPublicPreviewMode } from '../../src/lib/knowledgePaperPdfDelivery.js'

const json = (res, status, body) => res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(body))
const boundedFetch = (timeoutMs) => (input, init = {}) => {
  const timeout = AbortSignal.timeout(timeoutMs)
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout
  return fetch(input, { ...init, signal })
}
const config = () => ({
  url: process.env.SUPABASE_URL,
  service: process.env.SUPABASE_SERVICE_ROLE_KEY,
})
const error = (res, status, code, message, extra = {}) => json(res, status, { error: message, code, ...extra })
export const isMissingStorageObject = (storageError) => String(storageError?.status ?? storageError?.statusCode ?? '') === '404'
export const isStoragePermissionError = (storageError) => ['401', '403'].includes(String(storageError?.status ?? storageError?.statusCode ?? ''))
export const isStorageTimeoutError = (storageError) => ['AbortError', 'TimeoutError'].includes(String(storageError?.name ?? ''))
export const isMissingRegistrySchema = (registryError) => ['42P01', 'PGRST205'].includes(String(registryError?.code ?? ''))
export const isRegistryPermissionError = (registryError) => String(registryError?.code ?? '') === '42501'
const serviceClient = (url, key) => createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: boundedFetch(45_000) },
})

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method !== 'GET') return res.setHeader('Allow', 'GET'), error(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.')
  const id = String(req.query.id || '')
  if (!/^[a-z0-9][a-z0-9-]{0,119}$/.test(id)) return error(res, 400, 'INVALID_PAPER_ID', 'Invalid paper identifier.')

  const mode = String(req.query.mode || 'preview')
  // The endpoint serves public previews only. No full-PDF route exists here.
  if (!isPublicPreviewMode(mode)) return error(res, 404, 'PREVIEW_ONLY', 'Only public previews are available on this endpoint.')
  const { url, service } = config()
  const missing = [!url && 'SUPABASE_URL', !service && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean)
  if (missing.length) return error(res, 503, 'SERVER_CONFIGURATION_MISSING', 'Secure paper delivery is not configured.', { missing })

  let admin
  try {
    admin = serviceClient(url, service)
  } catch {
    return error(res, 503, 'SUPABASE_CONFIGURATION_INVALID', 'Secure paper delivery is not configured correctly.')
  }

  let paperResult
  try {
    paperResult = await admin.from('knowledge_papers_private').select('paper_id, storage_path, active').eq('paper_id', id).maybeSingle()
  } catch {
    return error(res, 503, 'REGISTRY_UNAVAILABLE', 'The private paper registry is unavailable.')
  }
  if (paperResult.error) {
    if (isMissingRegistrySchema(paperResult.error)) return error(res, 503, 'REGISTRY_SCHEMA_MISSING', 'The private paper registry schema is not available.')
    if (isRegistryPermissionError(paperResult.error)) return error(res, 503, 'REGISTRY_ACCESS_DENIED', 'The server cannot read the private paper registry.')
    return error(res, 503, 'REGISTRY_UNAVAILABLE', 'The private paper registry is unavailable.')
  }
  const paper = paperResult.data
  if (!paper) return error(res, 404, 'REGISTRY_MAPPING_MISSING', 'No preview source is registered for this paper.')
  if (!paper.active) return error(res, 404, 'PAPER_INACTIVE', 'This paper is not available for online reading.')

  let preview
  try {
    preview = await createPrivatePdfPreview({
      supabaseUrl: url,
      serviceRoleKey: service,
      bucket: 'knowledge-papers-private',
      storagePath: paper.storage_path,
    })
  } catch (deliveryError) {
    const code = deliveryError instanceof PrivatePdfRangeError ? deliveryError.code : 'PRIVATE_STORAGE_UNAVAILABLE'
    if (code === 'PRIVATE_OBJECT_MISSING') return error(res, 404, code, 'The registered private PDF is missing.')
    if (code === 'PRIVATE_STORAGE_ACCESS_DENIED') return error(res, 503, code, 'The server cannot access the private paper storage object.')
    if (code === 'INVALID_PDF_SOURCE') return error(res, 422, code, 'The registered file is not a readable PDF.')
    if (code === 'PRIVATE_STORAGE_TIMEOUT' || code === 'PREVIEW_GENERATION_TIMEOUT') return error(res, 504, code, 'The preview could not be generated within the processing limit.')
    if (code === 'PREVIEW_RANGE_BUDGET_EXCEEDED') return error(res, 422, code, 'This paper requires more data than the safe preview limit allows.')
    if (code === 'PRIVATE_STORAGE_RANGE_UNSUPPORTED' || code === 'PRIVATE_STORAGE_RANGE_INVALID' || code === 'PRIVATE_STORAGE_RANGE_RESPONSE_INVALID' || code === 'PRIVATE_STORAGE_RANGE_TOO_LARGE') return error(res, 503, code, 'The private paper could not be read safely for preview.')
    return error(res, 503, 'PRIVATE_STORAGE_UNAVAILABLE', 'The private paper storage service is unavailable.')
  }
  const { bytes, pageCount, deliveredPages } = preview
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'inline; filename="knowledge-paper-preview.pdf"')
  res.setHeader('X-Paper-Page-Count', String(pageCount))
  res.setHeader('X-Paper-Preview-Pages', String(deliveredPages))
  return res.status(200).send(Buffer.from(bytes))
}
