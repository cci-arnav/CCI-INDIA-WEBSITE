import { useEffect, useRef, useState } from 'react'
import { Play, X } from 'lucide-react'
import gallery from '../../../content/gallery.json'
import SectionHeading from '../ui/SectionHeading'
import { getLifeAtCCIVideos } from '../../lib/homeSections'

const videos = getLifeAtCCIVideos(gallery.videos.items)

export default function LifeAtCCI() {
  const [activeId, setActiveId] = useState(null)
  const dialogRef = useRef(null)
  const returnFocusRef = useRef(null)
  const activeVideo = videos.find((item) => item.id === activeId)
  const featured = videos[0]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !activeVideo || dialog.open) return
    returnFocusRef.current = document.activeElement
    const previousDocumentOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      document.documentElement.style.overflow = previousDocumentOverflow
      document.body.style.overflow = previousBodyOverflow
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus()
    }
  }, [activeVideo])

  const closeDialog = () => {
    if (dialogRef.current?.open) dialogRef.current.close()
    setActiveId(null)
  }

  return (
    <>
      <section className="life-at-cci section-padding border-b border-border bg-off-white" aria-labelledby="life-at-cci-title">
        <div className="container-main">
          <SectionHeading
            eyebrow="Life at CCI"
            title="The people and partnerships behind our work"
            description="Hear from CCI India members and explore video highlights from our events and published media."
            id="life-at-cci-title"
          />
          {featured ? (
            <div className="life-at-cci__layout">
              <button type="button" className="life-at-cci__featured" onClick={() => setActiveId(featured.id)} aria-label={`Play ${featured.title}`}>
                <span className="life-at-cci__brand-art" aria-hidden="true"><img src="/brand/cci-icon-mark.png" alt="" /></span>
                <span className="life-at-cci__play"><Play size={22} fill="currentColor" aria-hidden="true" /></span>
                <span className="life-at-cci__feature-copy"><span>Featured video</span><strong>{featured.title}</strong><span>Play video</span></span>
              </button>
              <div className="life-at-cci__supporting" aria-label="More CCI India videos">
                {videos.slice(1).map((item, index) => (
                  <button key={item.id} type="button" className="life-at-cci__item" onClick={() => setActiveId(item.id)} aria-label={`Play ${item.title}`}>
                    <span className="life-at-cci__item-index">0{index + 2}</span>
                    <span className="life-at-cci__item-title">{item.title}</span>
                    <Play size={17} className="life-at-cci__item-play" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="life-at-cci__empty">
              <p>CCI India video highlights will appear here as approved media is added.</p>
              <a href="/gallery" className="life-at-cci__empty-link">Visit the gallery</a>
            </div>
          )}
        </div>
      </section>

      <dialog ref={dialogRef} className="home-media-dialog" aria-labelledby="life-video-title" onClose={() => setActiveId(null)}>
        {activeVideo && (
          <div className="home-media-dialog__content">
            <div className="home-media-dialog__header">
              <h2 id="life-video-title" className="font-serif text-xl font-bold text-navy-deep sm:text-2xl">{activeVideo.title}</h2>
              <button type="button" className="home-media-dialog__close" onClick={closeDialog} aria-label="Close video">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="home-media-dialog__player">
              {activeVideo.provider === 'local' ? (
                <video
                  title={activeVideo.title}
                  aria-label={activeVideo.title}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                >
                  <source src={activeVideo.url} type="video/mp4" />
                  Your browser does not support HTML video.
                </video>
              ) : (
                <iframe
                  title={activeVideo.title}
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?controls=1&rel=0`}
                  allow="encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
