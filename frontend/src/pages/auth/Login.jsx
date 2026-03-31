import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/common/Button'
import FormInput from '../../components/common/FormInput'
import styles from './Login.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [mode, setMode] = useState('signin')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    enrollment_id: '',
    phone: '',
    address: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const ROLE_DEFAULTS = {
    admin:   { email: 'admin@library.com',   password: 'Password@123' },
    student: { email: 'student1@library.com', password: 'Password@123' },
    staff:   { email: 'staff1@library.com',   password: 'Password@123' },
  }

  const validateLogin = () => {
    const errs = {}
    if (!loginForm.email) errs.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errs.email = 'Enter a valid email.'
    if (!loginForm.password) errs.password = 'Password is required.'
    return errs
  }

  const validateSignup = () => {
    const errs = {}
    if (!signupForm.first_name.trim()) errs.first_name = 'First name is required.'
    if (!signupForm.last_name.trim()) errs.last_name = 'Last name is required.'
    if (!signupForm.email.trim()) errs.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) errs.email = 'Enter a valid email.'
    if (signupForm.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    else if (!/[A-Z]/.test(signupForm.password)) errs.password = 'Password must contain an uppercase letter.'
    else if (!/[0-9]/.test(signupForm.password)) errs.password = 'Password must contain a number.'
    return errs
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    const errs = validateLogin()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const user = await login(loginForm.email, loginForm.password)
      toast.success(`Welcome back, ${user.first_name}!`)
      const from = location.state?.from?.pathname
      if (from && from !== '/login') { navigate(from, { replace: true }); return }
      if (user.role === 'admin')   navigate('/admin',   { replace: true })
      else if (user.role === 'staff')  navigate('/staff',  { replace: true })
      else navigate('/student', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
      toast.error(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    const errs = validateSignup()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await api.post('/auth/signup', signupForm)
      toast.success('Account created. Please sign in.')
      setLoginForm({ email: signupForm.email, password: signupForm.password })
      setMode('signin')
      setErrors({})
    } catch (err) {
      const msg = err.response?.data?.message || 'Sign up failed.'
      toast.error(msg)
      if (err.response?.data?.errors) {
        const nextErrors = {}
        err.response.data.errors.forEach(error => { nextErrors[error.field] = error.message })
        setErrors(nextErrors)
      } else {
        setErrors({ general: msg })
      }
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setErrors({})
  }

  return (
    <div className={styles.page}>
      {/* Left panel – decorative */}
      <div className={styles.panel}>
        <div className={styles.panelContent}>
          <div className={styles.panelLogo}>📖</div>
          <h1 className={styles.panelTitle}>LibraryMS</h1>
          <p className={styles.panelTagline}>
            A modern library management system for institutions that value knowledge.
          </p>
          <div className={styles.panelQuote}>
            <blockquote>
              "A library is not a luxury but one of the necessities of life."
            </blockquote>
            <cite>— Henry Ward Beecher</cite>
          </div>
          {/* Demo credentials */}
          <div className={styles.demoSection}>
            <p className={styles.demoTitle}>Demo accounts</p>
            {Object.entries(ROLE_DEFAULTS).map(([role, creds]) => (
              <button
                key={role}
                className={styles.demoBtn}
                onClick={() => {
                  setMode('signin')
                  setErrors({})
                  setLoginForm({ email: creds.email, password: creds.password })
                }}
              >
                <span className={styles.demoBadge}>{role}</span>
                <span>{creds.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.switcher}>
            <button
              type="button"
              className={`${styles.switchBtn} ${mode === 'signin' ? styles.switchBtnActive : ''}`}
              onClick={() => switchMode('signin')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`${styles.switchBtn} ${mode === 'signup' ? styles.switchBtnActive : ''}`}
              onClick={() => switchMode('signup')}
            >
              Sign up
            </button>
          </div>

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
            <p className={styles.formSubtitle}>
              {mode === 'signin' ? 'Access your library account' : 'Register as a student or staff member'}
            </p>
          </div>

          {errors.general && (
            <div className={styles.errorAlert}>{errors.general}</div>
          )}

          {mode === 'signin' ? (
            <>
              <form onSubmit={handleSignIn} className={styles.form} noValidate>
                <FormInput
                  label="Email address"
                  type="email"
                  value={loginForm.email}
                  onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                  error={errors.email}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
                <FormInput
                  label="Password"
                  type="password"
                  value={loginForm.password}
                  onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                  error={errors.password}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <Button type="submit" fullWidth loading={loading} size="lg">
                  Sign in
                </Button>
              </form>

              <p className={styles.formNote}>
                New here? <button type="button" className={styles.inlineLink} onClick={() => switchMode('signup')}>Create an account</button>
              </p>
            </>
          ) : (
            <>
              <form onSubmit={handleSignUp} className={styles.form} noValidate>
                <div className={styles.grid2}>
                  <FormInput
                    label="First name"
                    value={signupForm.first_name}
                    onChange={e => setSignupForm(f => ({ ...f, first_name: e.target.value }))}
                    error={errors.first_name}
                    required
                  />
                  <FormInput
                    label="Last name"
                    value={signupForm.last_name}
                    onChange={e => setSignupForm(f => ({ ...f, last_name: e.target.value }))}
                    error={errors.last_name}
                    required
                  />
                </div>
                <FormInput
                  label="Role"
                  type="select"
                  value={signupForm.role}
                  onChange={e => setSignupForm(f => ({ ...f, role: e.target.value }))}
                  required
                >
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </FormInput>
                <FormInput
                  label="Email address"
                  type="email"
                  value={signupForm.email}
                  onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
                  error={errors.email}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
                <div className={styles.grid2}>
                  <FormInput
                    label="Department"
                    type="select"
                    value={signupForm.department}
                    onChange={e => setSignupForm(f => ({ ...f, department: e.target.value }))}
                  >
                    <option value="">Select department</option>
                    {['Computer Science','Information Technology','Electronics','Mechanical','Civil','General','Administration','Library'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </FormInput>
                  <FormInput
                    label={signupForm.role === 'student' ? 'Enrollment number' : 'Employee ID'}
                    value={signupForm.enrollment_id}
                    onChange={e => setSignupForm(f => ({ ...f, enrollment_id: e.target.value }))}
                    placeholder={signupForm.role === 'student' ? 'CS-2024-001' : 'EMP-2024-001'}
                  />
                </div>
                <FormInput
                  label="Phone"
                  type="tel"
                  value={signupForm.phone}
                  onChange={e => setSignupForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="9876543210"
                  error={errors.phone}
                />
                <FormInput
                  label="Address"
                  type="textarea"
                  value={signupForm.address}
                  onChange={e => setSignupForm(f => ({ ...f, address: e.target.value }))}
                  rows={2}
                />
                <FormInput
                  label="Password"
                  type="password"
                  value={signupForm.password}
                  onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                  error={errors.password}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  required
                  autoComplete="new-password"
                />
                <Button type="submit" fullWidth loading={loading} size="lg">
                  Create account
                </Button>
              </form>

              <p className={styles.formNote}>
                Already have an account? <button type="button" className={styles.inlineLink} onClick={() => switchMode('signin')}>Sign in</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
