import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getMe } from '../lib/api'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading') // 'loading' | 'auth' | 'unauth'

  useEffect(() => {
    getMe()
      .then(() => setStatus('auth'))
      .catch(() => setStatus('unauth'))
  }, [])

  if (status === 'loading') return null
  if (status === 'unauth') return <Navigate to="/login" replace />
  return children
}
