import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { Table, Pagination, StatusBadge } from '../../components/common/Table'
import SearchBar from '../../components/common/SearchBar'
import Button from '../../components/common/Button'
import { ConfirmModal } from '../../components/common/Modal'
import styles from './BooksPage.module.css'

export default function UsersListPage({ role }) {
  const navigate = useNavigate()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage]       = useState(1)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const label = role === 'student' ? 'Students' : 'Staff'

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/users', { params: { role, page, limit: 10, ...(search && { search }) } })
      setUsers(res.data.data)
      setPagination(res.data.pagination)
    } catch { toast.error(`Failed to load ${label.toLowerCase()}.`) }
    finally { setLoading(false) }
  }, [role, page, search, label])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { setPage(1) }, [search])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/users/${deleteId}`)
      toast.success('User deleted.')
      setDeleteId(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete.')
    } finally { setDeleting(false) }
  }

  const columns = [
    { key: 'enrollment_id', label: 'ID / Enroll No.', width: 130 },
    { key: 'name', label: 'Name', render: (_, row) => (
      <div>
        <div style={{ fontWeight: 500 }}>{row.first_name} {row.last_name}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-50)' }}>{row.email}</div>
      </div>
    )},
    { key: 'department', label: 'Department' },
    { key: 'phone',      label: 'Phone' },
    { key: 'is_active',  label: 'Status', width: 90,  render: v => <StatusBadge status={v ? 'active' : 'inactive'} /> },
    { key: 'created_at', label: 'Joined', width: 110, render: v => new Date(v).toLocaleDateString() },
    { key: 'actions', label: '', width: 110, render: (_, row) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="ghost"   onClick={() => navigate(`/admin/users/${row.id}`)}>View</Button>
        <Button size="sm" variant="danger"  onClick={() => setDeleteId(row.id)}>Del</Button>
      </div>
    )},
  ]

  return (
    <div className="page-enter">
      <PageHeader
        title={label}
        subtitle={`${pagination?.total ?? 0} ${label.toLowerCase()} registered`}
        actions={
          <Button onClick={() => navigate('/admin/register')}>+ Add {label.slice(0, -1)}</Button>
        }
      />

      <div className={styles.toolbar}>
        <SearchBar value={search} onChange={setSearch} placeholder={`Search ${label.toLowerCase()}…`} />
        <Button variant="ghost" size="sm" onClick={() => setSearch('')}>Clear</Button>
      </div>

      <Table columns={columns} data={users} loading={loading} emptyMessage={`No ${label.toLowerCase()} found.`} />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete User"
        message="Are you sure you want to permanently delete this user account?"
        confirmLabel="Delete User"
      />
    </div>
  )
}
