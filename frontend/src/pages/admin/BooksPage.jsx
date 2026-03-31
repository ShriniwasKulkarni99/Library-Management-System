import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import { Table, Pagination } from '../../components/common/Table'
import SearchBar from '../../components/common/SearchBar'
import Button from '../../components/common/Button'
import { ConfirmModal } from '../../components/common/Modal'
import styles from './BooksPage.module.css'

export default function BooksPage() {
  const navigate = useNavigate()
  const [books, setBooks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [dept, setDept]       = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage]       = useState(1)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10, ...(search && { search }), ...(dept && { department: dept }) }
      const res = await api.get('/books', { params })
      setBooks(res.data.data)
      setPagination(res.data.pagination)
    } catch { toast.error('Failed to load books.') }
    finally { setLoading(false) }
  }, [page, search, dept])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  // Debounced search
  useEffect(() => { setPage(1) }, [search, dept])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/books/${deleteId}`)
      toast.success('Book deleted.')
      setDeleteId(null)
      fetchBooks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete.')
    } finally { setDeleting(false) }
  }

  const columns = [
    { key: 'book_number', label: 'Book No.', width: 100 },
    { key: 'title',  label: 'Title',  render: (v, row) => (
      <div>
        <div style={{ fontWeight: 500 }}>{v}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-50)' }}>{row.author}</div>
      </div>
    )},
    { key: 'department', label: 'Dept.' },
    { key: 'semester',   label: 'Sem.' },
    { key: 'quantity',   label: 'Total', width: 70 },
    { key: 'available_quantity', label: 'Avail.', width: 70, render: (v) => (
      <span style={{ color: v === 0 ? 'var(--color-accent)' : 'var(--color-green)', fontWeight: 600 }}>{v}</span>
    )},
    { key: 'price', label: 'Price', render: v => v ? `₹${Number(v).toFixed(0)}` : '—' },
    { key: 'actions', label: '', width: 120, render: (_, row) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/books/${row.id}/edit`)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => setDeleteId(row.id)}>Del</Button>
      </div>
    )},
  ]

  return (
    <div className="page-enter">
      <PageHeader
        title="Books"
        subtitle={`${pagination?.total ?? 0} books in library`}
        actions={
          <Button onClick={() => navigate('/admin/books/new')}>+ Add Book</Button>
        }
      />

      {/* Filters */}
      <div className={styles.toolbar}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search title, author, ISBN…"
        />
        <select
          className={styles.filter}
          value={dept}
          onChange={e => setDept(e.target.value)}
        >
          <option value="">All departments</option>
          {['Computer Science','Electronics','Mechanical','General','Library'].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setDept('') }}>Clear</Button>
      </div>

      <Table columns={columns} data={books} loading={loading} emptyMessage="No books found. Add your first book." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Book"
        message="Are you sure you want to delete this book? This cannot be undone."
        confirmLabel="Delete Book"
      />
    </div>
  )
}
