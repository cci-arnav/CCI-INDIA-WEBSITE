import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(null)
  const location = useLocation()

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/'
    if (href.startsWith('/#')) return location.pathname === '/'
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <header className="border-b border-border bg-white">
      <div className="container-main flex items-center justify-between gap-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img
            src="/brand/cci-logo.png"
            alt="CCI India"
            width={961}
            height={442}
            className="h-8 w-auto sm:h-9"
          />
          <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-fg sm:inline-block">
            Chamber of Commerce <br /> &amp; Industry of India
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setDropdown(item.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <button
                  type="button"
                  className={`px-2.5 py-2 text-[13px] font-medium transition-colors duration-200 ${
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
            ) : (
              <Link
                key={item.label}
                to={item.href}
                className={`px-2.5 py-2 text-[13px] font-medium transition-colors duration-200 ${
                  isActive(item.href) ? 'text-royal' : 'text-navy-deep hover:text-royal'
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden lg:block">
          <Button to="/membership" variant="primary" size="sm">
            Join the Network
          </Button>
        </div>

        <button
          type="button"
          className="border border-border px-2.5 py-1.5 text-sm lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white lg:hidden">
          <div className="container-main flex flex-col py-2">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  to={item.href}
                  className="block py-2.5 text-sm font-medium text-navy-deep"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.label}
                    to={child.href}
                    className="block py-1.5 pl-4 text-sm text-muted-fg"
                    onClick={() => setOpen(false)}
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
    </header>
  )
}
