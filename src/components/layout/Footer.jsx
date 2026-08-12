import { Link } from 'react-router-dom'
import home from '../../../content/home.json'
import Button from '../ui/Button'

export default function Footer() {
  const { footer } = home

  return (
    <footer className="border-t border-border bg-navy-deep text-white">
      <div className="border-b border-white/10">
        <div className="container-main section-padding">
          <p className="mb-1 text-xs uppercase tracking-wider text-white/60">{footer.ctaEyebrow}</p>
          <h2 className="mb-3 max-w-xl font-serif text-2xl font-bold text-white md:text-3xl">{footer.ctaTitle}</h2>
          <p className="mb-6 max-w-2xl text-sm text-white/75">{footer.ctaDescription}</p>
          <div className="flex flex-wrap gap-3">
            <Button to={footer.ctaPrimary.href} variant="accent">{footer.ctaPrimary.label}</Button>
            <Button to={footer.ctaSecondary.href} variant="outline-light">{footer.ctaSecondary.label}</Button>
          </div>
        </div>
      </div>

      <div className="container-main section-padding">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <img
                src="/brand/cci-logo.png"
                alt="CCI India"
                width={961}
                height={442}
                className="h-9 w-auto"
              />
              <p className="text-xs text-white/60">Chamber of Commerce &amp; Industry of India</p>
            </div>
            <p className="text-sm text-white/70">{footer.description}</p>
            <p className="mt-4 text-sm text-white/60">Toll Free: {footer.tollFree}</p>
          </div>
          {footer.linkColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-saffron">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-white/70 transition-colors duration-200 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-main py-4 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {footer.copyright}
        </div>
      </div>
    </footer>
  )
}
