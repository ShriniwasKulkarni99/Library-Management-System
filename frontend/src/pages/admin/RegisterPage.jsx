import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/common/Button'
import styles from './BookForm.module.css'

const EMPTY = {
  first_name: '', last_name: '', email: '', password: '',
  role: 'student', department: '', enrollment_id: '', phone: '', address: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = field => e => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.first_name.trim()) errs.first_name = 'First name is required.'
    if (!form.last_name.trim())  errs.last_name  = 'Last name is required.'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required.'
    if (form.password.length < 8) errs.password  = 'Password must be at least 8 characters.'
    if (!/[A-Z]/.test(form.password)) errs.password = 'Password must contain an uppercase letter.'
    if (!/[0-9]/.test(form.password)) errs.password = 'Password must contain a number.'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await api.post('/auth/register', form)
      toast.success(`${form.role.charAt(0).toUpperCase() + form.role.slice(1)} registered successfully!`)
      navigate(form.role === 'student' ? '/admin/students' : form.role === 'staff' ? '/admin/staff' : '/admin')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.'
      toast.error(msg)
      if (err.response?.data?.errors) {
        const s = {}
        err.response.data.errors.forEach(e => { s[e.field] = e.message })
        setErrors(s)
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Register New User"
        subtitle="Create a student, staff, or admin account"
        actions={<Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>}
      />

      <div className={styles.card}>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Account Type</h4>
            <FormInput label="Role" type="select" value={form.role} onChange={set('role')} required>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </FormInput>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Personal Information</h4>
            <div className={styles.grid2}>
              <FormInput label="First Name" value={form.first_name} onChange={set('first_name')} error={errors.first_name} required />
              <FormInput label="Last Name"  value={form.last_name}  onChange={set('last_name')}  error={errors.last_name}  required />
              <FormInput label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} required placeholder="user@library.com" />
              <FormInput label="Phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="9XXXXXXXXX" />
            </div>
            <FormInput label="Address" type="textarea" value={form.address} onChange={set('address')} rows={2} />
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Academic / Employee Details</h4>
            <div className={styles.grid2}>
              <FormInput label="Department" type="select" value={form.department} onChange={set('department')}>
                <option value="">Select department</option>
                {['Computer Science','Information Technology','Electronics','Mechanical','Civil','General','Administration','Library'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </FormInput>
              <FormInput
                label={form.role === 'student' ? 'Enrollment Number' : 'Employee ID'}
                value={form.enrollment_id} onChange={set('enrollment_id')}
                placeholder={form.role === 'student' ? 'CS-2024-001' : 'EMP-2024-001'}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Login Credentials</h4>
            <FormInput
              label="Password" type="password"
              value={form.password} onChange={set('password')}
              error={errors.password} required
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              hint="E.g. Password@123"
            />
          </div>

          <div className={styles.formActions}>
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading}>Register User</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
