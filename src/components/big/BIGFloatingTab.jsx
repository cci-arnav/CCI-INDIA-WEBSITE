import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function BIGFloatingTab() {
  const { pathname } = useLocation()
  const [pastHomeHero, setPastHomeHero] = useState(false)

  useEffect(() => {
    if (pathname !== '/') return undefined

    let frame = 0

    const updateVisibility = () => {
      frame = 0
      const hero = document.querySelector('.home-hero')
      setPastHomeHero(!hero || hero.getBoundingClientRect().bottom <= 0)
    }

    const scheduleUpdate = () => {
      if (frame) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateVisibility)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [pathname])

  if (pathname.startsWith('/bharat-investment-grid') || (pathname === '/' && !pastHomeHero)) return null

  return (
    <Link
      to="/bharat-investment-grid"
      aria-label="Explore Bharat Investment Grid"
      title="Explore Bharat Investment Grid"
      className="big-floating-tab"
    >
      <span className="big-floating-tab__shine" aria-hidden="true" />
      <span className="big-floating-tab__mark" aria-hidden="true">
        <img src="/images/bharat-investment-grid/big-mark.svg" alt="" width="54" height="54" />
      </span>
      <span className="big-floating-tab__action" aria-hidden="true">
        <span>Explore India</span>
        <ArrowRight size={13} />
      </span>
    </Link>
  )
}
