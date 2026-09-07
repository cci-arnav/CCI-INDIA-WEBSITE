import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-navy-deep text-white border border-navy-deep hover:bg-navy',
  secondary: 'bg-white text-navy-deep border border-navy-deep hover:bg-off-white',
  accent: 'bg-saffron text-white border border-saffron hover:bg-saffron/90',
  'outline-light': 'bg-transparent text-white border border-white/40 hover:border-white hover:bg-white/10',
  cta: 'bg-gradient-to-r from-saffron to-orange-500 text-white border border-transparent hover:from-orange-500 hover:to-saffron hover:shadow-lg hover:scale-105 focus:ring-2 focus:ring-saffron focus:ring-offset-2',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
}

export default function Button({ to, href, variant = 'primary', size = 'md', className = '', children, type = 'button', ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
