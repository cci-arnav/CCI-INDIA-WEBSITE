import { ArrowRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function BIGFloatingTab() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/bharat-investment-grid')) return null

  return (
    <Link
      to="/bharat-investment-grid"
      aria-label="Explore Bharat Investment Grid"
      className="big-floating-tab group fixed right-0 top-[55%] z-30 flex min-h-11 max-w-[48px] -translate-y-1/2 items-center overflow-hidden border-y border-l border-white/20 bg-navy-deep text-white shadow-lg focus-visible:max-w-[230px] focus-visible:outline-saffron sm:max-w-[54px] sm:hover:max-w-[230px]"
    >
      <span className="h-full w-1 shrink-0 bg-gradient-to-b from-saffron via-white to-green" aria-hidden="true" />
      <span className="flex min-w-[47px] shrink-0 flex-col items-center px-2 py-3 text-center text-[8px] font-bold uppercase leading-tight tracking-[0.12em] sm:min-w-[53px] sm:text-[9px]">
        <span className="rounded-sm bg-saffron px-1 text-[7px] text-navy-deep">New</span>
        <span className="mt-1">Bharat</span><span>Investment</span><span>Grid</span>
      </span>
      <span className="flex min-w-[168px] items-center gap-2 pr-4 text-xs font-semibold">
        Explore Bharat Investment Grid <ArrowRight size={15} aria-hidden="true" />
      </span>
    </Link>
  )
}
