import { Link } from 'react-router-dom'

export default function NewsCard({ item }) {
  const body = <>
    <div className="aspect-video overflow-hidden bg-gradient-to-br from-navy-deep to-royal">
      {item.featured_image_url ? <img src={item.featured_image_url} alt="" width="800" height="450" loading="lazy" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none' }} /> : <div className="flex h-full items-end p-5 font-serif text-xl font-bold text-white">CCI India</div>}
    </div>
    <div className="flex flex-1 flex-col p-5"><div className="mb-3 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wider"><span className="text-saffron">{item.category}</span><time className="text-muted-fg" dateTime={item.published_at}>{new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(item.published_at))}</time></div><h3 className="mb-2 text-lg font-bold text-navy-deep">{item.title}</h3><p className="line-clamp-2 text-sm text-muted-fg">{item.description}</p></div>
  </>
  const classes = 'flex h-full flex-col overflow-hidden border border-border bg-white transition hover:border-royal hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-royal'
  return item.content ? <Link to={`/news/${item.slug}`} className={classes}>{body}</Link> : <article className={classes}>{body}</article>
}
