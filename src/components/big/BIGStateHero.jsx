import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function BIGStateHero({ location }) {
  const [imageFailed, setImageFailed] = useState(false)
  const locationType = location.type === 'state' ? 'State' : 'Union Territory'

  return (
    <header className="big-state-hero">
      <div className="big-state-hero__inner container-main">
        <div className="big-state-hero__copy">
          <nav aria-label="Breadcrumb" className="big-state-hero__breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/bharat-investment-grid">Bharat Investment Grid</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{location.name}</span>
          </nav>
          <p className="big-state-hero__eyebrow">{locationType} · {location.region}</p>
          <h1>{location.name}</h1>
          <p className="big-state-hero__writeup">{location.shortWriteup}</p>
        </div>

        <figure className={`big-state-hero__media${imageFailed ? ' is-fallback' : ''}`}>
          {!imageFailed && location.heroImage ? (
            <img
              src={location.heroImage}
              alt={location.heroImageAlt}
              width="1400"
              height="1000"
              decoding="async"
              fetchPriority="high"
              style={{ objectPosition: location.heroImagePosition }}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="big-state-hero__fallback" role="img" aria-label={`Decorative fallback for ${location.name}`}>
              <span>{location.name.split(/\s+/).map((word) => word[0]).join('').slice(0, 4)}</span>
            </div>
          )}
          <figcaption className="big-state-hero__credit">
            <span>{location.imageSubject}</span>
            <span aria-hidden="true"> · </span>
            Photo:{' '}
            <a href={location.imageCreditUrl} target="_blank" rel="noreferrer">{location.imageCredit}</a>
            <span aria-hidden="true"> · </span>
            <a href={location.imageLicenseUrl} target="_blank" rel="noreferrer">{location.imageLicense}</a>
          </figcaption>
        </figure>
      </div>
    </header>
  )
}
