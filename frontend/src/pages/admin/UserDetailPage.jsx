import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { Table } from '../../components/common/Table'
import { StatusBadge } from '../../components/common/Table'
import Button from '../../components/common/Button'
import FormInput from '../../components/common/FormInput'
import styles from './ProfilePage.module.css'

export default function UserDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [user, setUser]     = useState(null)
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({})

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get('/issues', { params: { user_id: id, limit: 20 } })
    ]).then(([uRes, iRes]) => {
      const u = uRes.data.user
      setUser(u)
      setForm({
        first_name: u.first_name, last_name: u.last_name,
        phone: u.phone || '', department: u.department || '',
        enrollment_id: u.enrollment_id || '', is_active: u.is_active,
      })
      setIssues(iRes.data.data)
    }).catch(() => toast.error('Failed to load user.'))
    .finally(() => setLoading(false))
  }, [id])

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put(`/users/${id}`, form)
      setUser(res.data.user)
      toast.success('User updated.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update.')
    } finally { setSaving(false) }
  }

  const issueColumns = [
    { key: 'book_title', label: 'Book' },
    { key: 'issue_date',  label: 'Issued',  render: v => new Date(v).toLocaleDateString() },
    { key: 'due_date',    label: 'Due',     render: v => new Date(v).toLocaleDateString() },
    { key: 'return_date', label: 'Returned',render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'fine_amount', label: 'Fine',    render: v => Number(v) > 0 ? `₹${v}` : '—' },
    { key: 'status', label: 'Status', render: (_, row) => (
      <StatusBadge status={row.status === 'issued' && new Date(row.due_date) < new Date() ? 'overdue' : row.status} />
    )},
  ]

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>
  if (!user) return null

  const initials = `${user.first_name[0]}${user.last_name[0]}`

  return (
    <div className="page-enter">
      <PageHeader
        title={`${user.first_name} ${user.last_name}`}
        subtitle={`${user.role} · ${user.department || 'No department'}`}
        actions={<Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>}
      />

      <div className={styles.layout}>
        {/* Profile sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrap}>
              {user.profile_image
                ? <img src={`/uploads/${user.profile_image}`} alt="Profile" className={styles.avatarImg} />
                : <div className={styles.avatarFallback}>{initials}</div>
              }
            </div>
            <h3 className={styles.profileName}>{user.first_name} {user.last_name}</h3>
            <span className={styles.roleBadge}>{user.role}</span>
          </div>
          <div className={styles.infoList}>
            {[
              { label: 'Email',      value: user.email },
              { label: 'ID / Enroll', value: user.enrollment_id || '—' },
              { label: 'Phone',      value: user.phone || '—' },
              { label: 'Status',     value: <StatusBadge status={user.is_active ? 'active' : 'inactive'} /> },
              { label: 'Joined',     value: new Date(user.created_at).toLocaleDateString() },
            ].map(item => (
              <div key={item.label} className={styles.infoItem}>
                <span className={styles.infoLabel}>{item.label}</span>
                <span className={styles.infoValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit form + issue history */}
        <div className={styles.formArea}>
          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Edit Details</h4>
            <form onSubmit={handleSave} noValidate>
              <div className={styles.grid2}>
                <FormInput label="First Name" value={form.first_name || ''} onChange={e => setForm(f => ({...f, first_name: e.target.value}))} required />
                <FormInput label="Last Name"  value={form.last_name  || ''} onChange={e => setForm(f => ({...f, last_name: e.target.value}))}  required />
                <FormInput label="Phone"      value={form.phone      || ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                <FormInput label="Department" type="select" value={form.department || ''} onChange={e => setForm(f => ({...f, department: e.target.value}))}>
                  <option value="">Select department</option>
                  {['Computer Science','Electronics','Mechanical','Civil','General','Administration','Library'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </FormInput>
                <FormInput label="Enrollment / Employee ID" value={form.enrollment_id || ''} onChange={e => setForm(f => ({...f, enrollment_id: e.target.value}))} />
                <FormInput label="Status" type="select" value={form.is_active ? '1' : '0'} onChange={e => setForm(f => ({...f, is_active: e.target.value === '1'}))}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </FormInput>
              </div>
              <div className={styles.formFooter}>
                <Button type="submit" loading={saving}>Save Changes</Button>
              </div>
            </form>
          </div>

          <div className={styles.card}>
            <h4 className={styles.cardTitle}>Issue History ({issues.length})</h4>
            <Table columns={issueColumns} data={issues} loading={false} emptyMessage="No issue history." />
          </div>
        </div>
      </div>
    </div>
  )
}
