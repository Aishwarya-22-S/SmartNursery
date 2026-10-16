import { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext.jsx'
import { ROLE_LABELS } from '../utils/roles.js'

function Profile() {
  // useContext - reads the shared user/profile object, its updater and the translation helper
  const { user, updateProfile, t } = useContext(AppContext)

  // useState - holds the editable copy of the profile fields
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(user)

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleEdit = () => {
    setForm(user)
    setEditing(true)
  }

  const handleSave = () => {
    // Role is intentionally excluded here - it's assigned at login by
    // authService and must never be editable from the Profile form
    // (otherwise any customer could just type "admin" and self-promote).
    const { role: _ignoredRole, ...editableFields } = form
    updateProfile(editableFields)
    setEditing(false)
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="dash-title">{t('profile')}</div>
      </div>

      <div className="card" style={{ maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="avatar" style={{ width: 84, height: 84, fontSize: 'calc(32px * var(--font-scale, 1))', margin: '0 auto' }}>
            {user.name[0]}
          </div>
        </div>

        {!editing ? (
          <>
            <div className="mb-16"><span className="text-muted" style={{ fontSize: 'calc(12.5px * var(--font-scale, 1))' }}>{t('profileName')}</span><div style={{ fontWeight: 600 }}>{user.name}</div></div>
            <div className="mb-16"><span className="text-muted" style={{ fontSize: 'calc(12.5px * var(--font-scale, 1))' }}>{t('profileEmail')}</span><div style={{ fontWeight: 600 }}>{user.email}</div></div>
            <div className="mb-16"><span className="text-muted" style={{ fontSize: 'calc(12.5px * var(--font-scale, 1))' }}>{t('profileRole')}</span><div style={{ fontWeight: 600 }}>{ROLE_LABELS[user.role] || user.role}</div></div>
            <div className="mb-24"><span className="text-muted" style={{ fontSize: 'calc(12.5px * var(--font-scale, 1))' }}>{t('profilePhone')}</span><div style={{ fontWeight: 600 }}>{user.phone}</div></div>
            <button className="btn btn-primary btn-block" onClick={handleEdit}>{t('profileEdit')}</button>
          </>
        ) : (
          <>
            <div className="field"><label>{t('profileName')}</label><input name="name" value={form.name} onChange={handleChange} /></div>
            <div className="field"><label>{t('profileEmail')}</label><input name="email" value={form.email} onChange={handleChange} /></div>
            <div className="field"><label>{t('profileRole')}</label><input name="role" value={ROLE_LABELS[form.role] || form.role} disabled title="Role is assigned by the system and cannot be changed here" /></div>
            <div className="field"><label>{t('profilePhone')}</label><input name="phone" value={form.phone} onChange={handleChange} /></div>
            <button className="btn btn-primary btn-block" onClick={handleSave}>{t('profileSave')}</button>
          </>
        )}
      </div>
    </div>
  )
}

export default Profile
