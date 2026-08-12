import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items }) {
  if (!items?.length) return null
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-fg">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link to={item.href} className="transition-colors duration-200 hover:text-royal">
                {item.label}
              </Link>
            ) : (
              <span className="text-navy-deep">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
