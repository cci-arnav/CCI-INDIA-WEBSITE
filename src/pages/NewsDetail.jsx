import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { fetchNewsBySlug } from '../lib/news'
import Breadcrumbs from '../components/ui/Breadcrumbs'

export default function NewsDetail() {
  const { slug } = useParams(); const [item, setItem] = useState(); const [error, setError] = useState('')
  useEffect(() => { fetchNewsBySlug(slug).then(setItem).catch(() => setError('This news item could not be loaded.')) }, [slug])
  if (item === null) return <Navigate to="/events" replace />
  if (!item) return <div className="container-main section-padding">{error || 'Loading news…'}</div>
  return <><section className="border-b border-border bg-off-white"><div className="container-main py-10"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'News & Events', href: '/events' }, { label: item.title }]} /><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{item.category}</p><h1 className="max-w-4xl text-3xl font-bold md:text-4xl">{item.title}</h1><time className="mt-3 block text-sm text-muted-fg">{new Date(item.published_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}</time></div></section><article className="container-main section-padding max-w-4xl">{item.featured_image_url && <img src={item.featured_image_url} alt="" className="mb-8 aspect-video w-full object-cover" />}<p className="mb-6 text-lg font-semibold text-navy-deep">{item.description}</p><div className="whitespace-pre-line text-muted-fg">{item.content}</div><Link to="/events" className="mt-8 inline-block font-semibold text-royal">← Back to news and events</Link></article></>
}
