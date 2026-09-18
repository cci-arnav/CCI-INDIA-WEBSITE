import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items, className = '', inverse = false }) {
  if (!items?.length) return null
  return (
    <nav aria-label="Breadcrumb" className={`mb-4 text-sm text-muted-fg ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link to={item.href} className={`transition-colors duration-200 ${inverse ? 'text-white/75 hover:text-white' : 'hover:text-royal'}`}>
                {item.label}
              </Link>
            ) : (
              <span className={inverse ? 'text-white' : 'text-navy-deep'}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
