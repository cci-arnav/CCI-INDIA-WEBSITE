export default function GlassCard({ children, className = '' }) {
  return (
    <div 
      className={`glass-card relative overflow-hidden rounded-lg border border-white/20 p-6 ${className}`}
    >
      <div className="relative z-10 text-navy-deep">
        {children}
      </div>
    </div>
  )
}
