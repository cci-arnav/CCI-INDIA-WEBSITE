import { useEffect, useState } from 'react'
import { fetchPublishedNews } from '../../lib/news'
import NewsCard from './NewsCard'

export default function NewsFeed({ limit = 3, showLoadMore = false, variant = 'default' }) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    let active = true
    fetchPublishedNews({ page, limit }).then((result) => {
      if (!active) return
      setItems((current) => page ? [...current, ...result.items] : result.items)
      setHasMore(result.hasMore)
      setError('')
    }).catch(() => active && setError('News could not be loaded right now. Please try again later.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [limit, page])

  if (loading && !items.length) return <div className={`news-feed ${variant === 'editorial' ? 'news-feed--editorial' : ''}`} aria-label="Loading news">{Array.from({ length: 3 }, (_, index) => <div key={index} className={`news-skeleton animate-pulse border border-border bg-white ${variant === 'editorial' && index === 0 ? 'news-skeleton--lead' : ''}`}><div className="news-skeleton__image bg-muted" /><div className="space-y-3 p-5"><div className="h-4 w-1/3 bg-muted" /><div className="h-5 bg-muted" /><div className="h-4 w-4/5 bg-muted" /></div></div>)}</div>
  if (error) return <div role="alert" className="border border-red-200 bg-red-50 p-5 text-sm text-red-800">{error}</div>
  if (!items.length) return variant === 'editorial'
    ? <div className="news-empty" role="status"><p>New updates from CCI India will appear here.</p></div>
    : <div className="border border-dashed border-border bg-white p-10 text-center text-muted-fg">No published news is available yet.</div>
  return <><div className={`news-feed ${variant === 'editorial' ? 'news-feed--editorial' : ''}`} data-count={items.length}>{items.map((item, index) => <NewsCard key={item.id} item={item} variant={variant} lead={variant === 'editorial' && index === 0} />)}</div>{showLoadMore && hasMore && <div className="mt-8 text-center"><button type="button" disabled={loading} onClick={() => { setLoading(true); setPage((value) => value + 1) }} className="min-h-11 border border-navy-deep px-6 text-sm font-semibold text-navy-deep hover:bg-off-white disabled:opacity-50">{loading ? 'Loading…' : 'Load more'}</button></div>}</>
}
