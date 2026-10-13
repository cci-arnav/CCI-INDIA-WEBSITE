import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

export default function Carousel({ slides = [], interval = 6400 }) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const [userPaused, setUserPaused] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const pointerStart = useRef(null)
  const slideCount = slides.length

  const goToSlide = useCallback((index, nextDirection = 1) => {
    if (slideCount <= 1) return
    setDirection(nextDirection)
    setCurrent((index + slideCount) % slideCount)
  }, [slideCount])

  const showNext = useCallback(() => {
    setDirection(1)
    setCurrent((value) => (value + 1) % slideCount)
  }, [slideCount])

  const showPrevious = useCallback(() => {
    setDirection(-1)
    setCurrent((value) => (value - 1 + slideCount) % slideCount)
  }, [slideCount])

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      showNext()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showPrevious()
    }
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReduceMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (slideCount <= 1 || userPaused || isInteracting || reduceMotion) return undefined
    const timer = window.setTimeout(showNext, interval)
    return () => window.clearTimeout(timer)
  }, [current, interval, isInteracting, reduceMotion, showNext, slideCount, userPaused])

  if (slideCount === 0) return <div className="h-full w-full bg-navy-deep" />

  const autoplayPaused = userPaused || isInteracting || reduceMotion

  return (
    <div
      className="home-carousel"
      data-current={current}
      data-direction={direction > 0 ? 'next' : 'previous'}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false)
      }}
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label="Business, industry and international engagement"
    >
      <div
        className="home-carousel__viewport"
        onPointerDown={(event) => { pointerStart.current = event.clientX }}
        onPointerUp={(event) => {
          if (pointerStart.current === null) return
          const distance = event.clientX - pointerStart.current
          pointerStart.current = null
          if (Math.abs(distance) < 45) return
          if (distance > 0) showPrevious()
          else showNext()
        }}
        onPointerCancel={() => { pointerStart.current = null }}
      >
        <div className="home-carousel__slides" aria-live="off">
          {slides.map((slide, index) => (
            <div
              key={slide.image || index}
              className={`home-carousel__slide ${index === current ? 'is-active' : ''}`}
              aria-hidden={index !== current}
            >
              {slide.image ? (
                <img
                  src={slide.image}
                  alt={slide.alt || ''}
                  className="home-carousel__image"
                  style={{ objectPosition: slide.objectPosition || 'center' }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
              ) : (
                <div className="h-full w-full" style={{ background: slide.background }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {slideCount > 1 && (
        <div className="home-carousel__controls" aria-label="Carousel controls">
          <button type="button" className="home-carousel__arrow" onClick={showPrevious} aria-label="Show previous slide">
            <ChevronLeft aria-hidden="true" />
          </button>
          <div className="home-carousel__pagination">
            <div className="home-carousel__dots" role="group" aria-label="Choose a slide">
              {slides.map((slide, index) => (
                <button
                  key={slide.image || index}
                  type="button"
                  aria-label={`Show slide ${index + 1} of ${slideCount}`}
                  aria-current={index === current ? 'true' : undefined}
                  onClick={() => goToSlide(index, index >= current ? 1 : -1)}
                >
                  <span
                    key={`${index}-${current}-${autoplayPaused}`}
                    className={index === current && !autoplayPaused ? 'is-progressing' : ''}
                    style={index === current ? { '--carousel-interval': `${interval}ms` } : undefined}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="home-carousel__pause"
              onClick={() => setUserPaused((value) => !value)}
              aria-label={reduceMotion ? 'Automatic slides disabled by reduced motion preference' : userPaused ? 'Resume automatic slides' : 'Pause automatic slides'}
              aria-pressed={userPaused}
              disabled={reduceMotion}
            >
              {userPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            </button>
          </div>
          <button type="button" className="home-carousel__arrow" onClick={showNext} aria-label="Show next slide">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        Showing slide {current + 1} of {slideCount}: {slides[current]?.alt || 'CCI India highlight'}
      </p>
    </div>
  )
}
