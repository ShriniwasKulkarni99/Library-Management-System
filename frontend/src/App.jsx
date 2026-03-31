import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute, RoleGuard } from './routes/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

// Auth
import LoginPage from './pages/auth/Login'

// Admin pages
import AdminDashboard  from './pages/admin/Dashboard'
import BooksPage       from './pages/admin/BooksPage'
import BookFormPage    from './pages/admin/BookFormPage'
import IssuesPage      from './pages/admin/IssuesPage'
import IssueBookPage   from './pages/admin/IssueBookPage'
import UsersListPage   from './pages/admin/UsersListPage'
import RegisterPage    from './pages/admin/RegisterPage'
import ProfilePage     from './pages/admin/ProfilePage'
import UserDetailPage  from './pages/admin/UserDetailPage'

// Student pages
import StudentDashboard  from './pages/student/Dashboard'
import StudentBooksPage  from './pages/student/BooksPage'
import MyIssuesPage      from './pages/student/MyIssuesPage'

// Staff pages
import StaffDashboard from './pages/staff/Dashboard'

// Shared
import NotFoundPage from './pages/NotFound'

function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <RoleGuard roles={['admin']}>
        <DashboardLayout>{children}</DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  )
}

function StudentLayout({ children }) {
  return (
    <ProtectedRoute>
      <RoleGuard roles={['student']}>
        <DashboardLayout>{children}</DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  )
}

function StaffLayout({ children }) {
  return (
    <ProtectedRoute>
      <RoleGuard roles={['staff']}>
        <DashboardLayout>{children}</DashboardLayout>
      </RoleGuard>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/"      element={<Navigate to="/login" replace />} />

          {/* ── Admin ─────────────────────────────────── */}
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/books"         element={<AdminLayout><BooksPage /></AdminLayout>} />
          <Route path="/admin/books/new"     element={<AdminLayout><BookFormPage /></AdminLayout>} />
          <Route path="/admin/books/:id/edit"element={<AdminLayout><BookFormPage /></AdminLayout>} />
          <Route path="/admin/issues"        element={<AdminLayout><IssuesPage /></AdminLayout>} />
          <Route path="/admin/issues/new"    element={<AdminLayout><IssueBookPage /></AdminLayout>} />
          <Route path="/admin/students"      element={<AdminLayout><UsersListPage role="student" /></AdminLayout>} />
          <Route path="/admin/staff"         element={<AdminLayout><UsersListPage role="staff" /></AdminLayout>} />
          <Route path="/admin/users/:id"     element={<AdminLayout><UserDetailPage /></AdminLayout>} />
          <Route path="/admin/register"      element={<AdminLayout><RegisterPage /></AdminLayout>} />
          <Route path="/admin/profile"       element={<AdminLayout><ProfilePage /></AdminLayout>} />

          {/* ── Student ───────────────────────────────── */}
          <Route path="/student"         element={<StudentLayout><StudentDashboard /></StudentLayout>} />
          <Route path="/student/books"   element={<StudentLayout><StudentBooksPage /></StudentLayout>} />
          <Route path="/student/issues"  element={<StudentLayout><MyIssuesPage /></StudentLayout>} />
          <Route path="/student/profile" element={<StudentLayout><ProfilePage /></StudentLayout>} />

          {/* ── Staff ─────────────────────────────────── */}
          <Route path="/staff"           element={<StaffLayout><StaffDashboard /></StaffLayout>} />
          <Route path="/staff/books"     element={<StaffLayout><StudentBooksPage /></StaffLayout>} />
          <Route path="/staff/issues"    element={<StaffLayout><MyIssuesPage /></StaffLayout>} />
          <Route path="/staff/profile"   element={<StaffLayout><ProfilePage /></StaffLayout>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
