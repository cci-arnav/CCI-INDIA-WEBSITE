import { User } from 'lucide-react'
import { useState } from 'react'

export default function LeadershipPhoto({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center border border-border bg-off-white text-muted-fg ${className}`}
        aria-hidden="true"
      >
        <User size={40} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`border border-border object-cover object-top ${className}`}
    />
  )
}
