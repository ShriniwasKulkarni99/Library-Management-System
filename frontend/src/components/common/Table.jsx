import styles from './Table.module.css'

export function Table({ columns, data, loading, emptyMessage = 'No records found.' }) {
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>{columns.map(col => <th key={col.key}>{col.label}</th>)}</tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}><div className={`skeleton ${styles.skelCell}`} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className={styles.empty}>
        <span>📂</span>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ width: col.width }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null

  const { page, pages, total, limit } = pagination
  const from = (page - 1) * limit + 1
  const to   = Math.min(page * limit, total)

  const getPages = () => {
    const arr = []
    const delta = 2
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        arr.push(i)
      } else if (arr[arr.length - 1] !== '…') {
        arr.push('…')
      }
    }
    return arr
  }

  return (
    <div className={styles.pagination}>
      <span className={styles.paginationInfo}>
        Showing {from}–{to} of {total}
      </span>
      <div className={styles.paginationControls}>
        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >←</button>

        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
          ) : (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
              onClick={() => onPageChange(p)}
            >{p}</button>
          )
        )}

        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
        >→</button>
      </div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    issued:   { label: 'Issued',   cls: 'blue' },
    returned: { label: 'Returned', cls: 'green' },
    overdue:  { label: 'Overdue',  cls: 'red' },
    active:   { label: 'Active',   cls: 'green' },
    inactive: { label: 'Inactive', cls: 'red' },
  }
  const info = map[status] || { label: status, cls: 'default' }
  return <span className={`${styles.badge} ${styles[`badge_${info.cls}`]}`}>{info.label}</span>
}
