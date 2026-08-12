import { useEffect, useState } from 'react'

export default function Carousel({ slides, interval = 6000 }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), interval)
    return () => clearInterval(timer)
  }, [slides.length, interval])

  return (
    <div className="relative h-full w-full overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`carousel-slide h-full w-full ${i === current ? 'opacity-100' : 'hidden-slide opacity-0'}`}
          style={{ background: slide.background }}
          aria-hidden={i !== current}
        />
      ))}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
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
