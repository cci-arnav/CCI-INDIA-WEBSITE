import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import home from '../../../content/home.json'
import contact from '../../../content/contact.json'
import Button from '../ui/Button'

export default function Footer() {
  const { footer } = home

  return (
    <footer className="border-t border-border bg-navy-deep text-white">
      <div className="border-b border-white/10">
        <div className="container-main section-padding">
          <p className="mb-1 text-xs uppercase tracking-wider text-white/60">{footer.ctaEyebrow}</p>
          <h2 className="mb-3 max-w-xl font-serif text-xl font-bold text-white sm:text-2xl md:text-3xl">{footer.ctaTitle}</h2>
          <p className="mb-6 max-w-2xl text-sm text-white/75">{footer.ctaDescription}</p>
          <div className="flex flex-wrap gap-3">
            <Button to={footer.ctaPrimary.href} variant="accent">{footer.ctaPrimary.label}</Button>
            <Button to={footer.ctaSecondary.href} variant="outline-light">{footer.ctaSecondary.label}</Button>
          </div>
        </div>
      </div>

      <div className="container-main section-padding">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <img
                src="/brand/cci-logo.png"
                alt="CCI India"
                width={961}
                height={442}
                className="h-8 w-auto sm:h-9"
              />
              <p className="text-[10px] text-white/60 sm:text-xs">Chamber of Commerce &amp; Industry of India</p>
            </div>
            <p className="text-xs text-white/70 sm:text-sm">{footer.description}</p>
            <p className="mt-4 text-xs text-white/60 sm:text-sm">Toll Free: {footer.tollFree}</p>
          </div>
          {footer.linkColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-saffron">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-xs text-white/70 transition-colors duration-200 hover:text-white sm:text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-saffron">Office Address</h3>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 shrink-0 text-saffron" size={18} aria-hidden="true" />
              <address className="max-w-xs text-xs not-italic leading-relaxed text-white/70 sm:text-sm">
                <span className="block font-medium text-white/90">{contact.headquarters.name}</span>
                <span className="mt-1 block">{contact.headquarters.address}</span>
                <a className="mt-2 inline-flex min-h-11 items-center text-white/70 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white" href={`tel:${contact.headquarters.phone.replace(/[^\d+]/g, '')}`}>
                  {contact.headquarters.phone}
                </a>
              </address>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-main py-4 text-center text-[10px] text-white/50 sm:text-xs">
          © {new Date().getFullYear()} {footer.copyright}
        </div>
      </div>
    </footer>
  )
}
