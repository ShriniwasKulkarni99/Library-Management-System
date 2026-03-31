import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { Table, Pagination, StatusBadge } from '../../components/common/Table'
import SearchBar from '../../components/common/SearchBar'
import styles from '../admin/BooksPage.module.css'

export default function MyIssuesPage() {
  const [issues, setIssues]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage]       = useState(1)

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/issues', {
        params: { page, limit: 10, ...(search && { search }), ...(status && { status }) }
      })
      setIssues(res.data.data)
      setPagination(res.data.pagination)
    } finally { setLoading(false) }
  }, [page, search, status])

  useEffect(() => { fetchIssues() }, [fetchIssues])
  useEffect(() => { setPage(1) }, [search, status])

  const getStatus = issue => {
    if (issue.status === 'returned') return 'returned'
    if (new Date(issue.due_date) < new Date()) return 'overdue'
    return 'issued'
  }

  const columns = [
    { key: 'book_title', label: 'Book', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 500 }}>{v}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-50)' }}>{row.book_number}</div>
      </div>
    )},
    { key: 'issue_date',  label: 'Issued On',   render: v => new Date(v).toLocaleDateString() },
    { key: 'due_date',    label: 'Due Date',     render: (v, row) => (
      <span style={{ color: getStatus(row) === 'overdue' ? 'var(--color-accent)' : 'inherit', fontWeight: getStatus(row) === 'overdue' ? 600 : 400 }}>
        {new Date(v).toLocaleDateString()}
      </span>
    )},
    { key: 'return_date', label: 'Returned On',  render: v => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'fine_amount', label: 'Fine',          render: v => Number(v) > 0 ? <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>₹{Number(v).toFixed(2)}</span> : '—' },
    { key: 'status',      label: 'Status',        render: (_, row) => <StatusBadge status={getStatus(row)} /> },
  ]

  return (
    <div className="page-enter">
      <PageHeader
        title="My Books"
        subtitle={`${pagination?.total ?? 0} total issue records`}
      />

      <div className={styles.toolbar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by book title…" />
        <select className={styles.filter} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="issued">Issued</option>
          <option value="returned">Returned</option>
        </select>
        <button
          style={{ background: 'none', border: '1px solid var(--color-ink-20)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--color-ink-80)' }}
          onClick={() => { setSearch(''); setStatus('') }}
        >Clear</button>
      </div>

      <Table columns={columns} data={issues} loading={loading} emptyMessage="No issue history found." />
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  )
}
