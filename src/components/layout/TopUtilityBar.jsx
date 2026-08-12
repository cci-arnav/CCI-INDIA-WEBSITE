import { Link } from 'react-router-dom'
import home from '../../../content/home.json'

export default function TopUtilityBar() {
  return (
    <div className="border-b border-border bg-off-white text-xs text-muted-fg">
      <div className="container-main flex items-center justify-between py-1.5">
        <span>Toll Free: {home.footer.tollFree}</span>
        <span>Chamber of Commerce &amp; Industry of India</span>
      </div>
    </div>
  )
}
