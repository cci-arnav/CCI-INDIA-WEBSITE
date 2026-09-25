import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { locations, sectors } from '../../data/bharatInvestmentGrid'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function DemoModal({ open, onClose, mode = 'interest', opportunityName = '' }) {
  const dialogRef = useRef(null)
  const openerRef = useRef(null)
  const errorRef = useRef(null)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    openerRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => dialogRef.current?.querySelector('input, select, textarea, button')?.focus(), 0)
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), input, select, textarea')]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      openerRef.current?.focus()
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return undefined
    const frame = window.requestAnimationFrame(() => {
      setErrors({})
      setSuccess(false)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  if (!open) return null

  const interest = mode === 'interest'
  const title = interest ? 'Express Interest' : 'Submit an Opportunity'
  const field = (name, label, required = true, type = 'text') => (
    <label className="block text-sm font-semibold text-navy-deep">
      {label}{required && <span className="text-red-700"> *</span>}
      <input id={`big-${mode}-${name}`} name={name} type={type} required={required} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `big-${mode}-${name}-error` : undefined} className="field" />
      {errors[name] && <span id={`big-${mode}-${name}-error`} className="mt-1 block text-xs text-red-700">{errors[name]}</span>}
    </label>
  )

  const submit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const required = interest
      ? ['fullName', 'organization', 'country', 'email', 'investmentInterest', 'message', 'consent']
      : ['projectName', 'organization', 'stateSlug', 'sector', 'investmentRequirement', 'projectStage', 'contactName', 'email', 'description', 'consent']
    const next = {}
    required.forEach((name) => { if (!String(values[name] || '').trim()) next[name] = 'This field is required.' })
    if (values.email && !emailPattern.test(values.email)) next.email = 'Enter a valid email address.'
    setErrors(next)
    if (Object.keys(next).length) {
      window.setTimeout(() => {
        errorRef.current?.focus()
        form.querySelector(`[name="${Object.keys(next)[0]}"]`)?.focus()
      }, 0)
      return
    }
    form.reset()
    setSuccess(true)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-deep/80 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`big-${mode}-title`} className="max-h-[calc(100vh-1.5rem)] w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-white px-4 py-3 sm:px-6">
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-saffron">Bharat Investment Grid</p><h2 id={`big-${mode}-title`} className="text-xl font-bold">{title}</h2></div>
          <button type="button" onClick={onClose} className="flex min-h-11 min-w-11 items-center justify-center text-navy-deep" aria-label={`Close ${title}`}><X aria-hidden="true" /></button>
        </div>
        <div className="p-4 sm:p-6">
          {success ? (
            <div role="status" tabIndex="-1" className="border-l-4 border-green bg-green/10 p-5 text-sm text-navy-deep">
              <h3 className="text-lg font-bold">Form completed</h3>
              <p className="mt-2">Thank you. No information has been stored or transmitted.</p>
              <button type="button" onClick={onClose} className="mt-5 min-h-11 bg-navy-deep px-5 py-2 font-bold text-white">Close</button>
            </div>
          ) : (
            <form noValidate onSubmit={submit}>
              <p className="mb-5 text-sm text-muted-fg">No information entered here is sent, stored, or submitted to CCI India.</p>
              {Object.keys(errors).length > 0 && <div ref={errorRef} tabIndex="-1" role="alert" className="mb-4 border border-red-300 bg-red-50 p-3 text-sm text-red-800">Please correct {Object.keys(errors).length} highlighted {Object.keys(errors).length === 1 ? 'field' : 'fields'}.</div>}
              {opportunityName && <p className="mb-4 border border-border bg-off-white p-3 text-sm"><strong>Opportunity:</strong> {opportunityName}</p>}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {interest ? <>
                  {field('fullName', 'Full Name')}{field('organization', 'Organization')}{field('country', 'Country')}{field('email', 'Email', true, 'email')}{field('investmentInterest', 'Investment Interest')}
                  <label className="block text-sm font-semibold text-navy-deep sm:col-span-2">Message <span className="text-red-700">*</span><textarea name="message" rows="4" required className="field" aria-invalid={Boolean(errors.message)} />{errors.message && <span className="text-xs text-red-700">{errors.message}</span>}</label>
                </> : <>
                  {field('projectName', 'Project name')}{field('organization', 'Promoter / organization name')}
                  <label className="text-sm font-semibold text-navy-deep">State / UT <span className="text-red-700">*</span><select name="stateSlug" className="field" defaultValue=""><option value="">Select location</option>{locations.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select>{errors.stateSlug && <span className="text-xs text-red-700">{errors.stateSlug}</span>}</label>
                  <label className="text-sm font-semibold text-navy-deep">Sector <span className="text-red-700">*</span><select name="sector" className="field" defaultValue=""><option value="">Select sector</option>{sectors.map((item) => <option key={item}>{item}</option>)}</select>{errors.sector && <span className="text-xs text-red-700">{errors.sector}</span>}</label>
                  {field('investmentRequirement', 'Estimated investment requirement')}{field('projectStage', 'Project stage')}{field('contactName', 'Contact name')}{field('email', 'Email', true, 'email')}{field('phone', 'Phone', false, 'tel')}
                  <label className="block text-sm font-semibold text-navy-deep sm:col-span-2">Short project description <span className="text-red-700">*</span><textarea name="description" rows="4" required className="field" />{errors.description && <span className="text-xs text-red-700">{errors.description}</span>}</label>
                </>}
              </div>
              <label className="mt-5 flex items-start gap-3 text-sm text-navy-deep"><input name="consent" type="checkbox" value="acknowledged" className="mt-1 h-5 w-5 shrink-0" /> <span>I understand that information entered here will not be stored or transmitted.</span></label>
              {errors.consent && <p className="ml-8 text-xs text-red-700">{errors.consent}</p>}
              <button type="submit" className="mt-6 min-h-11 bg-navy-deep px-5 py-2.5 font-bold text-white hover:bg-royal">{interest ? 'Submit Interest' : 'Complete Form'}</button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
