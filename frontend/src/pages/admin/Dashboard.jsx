import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, StatCard } from '../../components/common/PageHeader'
import { StatusBadge } from '../../components/common/Table'
import styles from './Dashboard.module.css'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats]   = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/admin').then(res => {
      setStats(res.data.stats)
      setRecent(res.data.recentIssues)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-enter">
      <PageHeader
        title={`Good day, ${user?.first_name} 👋`}
        subtitle="Here's what's happening in the library today."
      />

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Books"    value={stats?.totalBooks}     icon="📚" color="blue"  loading={loading} />
        <StatCard label="Available"      value={stats?.availableBooks} icon="✅" color="green" loading={loading} />
        <StatCard label="Issued"         value={stats?.issuedBooks}    icon="📋" color="gold"  loading={loading} />
        <StatCard label="Overdue"        value={stats?.overdueBooks}   icon="⚠️" color="red"   loading={loading} />
        <StatCard label="Total Students" value={stats?.totalStudents}  icon="🎓" color="blue"  loading={loading} />
        <StatCard label="Total Staff"    value={stats?.totalStaff}     icon="👤" color="default" loading={loading} />
      </div>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionGrid}>
          {[
            { to: '/admin/books/new', label: 'Add Book',       icon: '📗' },
            { to: '/admin/issues/new', label: 'Issue Book',    icon: '📤' },
            { to: '/admin/register',   label: 'Add User',      icon: '➕' },
            { to: '/admin/issues',     label: 'View All Issues', icon: '📋' },
          ].map(a => (
            <Link key={a.to} to={a.to} className={styles.actionCard}>
              <span className={styles.actionIcon}>{a.icon}</span>
              <span className={styles.actionLabel}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent issues table */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>Recent Issues</h3>
          <Link to="/admin/issues" className={styles.viewAll}>View all →</Link>
        </div>
        <div className={styles.recentTable}>
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className={styles.recentRow}>
                <div className="skeleton" style={{ height: 14, width: '40%' }} />
                <div className="skeleton" style={{ height: 14, width: '20%' }} />
                <div className="skeleton" style={{ height: 14, width: '15%' }} />
              </div>
            ))
          ) : recent.length === 0 ? (
            <p className={styles.emptyMsg}>No issues yet.</p>
          ) : recent.map(issue => (
            <div key={issue.id} className={styles.recentRow}>
              <div className={styles.recentBook}>
                <span className={styles.bookTitle}>{issue.book_title}</span>
                <span className={styles.borrower}>{issue.first_name} {issue.last_name}</span>
              </div>
              <div className={styles.recentDate}>
                Due: {new Date(issue.due_date).toLocaleDateString()}
              </div>
              <StatusBadge status={
                issue.status === 'issued' && new Date(issue.due_date) < new Date()
                  ? 'overdue' : issue.status
              } />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
