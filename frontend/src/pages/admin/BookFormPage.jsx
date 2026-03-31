import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { PageHeader } from '../../components/common/PageHeader'
import FormInput from '../../components/common/FormInput'
import Button from '../../components/common/Button'
import styles from './BookForm.module.css'

const EMPTY = {
  title: '', author: '', isbn: '', book_number: '', department: '',
  category: '', semester: '', quantity: 1, available_quantity: '',
  price: '', location: '', description: '',
}

export default function BookFormPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const isEdit    = Boolean(id)

  const [form, setForm]     = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [numberLoading, setNumberLoading] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/books/${id}`).then(res => {
      const b = res.data.book
      setForm({
        title: b.title || '', author: b.author || '', isbn: b.isbn || '',
        book_number: b.book_number || '', department: b.department || '',
        category: b.category || '', semester: b.semester || '',
        quantity: b.quantity, available_quantity: b.available_quantity,
        price: b.price || '', location: b.location || '', description: b.description || '',
      })
    }).catch(() => toast.error('Failed to load book.')).finally(() => setFetching(false))
  }, [id, isEdit])

  useEffect(() => {
    if (isEdit) return

    let ignore = false

    const loadNextBookNumber = async () => {
      setNumberLoading(true)
      try {
        const { data } = await api.get('/books/next-number', {
          params: form.department ? { department: form.department } : {},
        })
        if (!ignore) {
          setForm(f => ({ ...f, book_number: data.book_number || '' }))
        }
      } catch {
        if (!ignore) {
          setForm(f => ({ ...f, book_number: '' }))
        }
      } finally {
        if (!ignore) setNumberLoading(false)
      }
    }

    loadNextBookNumber()
    return () => { ignore = true }
  }, [form.department, isEdit])

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim())  errs.title  = 'Title is required.'
    if (!form.author.trim()) errs.author = 'Author is required.'
    if (!form.quantity || form.quantity < 1) errs.quantity = 'Quantity must be at least 1.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        available_quantity: form.available_quantity !== '' ? Number(form.available_quantity) : undefined,
        price: form.price !== '' ? form.price : undefined,
      }

      if (isEdit) {
        await api.put(`/books/${id}`, payload)
        toast.success('Book updated successfully.')
      } else {
        await api.post('/books', payload)
        toast.success('Book added successfully.')
      }
      navigate('/admin/books')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save book.'
      toast.error(msg)
      if (err.response?.data?.errors) {
        const serverErrs = {}
        err.response.data.errors.forEach(e => { serverErrs[e.field] = e.message })
        setErrors(serverErrs)
      }
    } finally { setLoading(false) }
  }

  if (fetching) return <div className={styles.loading}><div className={styles.spinner} /></div>

  return (
    <div className="page-enter">
      <PageHeader
        title={isEdit ? 'Edit Book' : 'Add New Book'}
        subtitle={isEdit ? 'Update book details' : 'Register a new book in the library'}
        actions={<Button variant="ghost" onClick={() => navigate('/admin/books')}>← Back</Button>}
      />

      <div className={styles.card}>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Basic Information</h4>
            <div className={styles.grid2}>
              <FormInput label="Title" value={form.title} onChange={set('title')} error={errors.title} required placeholder="Book title" />
              <FormInput label="Author" value={form.author} onChange={set('author')} error={errors.author} required placeholder="Author name" />
              <FormInput label="ISBN" value={form.isbn} onChange={set('isbn')} placeholder="978-…" />
              <FormInput
                label="Book Number"
                value={form.book_number}
                placeholder="BK-CS-001"
                readOnly
                hint={isEdit ? 'Book number stays unchanged while editing.' : (numberLoading ? 'Generating based on selected department…' : 'Generated automatically from department series.')}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Classification</h4>
            <div className={styles.grid3}>
              <FormInput label="Department" type="select" value={form.department} onChange={set('department')}>
                <option value="">Select department</option>
                {['Computer Science','Information Technology','Electronics','Mechanical','Civil','General','Library'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </FormInput>
              <FormInput label="Category" type="select" value={form.category} onChange={set('category')}>
                <option value="">Select category</option>
                {['Textbook','Reference','Novel','Journal','Magazine','Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </FormInput>
              <FormInput label="Semester" value={form.semester} onChange={set('semester')} placeholder="e.g. 3" />
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Inventory</h4>
            <div className={styles.grid3}>
              <FormInput
                label="Total Quantity" type="number" min="1"
                value={form.quantity} onChange={set('quantity')}
                error={errors.quantity} required
              />
              <FormInput
                label="Available Quantity" type="number" min="0"
                value={form.available_quantity} onChange={set('available_quantity')}
                hint="Defaults to total quantity if blank"
              />
              <FormInput
                label="Price (₹)" type="number" min="0" step="0.01"
                value={form.price} onChange={set('price')}
                placeholder="e.g. 750"
              />
            </div>
            <div className={styles.grid2}>
              <FormInput label="Location / Rack" value={form.location} onChange={set('location')} placeholder="e.g. Rack A-1" />
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Description</h4>
            <FormInput
              label="Description" type="textarea"
              value={form.description} onChange={set('description')}
              placeholder="Brief description of the book…"
              rows={3}
            />
          </div>

          <div className={styles.formActions}>
            <Button variant="ghost" type="button" onClick={() => navigate('/admin/books')}>Cancel</Button>
            <Button type="submit" loading={loading}>
              {isEdit ? 'Update Book' : 'Add Book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
