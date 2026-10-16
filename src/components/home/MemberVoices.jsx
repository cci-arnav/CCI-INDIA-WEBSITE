import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Quote, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import content from '../../../content/member-voices.json'
import SectionHeading from '../ui/SectionHeading'
import { excerptForMemberVoice, getPublicMemberVoices } from '../../lib/homeSections'

const publishedVoices = getPublicMemberVoices(content.items)

export default function MemberVoices() {
  const [active, setActive] = useState(null)
  const dialogRef = useRef(null)
  const returnFocusRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !active || dialog.open) return
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
  }, [active])

  const closeDialog = () => {
    if (dialogRef.current?.open) dialogRef.current.close()
    setActive(null)
  }

  return (
    <>
      <section className="member-voices section-padding border-b border-border" aria-labelledby="member-voices-title">
        <div className="container-main">
          <SectionHeading eyebrow={content.eyebrow} title={content.heading} description={content.description} id="member-voices-title" />
          {publishedVoices.length ? (
            <div className="member-voices__grid" data-count={publishedVoices.length}>
              {publishedVoices.map((item, index) => (
                <article key={item.id} className={`member-voice ${index === 0 ? 'member-voice--lead' : ''}`}>
                  <Quote className="member-voice__quote-mark" size={26} aria-hidden="true" />
                  <h3 className="font-serif text-xl font-bold text-navy-deep">{item.title}</h3>
                  <p className="member-voice__excerpt prose-copy">{excerptForMemberVoice(item)}</p>
                  <div className="member-voice__attribution">
                    {item.portrait && <img src={item.portrait} alt="" loading="lazy" />}
                    <div>
                      {item.memberName && <p className="font-semibold text-navy-deep">{item.memberName}</p>}
                      {[item.designation, item.organization].filter(Boolean).length > 0 && <p className="text-sm text-muted-fg">{[item.designation, item.organization].filter(Boolean).join(' · ')}</p>}
                    </div>
                  </div>
                  <button type="button" className="member-voice__read" onClick={() => setActive(item)}>Read full statement <ArrowUpRight size={16} aria-hidden="true" /></button>
                </article>
              ))}
            </div>
          ) : (
            <div className="member-voices__empty">
              <p>Member letters and statements will be shared here once approved for publication.</p>
              <Link to="/membership" className="member-voices__empty-link">Learn about CCI membership <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          )}
        </div>
      </section>

      <dialog ref={dialogRef} className="home-media-dialog home-media-dialog--letter" aria-labelledby="member-voice-title" onClose={() => setActive(null)}>
        {active && (
          <div className="home-media-dialog__content">
            <div className="home-media-dialog__header">
              <div className="min-w-0 pr-10">
                <p className="section-heading__eyebrow">Member statement</p>
                <h2 id="member-voice-title" className="font-serif text-xl font-bold text-navy-deep sm:text-2xl">{active.title}</h2>
                {active.memberName && <p className="mt-2 text-sm text-muted-fg">{[active.memberName, active.designation, active.organization].filter(Boolean).join(' · ')}</p>}
              </div>
              <button type="button" className="home-media-dialog__close" onClick={closeDialog} aria-label="Close statement">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="home-media-dialog__letter prose-copy">{active.statement}</div>
            {active.publicationDate && <time className="mt-6 block text-sm text-muted-fg" dateTime={active.publicationDate}>{new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(active.publicationDate))}</time>}
            {active.attachmentUrl && <a className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-royal underline" href={active.attachmentUrl} target="_blank" rel="noreferrer">View source document <ArrowUpRight size={15} aria-hidden="true" /></a>}
          </div>
        )}
      </dialog>
    </>
  )
}
