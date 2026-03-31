import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader } from '../../components/common/PageHeader'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/common/Button'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef()

  const [form, setForm]     = useState({
    first_name: '', last_name: '', phone: '', address: '', department: '', enrollment_id: '',
  })
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [pwErrors, setPwErrors] = useState({})
  const [saving, setSaving]   = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [preview, setPreview] = useState(null)
  const [imgFile, setImgFile] = useState(null)

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name:  user.last_name  || '',
        phone:      user.phone      || '',
        address:    user.address    || '',
        department: user.department || '',
        enrollment_id: user.enrollment_id || '',
      })
    }
  }, [user])

  const set = f => e => { setForm(p => ({ ...p, [f]: e.target.value })); setErrors(p => ({ ...p, [f]: '' })) }
  const setPw = f => e => { setPwForm(p => ({ ...p, [f]: e.target.value })); setPwErrors(p => ({ ...p, [f]: '' })) }

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (!file) return
    setImgFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSave = async e => {
    e.preventDefault()
    const errs = {}
    if (!form.first_name.trim()) errs.first_name = 'Required.'
    if (!form.last_name.trim())  errs.last_name  = 'Required.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (imgFile) fd.append('profile_image', imgFile)

      const res = await api.put(`/users/${user.id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser(res.data.user)
      setImgFile(null)
      toast.success('Profile updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally { setSaving(false) }
  }

  const handlePasswordChange = async e => {
    e.preventDefault()
    const errs = {}
    if (!pwForm.current_password) errs.current_password = 'Enter current password.'
    if (pwForm.new_password.length < 8) errs.new_password = 'Min. 8 characters.'
    if (!/[A-Z]/.test(pwForm.new_password)) errs.new_password = 'Must contain an uppercase letter.'
    if (pwForm.new_password !== pwForm.confirm) errs.confirm = 'Passwords do not match.'
    if (Object.keys(errs).length) { setPwErrors(errs); return }

    setSavingPw(true)
    try {
      await api.put(`/users/${user.id}/password`, {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      toast.success('Password changed successfully.')
      setPwForm({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally { setSavingPw(false) }
  }

  const avatarSrc = preview
    || (user?.profile_image ? `/uploads/${user.profile_image}` : null)

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}` : '?'
  const roleLabel = { admin: 'Administrator', student: 'Student', staff: 'Staff Member' }[user?.role]

  return (
    <div className="page-enter">
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      <div className={styles.layout}>
        {/* Left – avatar & role info */}
        <div className={styles.sidebar}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              {avatarSrc
                ? <img src={avatarSrc} alt="Profile" className={styles.avatarImg} />
                : <div className={styles.avatarFallback}>{initials}</div>
              }
              <button className={styles.avatarEdit} onClick={() => fileRef.current.click()} title="Change photo">
                📷
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            <h3 className={styles.profileName}>{user?.first_name} {user?.last_name}</h3>
            <span className={styles.roleBadge}>{roleLabel}</span>
          </div>

          <div className={styles.infoList}>
            {[
              { label: 'Email',      value: user?.email },
              { label: user?.role === 'student' ? 'Enrollment No.' : 'Employee ID', value: user?.enrollment_id || '—' },
              { label: 'Department', value: user?.department || '—' },
              { label: 'Phone',      value: user?.phone || '—' },
              { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
            ].map(item => (
              <div key={item.label} className={styles.infoItem}>
                <span className={styles.infoLabel}>{item.label}</span>
                <span className={styles.infoValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right – edit forms */}
        <div className={styles.formArea}>
          {/* Profile form */}
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Edit Profile</h4>
            <form onSubmit={handleSave} noValidate>
              <div className={styles.grid2}>
                <FormInput label="First Name" value={form.first_name} onChange={set('first_name')} error={errors.first_name} required />
                <FormInput label="Last Name"  value={form.last_name}  onChange={set('last_name')}  error={errors.last_name}  required />
                <FormInput label="Phone"      value={form.phone}      onChange={set('phone')}       type="tel" />
                <FormInput label={user?.role === 'student' ? 'Enrollment No.' : 'Employee ID'}
                           value={form.enrollment_id} onChange={set('enrollment_id')} />
                <FormInput label="Department" type="select" value={form.department} onChange={set('department')}>
                  <option value="">Select department</option>
                  {['Computer Science','Electronics','Mechanical','Civil','General','Administration','Library'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </FormInput>
              </div>
              <FormInput label="Address" type="textarea" value={form.address} onChange={set('address')} rows={2} />
              <div className={styles.formFooter}>
                <Button type="submit" loading={saving}>Save Changes</Button>
              </div>
            </form>
          </div>

          {/* Password form */}
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Change Password</h4>
            <form onSubmit={handlePasswordChange} noValidate>
              <div className={styles.stack}>
                <FormInput label="Current Password" type="password" value={pwForm.current_password} onChange={setPw('current_password')} error={pwErrors.current_password} required />
                <FormInput label="New Password"     type="password" value={pwForm.new_password}     onChange={setPw('new_password')}     error={pwErrors.new_password}     required placeholder="Min. 8 chars, 1 uppercase, 1 number" />
                <FormInput label="Confirm Password" type="password" value={pwForm.confirm}           onChange={setPw('confirm')}          error={pwErrors.confirm}          required />
              </div>
              <div className={styles.formFooter}>
                <Button type="submit" loading={savingPw}>Update Password</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
