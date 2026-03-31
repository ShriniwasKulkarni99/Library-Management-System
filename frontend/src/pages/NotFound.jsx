import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './NotFound.module.css'

export default function NotFoundPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const home = user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : user ? '/student' : '/login'

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.text}>The page you're looking for doesn't exist or has been moved.</p>
        <div className={styles.actions}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>← Go back</button>
          <Link to={home} className={styles.homeBtn}>Go to dashboard</Link>
        </div>
      </div>
    </div>
  )
}
