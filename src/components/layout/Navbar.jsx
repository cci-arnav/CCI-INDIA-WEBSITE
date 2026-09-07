import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Users } from 'lucide-react'
import home from '../../../content/home.json'
import Button from '../ui/Button'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Councils', href: '/councils' },
  { label: 'Membership', href: '/membership' },
  { label: 'States Investment', href: '/states-investment' },
  {
    label: 'Initiatives',
    href: '/market-entry',
    children: home.centers.items.map((c) => ({
      label: c.name,
      href:
        c.name === 'Center for Market Entry & Business Expansion'
          ? '/market-entry'
          : '/#initiatives',
    })),
  },
  { label: 'Careers', href: '/careers' },
  { label: 'News & Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
]

// Links that should always be visible on smaller screens
const PRIMARY_LINKS = ['Home', 'About Us', 'Councils', 'Membership', 'States Investment']
// Links that can be moved to "More" dropdown
const SECONDARY_LINKS = ['Initiatives', 'Careers', 'News & Events', 'Contact']

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(null)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [visibleLinks, setVisibleLinks] = useState([])
  const [hiddenLinks, setHiddenLinks] = useState([])
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const moreMenuRef = useRef(null)
  const location = useLocation()

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    if (href.startsWith('/#')) return location.pathname === '/'
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  // Handle responsive nav link visibility
  useEffect(() => {
    const handleResize = () => {
      const navElement = document.querySelector('.nav-container')
      if (!navElement) return

      const navWidth = navElement.offsetWidth
      const navLinkWidth = 80 // Approximate width per nav link (including padding)
      const ctaWidth = 150 // Approximate width for CTA button
      const moreButtonWidth = 60 // Approximate width for More button
      const logoWidth = 150 // Approximate width for logo
      const padding = 40 // Padding for container

      // Available width for nav links
      const availableWidth = navWidth - logoWidth - ctaWidth - padding

      // Calculate how many primary links can fit
      const maxPrimaryLinks = Math.floor(availableWidth / navLinkWidth)

      if (maxPrimaryLinks >= PRIMARY_LINKS.length) {
        // All links fit
        setVisibleLinks(NAV_ITEMS)
        setHiddenLinks([])
      } else {
        // Calculate how many primary links we can show
        const visiblePrimaryCount = Math.max(1, maxPrimaryLinks - 1) // Reserve space for More button
        const visibleItems = NAV_ITEMS.slice(0, visiblePrimaryCount)
        const hiddenItems = NAV_ITEMS.slice(visiblePrimaryCount)

        // If we still have hidden items after primary links, move them to More
        if (hiddenItems.length > 0) {
          setVisibleLinks(visibleItems)
          setHiddenLinks(hiddenItems)
        } else {
          setVisibleLinks(NAV_ITEMS)
          setHiddenLinks([])
        }
      }
    }

    // Initial check
    handleResize()

    // Add resize listener
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close more menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMoreMenu = () => setMoreMenuOpen(!moreMenuOpen)
  const closeMoreMenu = () => setMoreMenuOpen(false)

  return (
    <header className="sticky top-9 z-40 border-b border-border bg-white">
      <div className="container-main flex items-center justify-between gap-3 py-3">
        <Link to="/" className="flex shrink-0 flex-col items-center gap-1">
          <img
            src="/brand/cci-logo.png"
            alt="CCI India"
            width={1161}
            height={1042}
            className="h-14 w-auto sm:h-16"
          />
          <span className="hidden text-[9px] uppercase tracking-[0.15em] text-muted-fg sm:inline-block text-center leading-tight">
            Chamber of Commerce <br />&amp; Industry of India
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="border border-border px-2.5 py-1.5 text-sm lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex nav-container items-center gap-1 flex-1 overflow-visible">
          {visibleLinks.map((item) => {
            if (item.children) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setDropdown(item.label)}
                  onMouseLeave={() => setDropdown(null)}
                >
                  <button
                    type="button"
                    className={`px-2 py-2 text-[13px] font-medium transition-colors duration-200 whitespace-nowrap ${
                      isActive(item.href) ? 'text-royal' : 'text-navy-deep hover:text-royal'
                    }`}
                  >
                    {item.label} ▾
                  </button>
                  {dropdown === item.label && (
                    <div className="absolute left-0 top-full z-50 min-w-[280px] border border-border bg-white py-1 shadow-sm">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="block px-4 py-2 text-[13px] text-navy-deep transition-colors duration-200 hover:bg-off-white hover:text-royal"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Link
                key={item.label}
                to={item.href}
                className={`px-2 py-2 text-[13px] font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive(item.href) ? 'text-royal' : 'text-navy-deep hover:text-royal'
                }`}
              >
                {item.label}
              </Link>
            )
          })}

          {/* More dropdown */}
          {hiddenLinks.length > 0 && (
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                className={`px-2 py-2 text-[13px] font-medium transition-colors duration-200 whitespace-nowrap ${
                  moreMenuOpen ? 'text-royal' : 'text-navy-deep hover:text-royal'
                }`}
                onClick={toggleMoreMenu}
                aria-label="More navigation options"
                aria-expanded={moreMenuOpen}
              >
                More ▾
              </button>

              {moreMenuOpen && (
                <div className="absolute right-0 top-full z-50 min-w-[200px] border border-border bg-white py-1 shadow-lg">
                  {hiddenLinks.map((item) => {
                    if (item.children) {
                      return (
                        <div key={item.label}>
                          <div className="px-4 py-2 text-[13px] text-navy-deep font-medium">
                            {item.label} ▾
                          </div>
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              to={child.href}
                              className="block px-4 py-2 text-[13px] text-navy-deep transition-colors duration-200 hover:bg-off-white hover:text-royal"
                              onClick={closeMoreMenu}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block px-4 py-2 text-[13px] text-navy-deep transition-colors duration-200 hover:bg-off-white hover:text-royal"
                        onClick={closeMoreMenu}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Mobile nav - shown when menu is open */}
        <div className={`lg:hidden ${open ? 'block' : 'hidden'}`}>
          {open && (
            <div className="absolute top-full left-0 w-full border-t border-border bg-white">
              <div className="container-main flex flex-col py-2">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label}>
                    <Link
                      to={item.href}
                      className="block py-2.5 text-sm font-medium text-navy-deep"
                      onClick={() => {
                        setOpen(false)
                        closeMoreMenu()
                      }}
                    >
                      {item.label}
                    </Link>
                    {item.children?.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        className="block py-1.5 pl-4 text-sm text-muted-fg"
                        onClick={() => {
                          setOpen(false)
                          closeMoreMenu()
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ))}
                <Button to="/membership" variant="primary" className="mt-3 w-full">
                  Join the Network
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:block lg:ml-4 flex-shrink-0">
          <Button to="/membership" variant="cta" size="sm" className="whitespace-nowrap">
            <Users size={14} strokeWidth={2} />
            Join the Network
          </Button>
        </div>
      </div>
    </header>
  )
}
