import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { Table, Pagination } from '../../components/common/Table'
import SearchBar from '../../components/common/SearchBar'
import styles from '../admin/BooksPage.module.css'

export default function StudentBooksPage() {
  const [books, setBooks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [dept, setDept]       = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage]       = useState(1)

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/books', {
        params: { page, limit: 12, ...(search && { search }), ...(dept && { department: dept }) }
      })
      setBooks(res.data.data)
      setPagination(res.data.pagination)
    } finally { setLoading(false) }
  }, [page, search, dept])

  useEffect(() => { fetchBooks() }, [fetchBooks])
  useEffect(() => { setPage(1) }, [search, dept])

  const columns = [
    { key: 'book_number', label: 'No.', width: 100 },
    { key: 'title', label: 'Title', render: (v, row) => (
      <div>
        <div style={{ fontWeight: 500 }}>{v}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-50)' }}>{row.author}</div>
      </div>
    )},
    { key: 'department', label: 'Dept.' },
    { key: 'semester',   label: 'Sem.' },
    { key: 'category',   label: 'Category' },
    { key: 'available_quantity', label: 'Availability', render: v => (
      <span style={{
        fontWeight: 600,
        color: v > 0 ? 'var(--color-green)' : 'var(--color-accent)'
      }}>
        {v > 0 ? `${v} available` : 'Not available'}
      </span>
    )},
    { key: 'location', label: 'Location' },
  ]

  return (
    <div className="page-enter">
      <PageHeader
        title="Library Books"
        subtitle={`${pagination?.total ?? 0} books in the collection`}
      />

      <div className={styles.toolbar}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search title, author, ISBN…" />
        <select className={styles.filter} value={dept} onChange={e => setDept(e.target.value)}>
          <option value="">All departments</option>
          {['Computer Science','Electronics','Mechanical','General','Library'].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <Table columns={columns} data={books} loading={loading} emptyMessage="No books match your search." />
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  )
}
