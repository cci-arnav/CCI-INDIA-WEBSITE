import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isCurrentUserAdmin } from '../../lib/news'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { canAccessAdmin } from '../../lib/contentRules'

export default function AdminGuard() {
  const [state, setState] = useState(isSupabaseConfigured ? 'loading' : 'unconfigured')
  const location = useLocation()
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    isCurrentUserAdmin().then((allowed) => active && setState(canAccessAdmin({ configured: true, authenticated: allowed, admin: allowed }) ? 'allowed' : 'denied'))
    const { data } = supabase.auth.onAuthStateChange(() => isCurrentUserAdmin().then((allowed) => active && setState(canAccessAdmin({ configured: true, authenticated: allowed, admin: allowed }) ? 'allowed' : 'denied')))
    return () => { active = false; data.subscription.unsubscribe() }
  }, [])
  if (state === 'loading') return <div className="container-main section-padding" aria-live="polite">Checking administrator access…</div>
  if (state === 'unconfigured') return <Navigate to="/admin/login" replace />
  if (state !== 'allowed') return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  return <Outlet />
}
