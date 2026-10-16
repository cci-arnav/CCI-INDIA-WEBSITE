import { Link } from 'react-router-dom'
import editorial from '../../../content/home-editorial.json'

export default function DGNote() {
  const note = editorial.dgNote

  return (
    <section className="dg-note" aria-labelledby="dg-note-title">
      <div className="container-main section-padding">
        <div className="dg-note__layout">
          <figure className="dg-note__portrait">
            <img src={note.image} alt={note.imageAlt} loading="lazy" />
            <figcaption><span>{note.name}</span><span>{note.designation}</span></figcaption>
          </figure>
          <div className="dg-note__content">
            <p className="section-heading__eyebrow">{note.eyebrow}</p>
            <h2 id="dg-note-title" className="font-serif text-3xl font-bold leading-tight text-navy-deep sm:text-4xl">{note.title}</h2>
            <p className="dg-note__notice">{note.reviewNotice}</p>
            <div className="dg-note__message">
              {note.paragraphs.map((paragraph) => <p key={paragraph} className="prose-copy">{paragraph}</p>)}
            </div>
            <div className="dg-note__signature">
              <div><p>{note.name}</p><span>{note.designation}</span></div>
              <Link to={note.href}>{note.linkLabel}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
