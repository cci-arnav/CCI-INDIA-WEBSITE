import home from '../../content/home.json'
import { isSupabaseConfigured, supabase } from './supabase'
import { publishedOnly, validateNews } from './contentRules'

export const NEWS_PAGE_SIZE = 9

export const staticNewsSeed = home.news.items.map((item, index) => ({
  id: `seed-${index + 1}`,
  slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  title: item.title,
  description: item.title,
  content: null,
  category: item.type,
  status: 'published',
  published_at: new Date(Date.UTC(2024, 7, 25 - index)).toISOString(),
  featured_image_url: null,
  isSeed: true,
}))

export { publishedOnly, validateNews }

export async function fetchPublishedNews({ page = 0, limit = NEWS_PAGE_SIZE } = {}) {
  if (!isSupabaseConfigured) return { items: staticNewsSeed.slice(page * limit, (page + 1) * limit), hasMore: (page + 1) * limit < staticNewsSeed.length, fallback: true }
  const from = page * limit
  const { data, error } = await supabase.from('news').select('*').eq('status', 'published').lte('published_at', new Date().toISOString()).order('published_at', { ascending: false }).range(from, from + limit)
  if (error) throw error
  return { items: data.slice(0, limit), hasMore: data.length > limit, fallback: false }
}

export async function fetchNewsBySlug(slug) {
  if (!isSupabaseConfigured) return staticNewsSeed.find((item) => item.slug === slug) || null
  const { data, error } = await supabase.from('news').select('*').eq('slug', slug).eq('status', 'published').lte('published_at', new Date().toISOString()).maybeSingle()
  if (error) throw error
  return data
}

export const slugifyNewsTitle = (title) => title.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export async function isCurrentUserAdmin() {
  if (!supabase) return false
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return false
  const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', auth.user.id).maybeSingle()
  return !error && Boolean(data)
}
