import { Info } from 'lucide-react'
import { PROTOTYPE_DISCLOSURE } from '../../data/bharatInvestmentGrid'

export default function BIGDisclosure({ compact = false }) {
  return (
    <div className={`border-l-4 border-saffron bg-[#fff8ea] text-navy-deep ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'}`} role="note">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 shrink-0 text-saffron" size={18} aria-hidden="true" />
        <p><strong>Illustrative Prototype Data.</strong> {PROTOTYPE_DISCLOSURE}</p>
      </div>
    </div>
  )
}
