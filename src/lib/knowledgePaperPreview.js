import { KNOWLEDGE_PAPER_PREVIEW_PAGE_LIMIT } from './knowledgePaperPreviewLimits.js'

const PDF_SIGNATURE = '%PDF-'

export async function readKnowledgePaperPreview(response) {
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('A preview has not been configured for this paper yet.')
    }
    if (response.status === 503) {
      throw new Error('The preview service is not configured or available right now.')
    }
    throw new Error('The preview could not be loaded. Please try again later.')
  }

  const contentType = (response.headers.get('content-type') || '').split(';', 1)[0].trim().toLowerCase()
  if (contentType !== 'application/pdf') {
    if (contentType === 'text/html') {
      throw new Error('The preview service returned a website page instead of a PDF. The server function is unavailable in this environment.')
    }
    throw new Error('The preview service did not return a PDF. Please try again later.')
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  const signature = new TextDecoder().decode(bytes.subarray(0, PDF_SIGNATURE.length))
  if (signature !== PDF_SIGNATURE) {
    throw new Error('The preview response is not a valid PDF. Please try again later.')
  }

  const previewPages = Number(response.headers.get('X-Paper-Preview-Pages'))
  if (!Number.isInteger(previewPages) || previewPages < 1 || previewPages > KNOWLEDGE_PAPER_PREVIEW_PAGE_LIMIT) {
    throw new Error('The preview service returned an invalid page limit. Please try again later.')
  }

  return {
    blob: new Blob([bytes], { type: 'application/pdf' }),
    pageCount: Number(response.headers.get('X-Paper-Page-Count')) || previewPages,
    previewPages,
  }
}
