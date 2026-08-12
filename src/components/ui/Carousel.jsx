import { useEffect, useState } from 'react'

export default function Carousel({ slides, interval = 6000 }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    console.log('Carousel init - slides:', slides?.length, 'interval:', interval)
    if (!slides || slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % slides.length
        console.log('Carousel advancing to', next)
        return next
      })
    }, interval)
    return () => clearInterval(timer)
  }, [slides.length, interval])

  return (
    <div className="relative h-full w-full overflow-hidden" data-current={current}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-hidden={i !== current}
        >
          {slide.image ? (
            <img
              src={slide.image}
              alt={slide.alt || ''}
              className="h-full w-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="h-full w-full" style={{ background: slide.background }} />
          )}
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={`h-1.5 transition-all duration-200 ${i === current ? 'w-6 bg-saffron' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
