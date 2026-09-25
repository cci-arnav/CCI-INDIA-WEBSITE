import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import video from '../../../content/video.json'

const youtubeId = (url = '') => url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{6,})/)?.[1]

function VideoPlayer({ item }) {
  const [activated, setActivated] = useState(false)
  const id = item.provider === 'youtube' ? youtubeId(item.url) : null

  if (id && activated) {
    return <iframe title={item.title} src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
  }

  if (item.provider === 'local' && item.url) {
    return <video className="h-full w-full bg-black object-contain" controls playsInline preload="metadata" poster={item.poster || undefined} aria-label={item.title}><source src={item.url} type="video/mp4" />Your browser does not support HTML video.</video>
  }

  return (
    <button type="button" className="group flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,.12),transparent_60%),linear-gradient(135deg,#15294a,#315fc0)] text-white" onClick={() => id && setActivated(true)} aria-label={id ? `Play ${item.title}` : 'Video coming soon'} disabled={!id}>
      <span className="absolute inset-0 opacity-30 [background-image:linear-gradient(30deg,transparent_40%,rgba(255,255,255,.12)_40%,rgba(255,255,255,.12)_42%,transparent_42%)]" aria-hidden="true" />
      <span className="relative flex flex-col items-center gap-4 px-6 text-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-saffron text-white shadow-xl transition-transform group-enabled:group-hover:scale-105"><Play fill="currentColor" aria-hidden="true" /></span><span className="max-w-xl font-serif text-xl font-bold md:text-2xl">{item.caption}</span></span>
    </button>
  )
}

export default function HelpVideo() {
  const [activeIndex, setActiveIndex] = useState(0)
  const items = video.items || []
  const active = items[activeIndex]
  const move = (direction) => setActiveIndex((index) => (index + direction + items.length) % items.length)

  if (!active) return null

  return (
    <section className="section-padding border-b border-border bg-white">
      <div className="container-main">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-saffron">Video</p>
        <h2 className="mb-3 font-serif text-2xl font-bold text-navy-deep md:text-3xl">{video.heading}</h2>
        <p className="mb-7 max-w-2xl text-muted-fg">{video.title}</p>

        <div className="overflow-hidden border border-border bg-navy-deep shadow-lg">
          <div className="relative aspect-video" aria-live="polite">
            <VideoPlayer key={active.id} item={active} />
            <button type="button" onClick={() => move(-1)} className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-navy-deep/70 text-white shadow-lg backdrop-blur-sm transition hover:bg-navy-deep focus-visible:outline-saffron" aria-label="Previous video"><ChevronLeft aria-hidden="true" /></button>
            <button type="button" onClick={() => move(1)} className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-navy-deep/70 text-white shadow-lg backdrop-blur-sm transition hover:bg-navy-deep focus-visible:outline-saffron" aria-label="Next video"><ChevronRight aria-hidden="true" /></button>
          </div>
          <div className="flex flex-col gap-4 border-t border-white/15 px-4 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-saffron">Video {activeIndex + 1} of {items.length}</p>
              <h3 className="mt-1 font-serif text-lg font-bold text-white">{active.title}</h3>
              {active.caption && <p className="mt-1 text-xs text-white/65">{active.caption}</p>}
            </div>
            <div className="flex gap-2" role="tablist" aria-label="Choose a video">
              {items.map((item, index) => <button key={item.id} type="button" role="tab" aria-selected={index === activeIndex} aria-label={`Show video ${index + 1}: ${item.title}`} onClick={() => setActiveIndex(index)} className={`h-2.5 rounded-full transition-all ${index === activeIndex ? 'w-8 bg-saffron' : 'w-2.5 bg-white/35 hover:bg-white/65'}`} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
