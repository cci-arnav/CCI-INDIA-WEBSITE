import { useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import editorial from '../../../content/home-editorial.json'

export default function DetailDialog({ item, onClose }) {
  const dialogRef = useRef(null)
  const returnFocusRef = useRef(null)
  const closeTimerRef = useRef(null)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !item) return
    returnFocusRef.current = document.activeElement
    dialog.showModal()
    return () => {
      window.clearTimeout(closeTimerRef.current)
      if (dialog.open) dialog.close()
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus()
    }
  }, [item])

  const close = () => {
    if (isClosing) return
    setIsClosing(true)
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220
    closeTimerRef.current = window.setTimeout(() => {
      if (dialogRef.current?.open) dialogRef.current.close()
      setIsClosing(false)
      onClose()
    }, delay)
  }

  return (
    <dialog
      ref={dialogRef}
      className={`detail-dialog ${isClosing ? 'is-closing' : ''}`}
      aria-labelledby="detail-dialog-title"
      onCancel={(event) => { event.preventDefault(); close() }}
      onClick={(event) => { if (event.target === event.currentTarget) close() }}
    >
      {item && (
        <div className="detail-dialog__layout">
          <figure className="detail-dialog__visual">
            {item.image ? (
              <img src={item.image} alt={item.imageAlt || ''} />
            ) : (
              <div className="detail-dialog__placeholder" aria-label={editorial.imagePlaceholderLabel}>
                <ImageIcon size={34} strokeWidth={1.25} aria-hidden="true" />
                <span>{editorial.imagePlaceholderLabel}</span>
                <strong>{item.placeholderLabel || item.title}</strong>
              </div>
            )}
            <figcaption>CCI India · {item.image ? 'Institutional feature' : 'Image placeholder'}</figcaption>
          </figure>
          <article className="detail-dialog__content">
            <button type="button" className="detail-dialog__close" onClick={close} aria-label="Close details">
              <X size={20} aria-hidden="true" />
            </button>
            <header className="detail-dialog__header">
              <p className="detail-dialog__eyebrow">{item.eyebrow}</p>
              <h2 id="detail-dialog-title" className="font-serif text-2xl font-bold leading-tight text-navy-deep sm:text-3xl">{item.title}</h2>
              <p className="detail-dialog__intro">{item.intro}</p>
              <p className="detail-dialog__review-note">{editorial.modalReviewLabel}</p>
            </header>
            <div className="detail-dialog__sections">
              {item.sections?.map((section) => (
                <section key={section.heading} className="detail-dialog__section">
                  <h3>{section.heading}</h3>
                  {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.points && (
                    <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>
                  )}
                </section>
              ))}
            </div>
            {item.href && <Link className="detail-dialog__link" to={item.href} onClick={close}>{item.linkLabel || 'Explore further'}</Link>}
          </article>
        </div>
      )}
    </dialog>
  )
}
