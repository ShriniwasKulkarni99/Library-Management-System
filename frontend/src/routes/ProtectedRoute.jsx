import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Spinner used while auth loads
function AuthSpinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--color-bg)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid var(--color-ink-20)', borderTopColor:'var(--color-accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto' }} />
        <p style={{ marginTop:16, color:'var(--color-ink-50)', fontFamily:'var(--font-sans)' }}>Loading…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

/**
 * Redirects to /login if not authenticated
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthSpinner />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

/**
 * Redirects to role dashboard if wrong role
 */
export function RoleGuard({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <AuthSpinner />

  if (!user || !roles.includes(user.role)) {
    const home = user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/student'
    return <Navigate to={home} replace />
  }

  return children
}
