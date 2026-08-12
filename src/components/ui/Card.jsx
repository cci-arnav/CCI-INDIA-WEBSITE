const accentMap = {
  royal: 'border-l-royal',
  cyan: 'border-l-cyan',
  saffron: 'border-l-saffron',
  green: 'border-l-green',
}

export default function Card({ children, className = '', accent }) {
  const accentBorder = accent ? accentMap[accent] || '' : ''
  return (
    <div className={`border border-border bg-white p-5 ${accentBorder} ${accent ? 'border-l-4' : ''} ${className}`}>
      {children}
    </div>
  )
}
