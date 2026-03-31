import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { Table, Pagination, StatusBadge } from '../../components/common/Table'
import SearchBar from '../../components/common/SearchBar'
import Button from '../../components/common/Button'
import Modal, { ConfirmModal } from '../../components/common/Modal'
import FormInput from '../../components/common/FormInput'
import styles from './BooksPage.module.css'

export default function IssuesPage() {
  const navigate = useNavigate()
  const [issues, setIssues]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage]       = useState(1)
  const [returnId, setReturnId] = useState(null)
  const [returning, setReturning] = useState(false)
  const [fine, setFine]       = useState(0)

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/issues', {
        params: { page, limit: 10, ...(search && { search }), ...(status && { status }) }
      })
      setIssues(res.data.data)
      setPagination(res.data.pagination)
    } catch { toast.error('Failed to load issues.') }
    finally { setLoading(false) }
  }, [page, search, status])

  useEffect(() => { fetchIssues() }, [fetchIssues])
  useEffect(() => { setPage(1) }, [search, status])

  const handleReturn = async () => {
    setReturning(true)
    try {
      await api.put(`/issues/${returnId}/return`, { fine_amount: fine })
      toast.success('Book returned successfully.')
      setReturnId(null)
      setFine(0)
      fetchIssues()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return.')
    } finally { setReturning(false) }
  }

  const getStatus = (issue) => {
    if (issue.status === 'returned') return 'returned'
    if (new Date(issue.due_date) < new Date()) return 'overdue'
    return 'issued'
  }

  const columns = [
    { key: 'id', label: 'ID', width: 60 },
    { key: 'book_title', label: 'Book', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 500 }}>{v}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-50)' }}>{row.book_number}</div>
      </div>
    )},
    { key: 'borrower', label: 'Borrower', render: (_, row) => (
      <div>
        <div style={{ fontWeight: 500 }}>{row.first_name} {row.last_name}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-50)' }}>{row.user_role}</div>
      </div>
    )},
    { key: 'issue_date', label: 'Issued',   render: v => new Date(v).toLocaleDateString() },
    { key: 'due_date',   label: 'Due Date', render: (v, row) => (
      <span style={{ color: getStatus(row) === 'overdue' ? 'var(--color-accent)' : 'inherit' }}>
        {new Date(v).toLocaleDateString()}
      </span>
    )},
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={getStatus(row)} /> },
    { key: 'actions', label: '', width: 100, render: (_, row) => (
      row.status !== 'returned' ? (
        <Button size="sm" variant="secondary" onClick={() => { setReturnId(row.id); setFine(0) }}>
          Return
        </Button>
      ) : (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-50)' }}>
          {row.return_date ? new Date(row.return_date).toLocaleDateString() : '—'}
        </span>
      )
    )},
  ]

  return (
    <div className="page-enter">
      <PageHeader
        title="Book Issues"
        subtitle="Track issued, returned and overdue books"
        actions={<Button onClick={() => navigate('/admin/issues/new')}>+ Issue Book</Button>}
      />

      <div className={styles.toolbar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search book, borrower…" />
        <select className={styles.filter} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="issued">Issued</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
        <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatus('') }}>Clear</Button>
      </div>

      <Table columns={columns} data={issues} loading={loading} emptyMessage="No issue records found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Return modal */}
      <Modal
        isOpen={!!returnId}
        onClose={() => setReturnId(null)}
        title="Process Book Return"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setReturnId(null)} disabled={returning}>Cancel</Button>
            <Button onClick={handleReturn} loading={returning}>Confirm Return</Button>
          </div>
        }
      >
        <FormInput
          label="Fine Amount (₹)"
          type="number" min="0" step="0.50"
          value={fine}
          onChange={e => setFine(Number(e.target.value))}
          hint="Enter 0 if no fine is applicable"
        />
      </Modal>
    </div>
  )
}
