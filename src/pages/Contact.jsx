import { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'

function Contact() {
  const { t } = useContext(AppContext)

  // useState - manages the simple contact form fields
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="landing-section">
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ color: 'var(--text)' }}>{t('contactHeading')}</h1>
        <p className="text-muted mt-8 mb-24">{t('contactSubtitle')}</p>

        {sent && <div className="badge badge-success mb-16" style={{ display: 'block', padding: '10px 14px' }}>{t('contactSent')}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t('contactName')}</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
          </div>
          <div className="field">
            <label>{t('contactEmail')}</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>{t('contactMessage')}</label>
            <textarea name="message" rows={4} value={form.message} onChange={handleChange} placeholder="How can we help?" />
          </div>
          <button type="submit" className="btn btn-primary btn-block">{t('contactSend')}</button>
        </form>
      </div>
    </div>
  )
}

export default Contact
