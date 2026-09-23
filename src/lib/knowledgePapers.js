const text = (value) => typeof value === 'string' ? value.trim() : ''

export const normalizeSearchQuery = (value) => text(value).replace(/\s+/g, ' ').toLocaleLowerCase()

export const isSafePdfUrl = (value) => {
  const url = text(value)
  if (!url) return false

  try {
    const parsed = new URL(url, 'https://cciindia.org')
    return ['http:', 'https:'].includes(parsed.protocol) && parsed.pathname.toLocaleLowerCase().endsWith('.pdf')
  } catch {
    return false
  }
}

export const validDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const sortDate = (item) => {
  const timestamp = validDate(item.publishedAt)?.getTime()
  if (timestamp) return timestamp
  const year = Number(item.year)
  return Number.isInteger(year) && year > 0 ? Date.UTC(year, 0, 1) : 0
}

export const getPublishedKnowledgePapers = (items = []) => {
  if (!Array.isArray(items)) return []

  return items
    .filter((item) => item && item.published === true && text(item.id) && text(item.title) && text(item.country))
    .map((item) => ({
      ...item,
      id: text(item.id),
      title: text(item.title),
      country: text(item.country),
      countryCode: text(item.countryCode).toUpperCase(),
      region: text(item.region),
      description: text(item.description),
      publishedAt: text(item.publishedAt),
      pdfUrl: isSafePdfUrl(item.pdfUrl) ? text(item.pdfUrl) : '',
      coverImage: text(item.coverImage),
      fileSize: text(item.fileSize),
      tags: Array.isArray(item.tags) ? item.tags.map(text).filter(Boolean) : [],
      featured: item.featured === true,
    }))
    .sort((a, b) => sortDate(b) - sortDate(a))
}

export const filterKnowledgePapers = (items, { query = '', country = '', region = '' } = {}) => {
  const search = normalizeSearchQuery(query)
  return items.filter((item) => {
    if (country && item.country !== country) return false
    if (region && item.region !== region) return false
    if (!search) return true

    const year = validDate(item.publishedAt)?.getFullYear() || item.year || ''
    return normalizeSearchQuery([
      item.title,
      item.country,
      item.description,
      item.region,
      year,
      ...(item.tags || []),
    ].join(' ')).includes(search)
  })
}
