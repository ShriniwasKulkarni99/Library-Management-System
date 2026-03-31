import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { resolveProfileImageUrl } from '../../utils/media'
import styles from './DashboardLayout.module.css'

const ADMIN_NAV = [
  { to: '/admin',          label: 'Dashboard',     icon: '⬛' },
  { to: '/admin/books',    label: 'Books',          icon: '📚' },
  { to: '/admin/issues',   label: 'Book Issues',    icon: '📋' },
  { to: '/admin/students', label: 'Students',       icon: '🎓' },
  { to: '/admin/staff',    label: 'Staff',          icon: '👤' },
  { to: '/admin/register', label: 'Add User',       icon: '➕' },
]

const STUDENT_NAV = [
  { to: '/student',         label: 'Dashboard',     icon: '⬛' },
  { to: '/student/books',   label: 'Browse Books',  icon: '📚' },
  { to: '/student/issues',  label: 'My Books',      icon: '📋' },
  { to: '/student/profile', label: 'My Profile',    icon: '👤' },
]

const STAFF_NAV = [
  { to: '/staff',           label: 'Dashboard',     icon: '⬛' },
  { to: '/staff/books',     label: 'Browse Books',  icon: '📚' },
  { to: '/staff/issues',    label: 'My Books',      icon: '📋' },
  { to: '/staff/profile',   label: 'My Profile',    icon: '👤' },
]

const NAV_MAP = { admin: ADMIN_NAV, student: STUDENT_NAV, staff: STAFF_NAV }

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = NAV_MAP[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabel = { admin: 'Administrator', student: 'Student', staff: 'Staff Member' }[user?.role]
  const initials = user ? `${user.first_name[0]}${user.last_name[0]}` : '?'
  const avatarSrc = resolveProfileImageUrl(user?.profile_image)

  return (
    <div className={`${styles.layout} ${collapsed ? styles.collapsed : ''}`}>
      {/* Mobile overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📖</div>
          {!collapsed && <span className={styles.logoText}>LibraryMS</span>}
        </div>

        {/* User pill */}
        <div className={styles.userPill}>
          {avatarSrc
            ? <img src={avatarSrc} alt={`${user?.first_name || 'User'} profile`} className={styles.avatarImage} />
            : <div className={styles.avatar}>{initials}</div>
          }
          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.first_name} {user?.last_name}</span>
              <span className={styles.userRole}>{roleLabel}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className={styles.sidebarBottom}>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span>{collapsed ? '→' : '←'}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span>⏻</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setMobileOpen(o => !o)}>
            ☰
          </button>
          <div className={styles.topbarRight}>
            <span className={styles.topbarRole}>{roleLabel}</span>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
