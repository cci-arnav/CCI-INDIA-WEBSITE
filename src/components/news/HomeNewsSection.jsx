import { useEffect, useState } from 'react'
import { ChevronRight, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchPublishedNews } from '../../lib/news'
import { HOME_NEWS_LIMIT, selectHomeNewsImageStory } from '../../lib/homeNews'

function BrandImageFallback() {
  return (
    <div className="home-news__image-fallback" role="img" aria-label="CCI India news and events">
      <img src="/brand/cci-logo.png" alt="" />
      <span>News &amp; Events</span>
    </div>
  )
}

export default function HomeNewsSection({ moreNewsHref = '/events' }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    let active = true
    fetchPublishedNews({ page: 0, limit: HOME_NEWS_LIMIT })
      .then(({ items: stories }) => {
        if (active) {
          setItems(stories)
          setError('')
        }
      })
      .catch(() => active && setError('News could not be loaded right now. Please try again later.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const imageStory = selectHomeNewsImageStory(items)
  const showFeaturedImage = imageStory && !imageFailed

  return (
    <section className="home-news section-padding border-b border-border bg-white" aria-labelledby="home-news-title">
      <div className="container-main">
        <header className="home-news__heading">
          <p className="home-news__eyebrow">What&apos;s New</p>
          <h2 id="home-news-title" className="home-news__title">
            <span>Find the Latest Newsfeed</span>
            <span>from CCI India.</span>
          </h2>
        </header>

        <div className="home-news__layout">
          <div className="home-news__panel" role="region" aria-label="Latest published headlines">
            <div className="home-news__headlines" aria-live={loading ? 'polite' : undefined}>
              {loading ? (
                <div className="home-news__loading" role="status" aria-label="Loading news headlines">
                  {Array.from({ length: HOME_NEWS_LIMIT }, (_, index) => (
                    <div className="home-news__skeleton" key={index} aria-hidden="true" />
                  ))}
                </div>
              ) : error ? (
                <p className="home-news__message" role="alert">{error}</p>
              ) : items.length ? (
                <ul className="home-news__list">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link className="home-news__headline" to={`/news/${item.slug}`}>
                        <ChevronRight className="home-news__marker" size={17} aria-hidden="true" />
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="home-news__message" role="status">New updates from CCI India will appear here.</p>
              )}
            </div>
            <Link className="home-news__more" to={moreNewsHref}>
              More News <span aria-hidden="true">+</span>
            </Link>
          </div>

          <div className="home-news__image-wrap">
            {showFeaturedImage ? (
              <img
                key={imageStory.featured_image_url}
                className="home-news__image"
                src={imageStory.featured_image_url}
                alt={imageStory.title}
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <BrandImageFallback />
            )}
            {imageStory && showFeaturedImage && (
              <span className="home-news__image-caption"><Newspaper size={15} aria-hidden="true" /> Featured CCI India story</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
