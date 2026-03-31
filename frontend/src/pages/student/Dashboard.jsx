import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { PageHeader, StatCard } from '../../components/common/PageHeader'
import { StatusBadge } from '../../components/common/Table'
import styles from '../admin/Dashboard.module.css'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/student').then(res => setData(res.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-enter">
      <PageHeader
        title={`Welcome, ${user?.first_name} 👋`}
        subtitle="Your library activity at a glance."
      />

      <div className={styles.statsGrid}>
        <StatCard label="Books Issued"   value={data?.stats?.issued}   icon="📚" color="blue"  loading={loading} />
        <StatCard label="Books Returned" value={data?.stats?.returned} icon="✅" color="green" loading={loading} />
        <StatCard label="Overdue"        value={data?.stats?.overdue}  icon="⚠️" color="red"   loading={loading} />
        <StatCard label="Pending Fines"  value={data?.stats?.fines ? `₹${data.stats.fines}` : '₹0'} icon="💰" color="gold" loading={loading} />
      </div>

      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <Link to="/student/books"   className={styles.actionCard}><span className={styles.actionIcon}>📚</span><span className={styles.actionLabel}>Browse Books</span></Link>
          <Link to="/student/issues"  className={styles.actionCard}><span className={styles.actionIcon}>📋</span><span className={styles.actionLabel}>My Issues</span></Link>
          <Link to="/student/profile" className={styles.actionCard}><span className={styles.actionIcon}>👤</span><span className={styles.actionLabel}>My Profile</span></Link>
        </div>
      </div>

      {/* Currently issued books */}
      <div className={styles.recentSection}>
        <div className={styles.sectionHead}>
          <h3 className={styles.sectionTitle}>Currently Issued Books</h3>
          <Link to="/student/issues" className={styles.viewAll}>View all →</Link>
        </div>
        <div className={styles.recentTable}>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className={styles.recentRow}>
                <div className="skeleton" style={{ height: 14, width: '40%' }} />
                <div className="skeleton" style={{ height: 14, width: '20%' }} />
              </div>
            ))
          ) : !data?.activeIssues?.length ? (
            <p className={styles.emptyMsg}>You have no books currently checked out.</p>
          ) : data.activeIssues.map(issue => (
            <div key={issue.id} className={styles.recentRow}>
              <div className={styles.recentBook}>
                <span className={styles.bookTitle}>{issue.book_title}</span>
                <span className={styles.borrower}>{issue.book_author} · {issue.book_number}</span>
              </div>
              <div className={styles.recentDate}>Due: {new Date(issue.due_date).toLocaleDateString()}</div>
              <StatusBadge status={new Date(issue.due_date) < new Date() ? 'overdue' : 'issued'} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
