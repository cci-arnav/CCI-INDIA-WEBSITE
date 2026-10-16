import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NewsCard({ item, variant = 'default', lead = false }) {
  const isEditorial = variant === 'editorial'
  const cardClass = `news-card ${isEditorial ? 'news-card--editorial' : ''} ${lead ? 'news-card--lead' : ''}`
  const image = (
      <div className="news-card__media" data-image-error="false">
      <div className="news-card__fallback" aria-hidden="true"><span>CCI India</span><span>News &amp; Events</span></div>
      {item.featured_image_url && <img src={item.featured_image_url} alt="" width="1200" height="675" loading="lazy" onError={(event) => { event.currentTarget.closest('.news-card__media').dataset.imageError = 'true' }} />}
    </div>
  )
  const content = (
    <>
      {image}
      <div className="news-card__body">
        <div className="news-card__meta"><span>{item.category}</span><time dateTime={item.published_at}>{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(item.published_at))}</time></div>
        <h3 className="news-card__title">{item.title}</h3>
        <p className="news-card__description">{item.description}</p>
        {item.content && <span className="news-card__action">Read story <ArrowUpRight size={16} aria-hidden="true" /></span>}
      </div>
    </>
  )
  return item.content
    ? <Link to={`/news/${item.slug}`} className={cardClass}>{content}</Link>
    : <article className={cardClass}>{content}</article>
}
