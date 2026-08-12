import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Contact, X } from 'lucide-react'
import { FacebookIcon, LinkedinIcon, YoutubeIcon , InstagramIcon } from '../ui/SocialIcons'
import home from '../../../content/home.json'

const TICKER_INTERVAL_MS = 4500

const socialIcons = {
  linkedin: LinkedinIcon,
  twitter: ({ size, className }) => <X size={size} strokeWidth={1.75} className={className} />,
  youtube: YoutubeIcon,
  facebook: FacebookIcon,
  instagram: InstagramIcon,
}

function AnnouncementTicker({ items }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return undefined
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % items.length)
    }, TICKER_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [items.length])

  return (
    <div className="utility-ticker min-w-0 flex-1" aria-live="polite" aria-atomic="true">
      {items.map((item, index) => {
        const content = (
          <span className="block truncate text-[12px] leading-5 text-navy-deep/80">
            {item.text}
          </span>
        )

        return (
          <div
            key={item.text}
            className={`utility-ticker__item ${index === active ? 'is-active' : ''}`}
            aria-hidden={index !== active}
          >
            {item.href ? (
              <Link to={item.href} className="min-w-0 transition-colors duration-200 hover:text-white">
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function TopUtilityBar() {
  const { utilityBar, footer } = home
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)

  useEffect(() => {
    if (!langOpen) return undefined
    const onClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [langOpen])

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-gradient-to-r from-[#fc4a1a] to-[#f7b733] text-muted-fg">
      <div className="container-main flex h-9 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-4">
          <span className="hidden shrink-0 border-r border-border pr-2.5 text-[10px] font-semibold uppercase tracking-wider text-white sm:inline">
            News
          </span>
          <AnnouncementTicker items={utilityBar.tickerItems} />
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <span className="hidden whitespace-nowrap text-[12px] text-black lg:inline">
            Toll Free: {footer.tollFree}
          </span>

          <span className="hidden h-3.5 w-px bg-border sm:inline" aria-hidden="true" />

          <Link
            to="/contact"
            className="flex items-center gap-1 text-[12px] text-black transition-colors duration-200 hover:text-white"  
          >
            <Contact size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden sm:inline">Contact</span>
          </Link>

          <div className="relative" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen((open) => !open)}
              className="flex items-center gap-1 border rounded-2xl border-border bg-white px-2 py-0.5 text-[12px] text-black transition-colors duration-200 hover:text-blue-deep hover:bg-blue-deep/10" 
              aria-expanded={langOpen}
              aria-haspopup="listbox"
            >
              {utilityBar.languages[0]}
              <span className="text-[10px]" aria-hidden="true">▾</span>
            </button>
            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 top-full z-50 mt-0.5 min-w-[6rem] max-h-64 overflow-y-auto border border-border bg-white py-1 shadow-sm"
              >
                {utilityBar.languages.map((lang) => (
                  <li key={lang} role="option" aria-selected={lang === utilityBar.languages[0]}>
                    <button
                      type="button"
                      className="block w-full px-3 py-1 text-left text-[12px] text-navy-deep transition-colors duration-200 hover:bg-off-white"
                      onClick={() => setLangOpen(false)}
                    >
                      {lang}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <span className="hidden h-3.5 w-px bg-border md:inline" aria-hidden="true" />

          <div className="hidden items-center gap-2.5 md:flex">
            {utilityBar.social.map((item) => {
              const Icon = socialIcons[item.icon]
              if (!Icon) return null
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="text-black transition-colors duration-200 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
