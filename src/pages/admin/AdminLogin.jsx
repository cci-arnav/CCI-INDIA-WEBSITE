import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { isCurrentUserAdmin } from '../../lib/news'
import { isSupabaseConfigured, supabase, supabaseConfigurationMessage } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  if (location.state?.authenticated) return <Navigate to="/admin/news" replace />
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setError('Sign-in failed. Check your credentials and try again.'); setLoading(false); return }
    if (!await isCurrentUserAdmin()) { await supabase.auth.signOut(); setError('This account is not authorized for news administration.'); setLoading(false); return }
    navigate(location.state?.from || '/admin/news', { replace: true })
  }
  return <section className="section-padding bg-off-white"><div className="container-main"><div className="mx-auto max-w-md border border-border bg-white p-6 shadow-sm"><h1 className="mb-2 text-2xl font-bold">CCI News Administration</h1><p className="mb-6 text-sm text-muted-fg">Sign in with an authorized Supabase account.</p>{!isSupabaseConfigured ? <div role="alert" className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{supabaseConfigurationMessage}</div> : <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 min-h-11 w-full border border-border px-3 font-normal outline-none focus:border-royal" /></label><label className="block text-sm font-semibold">Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 min-h-11 w-full border border-border px-3 font-normal outline-none focus:border-royal" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={loading} className="min-h-11 w-full bg-navy-deep px-5 font-semibold text-white disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button></form>}</div></div></section>
}
