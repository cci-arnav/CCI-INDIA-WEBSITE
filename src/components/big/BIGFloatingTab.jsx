import { ArrowRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function BIGFloatingTab() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/bharat-investment-grid')) return null

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
