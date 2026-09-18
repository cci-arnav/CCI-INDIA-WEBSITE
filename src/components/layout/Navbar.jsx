import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu, Users, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../../lib/navigation'
import Button from '../ui/Button'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopMenu, setDesktopMenu] = useState(null)
  const [mobileSection, setMobileSection] = useState(null)
  const closeTimer = useRef(null)
  const navRef = useRef(null)
  const location = useLocation()
  const isActive = (href) => href === '/' ? location.pathname === '/' : location.pathname === href || location.pathname.startsWith(`${href}/`)
  const cancelClose = () => window.clearTimeout(closeTimer.current)
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setDesktopMenu(null), 140)
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      const trigger = navRef.current?.querySelector('button[aria-expanded="true"]') || document.querySelector('#mobile-navigation button[aria-expanded="true"]')
      setDesktopMenu(null)
      setMobileSection(null)
      setMobileOpen(false)
      trigger?.focus()
    }
    const media = window.matchMedia('(min-width: 1100px)')
    const onBreakpoint = () => media.matches ? setMobileOpen(false) : setDesktopMenu(null)
    document.addEventListener('keydown', onKeyDown)
    media.addEventListener('change', onBreakpoint)
    return () => {
      cancelClose()
      document.removeEventListener('keydown', onKeyDown)
      media.removeEventListener('change', onBreakpoint)
    }
  }, [])

  return (
    <header className="sticky top-9 z-40 border-b border-border bg-white" onClick={(event) => { if (event.target.closest('a')) { setMobileOpen(false); setMobileSection(null); setDesktopMenu(null) } }}>
      <div className="container-main flex min-h-[86px] items-center justify-between gap-3 py-2">
        <Link to="/" className="flex shrink-0 flex-col items-center gap-0.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal">
          <img src="/brand/cci-logo.png" alt="CCI India" width="1161" height="1042" className="h-14 w-auto sm:h-16" />
          <span className="hidden text-center text-[8px] uppercase leading-tight tracking-[0.14em] text-muted-fg sm:inline-block">Chamber of Commerce <br />&amp; Industry of India</span>
        </Link>
        <button type="button" className="inline-flex min-h-11 min-w-11 items-center justify-center border border-border text-navy-deep min-[1100px]:hidden" onClick={() => setMobileOpen((value) => !value)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}>
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>

        <nav ref={navRef} aria-label="Primary navigation" className="hidden min-[1100px]:flex min-w-0 flex-1 items-center justify-end gap-0.5">
          {NAV_ITEMS.map((item) => item.children ? (
            <div key={item.label} className="relative" onMouseEnter={() => { cancelClose(); setDesktopMenu(item.label) }} onMouseLeave={scheduleClose} onFocusCapture={() => { cancelClose(); setDesktopMenu(item.label) }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose() }}>
              <div className={`flex items-center rounded-sm ${isActive(item.href) ? 'bg-royal/5 text-royal' : 'text-navy-deep'}`}>
                <Link to={item.href} className="whitespace-nowrap px-2 py-3 text-[12px] font-semibold transition-colors hover:text-royal focus-visible:outline focus-visible:outline-2 focus-visible:outline-royal" aria-current={isActive(item.href) ? 'page' : undefined}>{item.label}</Link>
                <button type="button" className="mr-1 inline-flex min-h-10 min-w-7 items-center justify-center rounded-sm hover:text-royal focus-visible:outline focus-visible:outline-2 focus-visible:outline-royal" aria-label={`Open ${item.label} menu`} aria-expanded={desktopMenu === item.label} onClick={() => setDesktopMenu((current) => current === item.label ? null : item.label)}>
                  <ChevronDown size={14} aria-hidden="true" />
                </button>
              </div>
              <div className={`absolute left-0 top-full z-50 w-[min(340px,calc(100vw-2rem))] pt-2 transition duration-150 ${desktopMenu === item.label ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}>
                <div className="border border-border bg-white p-2 shadow-xl">
                  {item.children.map((child) => <Link key={child.label} to={child.href} className="block min-h-11 px-3 py-2.5 text-sm text-navy-deep transition-colors hover:bg-off-white hover:text-royal focus-visible:outline focus-visible:outline-2 focus-visible:outline-royal">{child.label}</Link>)}
                </div>
              </div>
            </div>
          ) : <Link key={item.label} to={item.href} aria-current={isActive(item.href) ? 'page' : undefined} className={`whitespace-nowrap rounded-sm px-2 py-3 text-[12px] font-semibold transition-colors hover:text-royal focus-visible:outline focus-visible:outline-2 focus-visible:outline-royal ${isActive(item.href) ? 'bg-royal/5 text-royal' : 'text-navy-deep'}`}>{item.label}</Link>)}
        </nav>
        <div className="hidden shrink-0 min-[1180px]:block"><Button to="/membership" variant="cta" size="sm"><Users size={14} aria-hidden="true" /> Join the Network</Button></div>
      </div>

      <nav id="mobile-navigation" aria-label="Mobile navigation" className={`${mobileOpen ? 'block' : 'hidden'} max-h-[calc(100vh-7rem)] overflow-y-auto border-t border-border bg-white min-[1100px]:hidden`}>
        <div className="container-main py-2">
          {NAV_ITEMS.map((item) => <div key={item.label} className="border-b border-border/60 last:border-0">
            {item.children ? <>
              <div className="flex items-stretch">
                <Link to={item.href} className={`flex min-h-11 flex-1 items-center py-2.5 text-sm font-semibold ${isActive(item.href) ? 'text-royal' : 'text-navy-deep'}`}>{item.label}</Link>
                <button type="button" className="flex min-h-11 min-w-11 items-center justify-center text-navy-deep" aria-label={`Toggle ${item.label} links`} aria-expanded={mobileSection === item.label} onClick={() => setMobileSection((current) => current === item.label ? null : item.label)}><ChevronDown size={18} className={`transition-transform ${mobileSection === item.label ? 'rotate-180' : ''}`} aria-hidden="true" /></button>
              </div>
              {mobileSection === item.label && <div className="mb-2 border-l-2 border-saffron pl-3">{item.children.map((child) => <Link key={child.label} to={child.href} className="flex min-h-11 items-center py-2 text-sm text-muted-fg hover:text-royal">{child.label}</Link>)}</div>}
            </> : <Link to={item.href} className={`flex min-h-11 items-center py-2.5 text-sm font-semibold ${isActive(item.href) ? 'text-royal' : 'text-navy-deep'}`}>{item.label}</Link>}
          </div>)}
          <Button to="/membership" variant="primary" className="my-3 w-full">Join the Network</Button>
        </div>
      </nav>
    </header>
  )
}
