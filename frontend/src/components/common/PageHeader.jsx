import styles from './PageHeader.module.css'

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon, color = 'default', loading }) {
  return (
    <div className={`${styles.stat} ${styles[`stat_${color}`]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statBody}>
        {loading
          ? <div className="skeleton" style={{ height: 28, width: 60, marginBottom: 6 }} />
          : <div className={styles.statValue}>{value ?? '—'}</div>
        }
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  )
}
