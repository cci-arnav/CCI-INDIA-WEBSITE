export const COUNCIL_CATEGORY_ROUTES = [
  '/councils',
  '/councils/parliamentarian',
  '/councils/international',
]

export function toCouncilSlug(name) {
  return name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export const publishedOnly = (items, now = new Date()) => items
  .filter((item) => item.status === 'published' && item.published_at && new Date(item.published_at) <= now)
  .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

export function validateNews(values) {
  const errors = {}
  if (!values.title?.trim()) errors.title = 'Title is required.'
  if (!values.description?.trim()) errors.description = 'Short description is required.'
  if (!values.category?.trim()) errors.category = 'Category is required.'
  if (!['draft', 'published'].includes(values.status)) errors.status = 'Choose draft or published.'
  if (values.status === 'published' && !values.published_at) errors.published_at = 'Publication date is required for published news.'
  return errors
}

export const canAccessAdmin = ({ configured, authenticated, admin }) => Boolean(configured && authenticated && admin)
