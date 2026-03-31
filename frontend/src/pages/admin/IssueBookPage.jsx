import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/common/Button'
import styles from './BookForm.module.css'

export default function IssueBookPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    user_id: '', book_id: '', due_date: '', notes: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Quick search states
  const [userSearch, setUserSearch]   = useState('')
  const [bookSearch, setBookSearch]   = useState('')
  const [userResults, setUserResults] = useState([])
  const [bookResults, setBookResults] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)

  const searchUsers = async (q) => {
    if (!q.trim()) { setUserResults([]); return }
    try {
      const res = await api.get('/users', { params: { search: q, limit: 6 } })
      setUserResults(res.data.data)
    } catch {}
  }

  const searchBooks = async (q) => {
    if (!q.trim()) { setBookResults([]); return }
    try {
      const res = await api.get('/books', { params: { search: q, limit: 6 } })
      setBookResults(res.data.data)
    } catch {}
  }

  // Default due date = 14 days from today
  const defaultDue = new Date(Date.now() + 14 * 864e5).toISOString().split('T')[0]

  const validate = () => {
    const errs = {}
    if (!form.user_id) errs.user_id = 'Select a borrower.'
    if (!form.book_id) errs.book_id = 'Select a book.'
    if (!form.due_date) errs.due_date = 'Due date is required.'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await api.post('/issues', form)
      toast.success('Book issued successfully!')
      navigate('/admin/issues')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book.')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Issue Book"
        subtitle="Assign a book to a student or staff member"
        actions={<Button variant="ghost" onClick={() => navigate('/admin/issues')}>← Back</Button>}
      />

      <div className={styles.card}>
        <form onSubmit={handleSubmit} noValidate>
          {/* Borrower search */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Select Borrower</h4>
            {selectedUser ? (
              <div style={pill}>
                <span>👤 {selectedUser.first_name} {selectedUser.last_name} — {selectedUser.enrollment_id} ({selectedUser.role})</span>
                <button type="button" style={clearBtn} onClick={() => { setSelectedUser(null); setForm(f => ({ ...f, user_id: '' })) }}>✕</button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <FormInput
                  label="Search user (name, email, enrollment)"
                  value={userSearch}
                  onChange={e => { setUserSearch(e.target.value); searchUsers(e.target.value) }}
                  error={errors.user_id}
                  placeholder="Type to search…"
                />
                {userResults.length > 0 && (
                  <div style={dropdown}>
                    {userResults.map(u => (
                      <div key={u.id} style={dropItem}
                        onClick={() => { setSelectedUser(u); setForm(f => ({ ...f, user_id: u.id })); setUserResults([]); setUserSearch('') }}>
                        <strong>{u.first_name} {u.last_name}</strong>
                        <span style={{ color: 'var(--color-ink-50)', fontSize: '0.8rem' }}> — {u.enrollment_id} ({u.role})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Book search */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Select Book</h4>
            {selectedBook ? (
              <div style={pill}>
                <span>📚 {selectedBook.title} by {selectedBook.author} — {selectedBook.available_quantity} available</span>
                <button type="button" style={clearBtn} onClick={() => { setSelectedBook(null); setForm(f => ({ ...f, book_id: '' })) }}>✕</button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <FormInput
                  label="Search book (title, author, ISBN)"
                  value={bookSearch}
                  onChange={e => { setBookSearch(e.target.value); searchBooks(e.target.value) }}
                  error={errors.book_id}
                  placeholder="Type to search…"
                />
                {bookResults.length > 0 && (
                  <div style={dropdown}>
                    {bookResults.map(b => (
                      <div key={b.id} style={{ ...dropItem, opacity: b.available_quantity === 0 ? 0.5 : 1 }}
                        onClick={() => {
                          if (b.available_quantity === 0) { toast.error('No copies available.'); return }
                          setSelectedBook(b); setForm(f => ({ ...f, book_id: b.id })); setBookResults([]); setBookSearch('')
                        }}>
                        <strong>{b.title}</strong>
                        <span style={{ color: 'var(--color-ink-50)', fontSize: '0.8rem' }}> — {b.author} | {b.available_quantity} left</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Due date & notes */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Issue Details</h4>
            <div className={styles.grid2}>
              <FormInput
                label="Due Date" type="date"
                value={form.due_date || defaultDue}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                error={errors.due_date}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <FormInput
              label="Notes (optional)" type="textarea"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} placeholder="Any special notes…"
            />
          </div>

          <div className={styles.formActions}>
            <Button variant="ghost" type="button" onClick={() => navigate('/admin/issues')}>Cancel</Button>
            <Button type="submit" loading={loading}>Issue Book</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const pill = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  background: 'var(--color-green-lt)', border: '1px solid var(--color-green)',
  borderRadius: 'var(--radius-sm)', padding: '10px 14px',
  fontSize: '0.875rem', color: 'var(--color-green)',
}
const clearBtn = {
  background: 'none', border: 'none', color: 'var(--color-green)',
  cursor: 'pointer', fontSize: '0.9rem', padding: '0 4px',
}
const dropdown = {
  position: 'absolute', top: '100%', left: 0, right: 0,
  background: 'var(--color-surface)', border: '1px solid var(--color-ink-20)',
  borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-lg)',
  zIndex: 50, maxHeight: 220, overflowY: 'auto', marginTop: 4,
}
const dropItem = {
  padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--color-ink-08)',
  fontSize: '0.875rem', transition: 'background 0.1s',
}
