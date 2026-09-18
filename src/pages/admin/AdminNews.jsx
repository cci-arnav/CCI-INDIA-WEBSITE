import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminNews() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    let active = true
    supabase.from('news').select('*').order('created_at', { ascending: false }).then(({ data, error: queryError }) => {
      if (!active) return
      setLoading(false)
      if (queryError) setError(queryError.message)
      else setItems(data)
    })
    return () => { active = false }
  }, [])
  const remove = async (item) => {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return
    const { error: deleteError } = await supabase.from('news').delete().eq('id', item.id)
    if (deleteError) setError(deleteError.message); else setItems((current) => current.filter((entry) => entry.id !== item.id))
  }
  const signOut = async () => { await supabase.auth.signOut(); navigate('/admin/login') }
  return <section className="section-padding bg-off-white"><div className="container-main"><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-saffron">Administration</p><h1 className="text-3xl font-bold">News items</h1></div><div className="flex gap-3"><Link to="/admin/news/new" className="inline-flex min-h-11 items-center bg-navy-deep px-5 text-sm font-semibold text-white">Add news item</Link><button onClick={signOut} className="min-h-11 border border-border bg-white px-4 text-sm">Sign out</button></div></div>{error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}{loading ? <p>Loading news…</p> : items.length ? <div className="overflow-x-auto border border-border bg-white"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-navy-deep text-white"><tr><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Publication</th><th className="p-3">Actions</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-border"><td className="p-3 font-semibold">{item.title}</td><td className="p-3">{item.category}</td><td className="p-3 capitalize">{item.status}</td><td className="p-3">{item.published_at ? new Date(item.published_at).toLocaleDateString('en-IN') : '—'}</td><td className="p-3"><div className="flex gap-3"><Link to={`/admin/news/${item.id}/edit`} className="text-royal underline">Edit</Link>{item.content && item.status === 'published' && <Link to={`/news/${item.slug}`} className="text-royal underline">Preview</Link>}<button onClick={() => remove(item)} className="text-red-700 underline">Delete</button></div></td></tr>)}</tbody></table></div> : <div className="border border-dashed border-border bg-white p-10 text-center">No news items yet. Create the first one.</div>}</div></section>
}
