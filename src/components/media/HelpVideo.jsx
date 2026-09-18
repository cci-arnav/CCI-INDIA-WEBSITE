import { useState } from 'react'
import { Play } from 'lucide-react'
import video from '../../../content/video.json'

const youtubeId = (url) => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/)?.[1]

export default function HelpVideo() {
  const [activated, setActivated] = useState(false)
  const id = video.provider === 'youtube' && video.url ? youtubeId(video.url) : null
  return <section className="section-padding border-b border-border bg-white"><div className="container-main"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-saffron">Video</p><h2 className="mb-3 font-serif text-2xl font-bold text-navy-deep md:text-3xl">{video.heading}</h2><p className="mb-7 max-w-2xl text-muted-fg">{video.title}</p><div className="overflow-hidden border border-border bg-navy-deep shadow-lg"><div className="relative aspect-video">
    {id && activated ? <iframe title={video.title} src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : video.provider === 'local' && video.url ? <video className="h-full w-full object-cover" controls preload="metadata" poster={video.poster || undefined}><source src={video.url} /></video> : <button type="button" className="group flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,.12),transparent_60%),linear-gradient(135deg,#15294a,#315fc0)] text-white" onClick={() => id && setActivated(true)} aria-label={id ? `Play ${video.title}` : 'Video coming soon'} disabled={!id}><span className="absolute inset-0 opacity-30 [background-image:linear-gradient(30deg,transparent_40%,rgba(255,255,255,.12)_40%,rgba(255,255,255,.12)_42%,transparent_42%)]" aria-hidden="true" /><span className="relative flex flex-col items-center gap-4 px-6 text-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-saffron text-white shadow-xl transition-transform group-enabled:group-hover:scale-105"><Play fill="currentColor" aria-hidden="true" /></span><span className="max-w-xl font-serif text-xl font-bold md:text-2xl">{video.caption}</span></span></button>}
  </div></div></div></section>
}
