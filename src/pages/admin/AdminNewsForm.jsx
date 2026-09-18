import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { slugifyNewsTitle, validateNews } from '../../lib/news'
import { supabase } from '../../lib/supabase'

const empty = { title: '', description: '', content: '', category: 'News', status: 'draft', published_at: '', featured_image_url: '', featured_image_path: '' }

export default function AdminNewsForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const navigate = useNavigate()
  useEffect(() => { if (!editing) return; supabase.from('news').select('*').eq('id', id).single().then(({ data, error }) => { if (error) setMessage(error.message); else setValues({ ...empty, ...data, published_at: data.published_at?.slice(0, 16) || '' }) }) }, [editing, id])
  const set = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }))
  const upload = async (file) => {
    if (!file) return
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from('news-images').upload(path, file, { cacheControl: '3600', upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('news-images').getPublicUrl(path)
    setValues((current) => ({ ...current, featured_image_path: path, featured_image_url: data.publicUrl }))
  }
  const submit = async (event) => {
    event.preventDefault(); const found = validateNews(values); setErrors(found); if (Object.keys(found).length) return
    setSaving(true); setMessage('')
    const { data: auth } = await supabase.auth.getUser()
    const payload = { ...values, title: values.title.trim(), slug: slugifyNewsTitle(values.title), description: values.description.trim(), content: values.content.trim() || null, published_at: values.published_at ? new Date(values.published_at).toISOString() : null, featured_image_url: values.featured_image_url || null, featured_image_path: values.featured_image_path || null, created_by: auth.user.id }
    const query = editing ? supabase.from('news').update(payload).eq('id', id) : supabase.from('news').insert(payload)
    const { error } = await query
    setSaving(false)
    if (error) setMessage(error.message); else { setMessage('Saved successfully.'); window.setTimeout(() => navigate('/admin/news'), 500) }
  }
  return <section className="section-padding bg-off-white"><div className="container-main"><form onSubmit={submit} className="mx-auto max-w-3xl border border-border bg-white p-6"><p className="text-xs font-semibold uppercase tracking-wider text-saffron">Administration</p><h1 className="mb-6 text-3xl font-bold">{editing ? 'Edit news item' : 'Add news item'}</h1><div className="grid gap-5 sm:grid-cols-2"><Field label="Title" error={errors.title} className="sm:col-span-2"><input value={values.title} onChange={set('title')} className="field" /></Field><Field label="Short description" error={errors.description} className="sm:col-span-2"><textarea rows="3" value={values.description} onChange={set('description')} className="field py-2" /></Field><Field label="Full content (optional)" className="sm:col-span-2"><textarea rows="10" value={values.content || ''} onChange={set('content')} className="field py-2" /></Field><Field label="Category" error={errors.category}><input value={values.category} onChange={set('category')} className="field" /></Field><Field label="Status" error={errors.status}><select value={values.status} onChange={set('status')} className="field"><option value="draft">Draft</option><option value="published">Published</option></select></Field><Field label="Publication date" error={errors.published_at}><input type="datetime-local" value={values.published_at} onChange={set('published_at')} className="field" /></Field><Field label="Featured image"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event.target.files?.[0]).catch((error) => setMessage(error.message))} className="block min-h-11 w-full text-sm" /></Field></div>{values.featured_image_url && <img src={values.featured_image_url} alt="Featured preview" className="mt-5 aspect-video max-w-sm object-cover" />}{message && <p role="status" className="mt-5 text-sm text-royal">{message}</p>}<div className="mt-6 flex flex-wrap gap-3"><button disabled={saving} className="min-h-11 bg-navy-deep px-6 font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button><button type="button" onClick={() => setPreview((value) => !value)} className="min-h-11 border border-navy-deep px-6 text-navy-deep">{preview ? 'Hide preview' : 'Preview'}</button><button type="button" onClick={() => navigate('/admin/news')} className="min-h-11 border border-border px-6">Cancel</button></div></form>{preview && <article className="mx-auto mt-6 max-w-3xl border border-border bg-white p-6" aria-label="News preview"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-saffron">{values.category || 'News'} · {values.status}</p><h2 className="mb-3 text-2xl font-bold">{values.title || 'Untitled news item'}</h2>{values.featured_image_url && <img src={values.featured_image_url} alt="" className="mb-5 aspect-video w-full object-cover" />}<p className="mb-5 font-semibold text-navy-deep">{values.description || 'No description yet.'}</p><div className="whitespace-pre-line text-muted-fg">{values.content || 'No full content has been added.'}</div></article>}</div></section>
}

function Field({ label, error, className = '', children }) { return <label className={`block text-sm font-semibold text-navy-deep ${className}`}>{label}{children}{error && <span className="mt-1 block font-normal text-red-700">{error}</span>}</label> }
