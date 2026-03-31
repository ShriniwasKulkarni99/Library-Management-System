import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: 'var(--font-sans)',
          fontSize: '0.9rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-ink-08)',
        },
        success: { iconTheme: { primary: 'var(--color-green)', secondary: '#fff' } },
        error:   { iconTheme: { primary: 'var(--color-accent)', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>,
)
