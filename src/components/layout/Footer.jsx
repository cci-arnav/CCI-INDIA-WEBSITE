import { Link } from 'react-router-dom'
import { Download, MapPin, Phone, Smartphone, BriefcaseBusiness, Share2, Play } from 'lucide-react'
import home from '../../../content/home.json'
import contact from '../../../content/contact.json'
import Button from '../ui/Button'

export default function Footer() {
  const { footer } = home

  return (
    <footer className="footer-root">

      {/* ── CTA Band ── */}
      <div className="footer-cta">
        <div className="container-main">
          <div className="footer-cta__inner">
            <div className="footer-cta__text">
              <p className="footer-cta__eyebrow">{footer.ctaEyebrow}</p>
              <h2 className="footer-cta__title font-serif">{footer.ctaTitle}</h2>
              <p className="footer-cta__desc">{footer.ctaDescription}</p>
            </div>
            <div className="footer-cta__actions">
              <Button to={footer.ctaPrimary.href} variant="accent">{footer.ctaPrimary.label}</Button>
              <Button to={footer.ctaSecondary.href} variant="outline-light">{footer.ctaSecondary.label}</Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="footer-body">
        <div className="container-main">
          <div className="footer-grid">

            {/* Col 1 — Brand */}
            <div className="footer-brand">
              <Link to="/" className="footer-brand__logo-wrap" aria-label="CCI India — home">
                <img
                  src="/brand/cci-logo.png"
                  alt="CCI India"
                  width={961}
                  height={442}
                  className="footer-brand__logo"
                />
              </Link>
              <p className="footer-brand__tagline">Chamber of Commerce &amp; Industry of India</p>
              <p className="footer-brand__desc">{footer.description}</p>

              {/* Social links */}
              <div className="footer-social">
                <a href="https://www.linkedin.com/company/cci-india" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="footer-social__link">
                  <BriefcaseBusiness size={15} aria-hidden="true" />
                </a>
                <a href="https://twitter.com/CCI_India" target="_blank" rel="noreferrer" aria-label="Twitter / X" className="footer-social__link">
                  <Share2 size={15} aria-hidden="true" />
                </a>
                <a href="https://www.youtube.com/@CCIIndia" target="_blank" rel="noreferrer" aria-label="YouTube" className="footer-social__link">
                  <Play size={15} aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Col 2–3 — Nav columns */}
            {footer.linkColumns.map((col) => (
              <div key={col.heading} className="footer-nav-col">
                <h3 className="footer-nav-col__heading">{col.heading}</h3>
                <ul className="footer-nav-col__list">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="footer-nav-col__link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Col 4 — Contact */}
            <div className="footer-contact-col">
              <h3 className="footer-nav-col__heading">Get In Touch</h3>

              <div className="footer-contact-col__block">
                <MapPin size={14} className="footer-contact-col__icon" aria-hidden="true" />
                <div>
                  <p className="footer-contact-col__label">{contact.headquarters.name}</p>
                  <p className="footer-contact-col__text">{contact.headquarters.address}</p>
                </div>
              </div>

              <div className="footer-contact-col__block">
                <Phone size={14} className="footer-contact-col__icon" aria-hidden="true" />
                <div>
                  <p className="footer-contact-col__label">Phone</p>
                  <a
                    href={`tel:${contact.headquarters.phone.replace(/[^\d+]/g, '')}`}
                    className="footer-contact-col__text footer-contact-col__tel"
                  >
                    {contact.headquarters.phone}
                  </a>
                  <p className="footer-contact-col__text">Toll Free: {footer.tollFree}</p>
                </div>
              </div>

              {/* App download */}
              <div className="footer-app">
                <p className="footer-app__label">CCI India Mobile</p>
                <a
                  href="/downloads/cci-india.apk"
                  download="CCI-India.apk"
                  className="footer-app__btn"
                >
                  <Smartphone size={14} aria-hidden="true" />
                  <span>Android App</span>
                  <Download size={12} className="footer-app__dl-icon" aria-hidden="true" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <div className="container-main">
          <div className="footer-bottom__inner">
            <p className="footer-bottom__copy">
              © {new Date().getFullYear()} {footer.copyright}
            </p>
            <div className="footer-bottom__links">
              <Link to="/about" className="footer-bottom__link">Privacy Policy</Link>
              <span aria-hidden="true" className="footer-bottom__sep">·</span>
              <Link to="/about" className="footer-bottom__link">Terms of Use</Link>
              <span aria-hidden="true" className="footer-bottom__sep">·</span>
              <Link to="/sitemap" className="footer-bottom__link">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  )
}
