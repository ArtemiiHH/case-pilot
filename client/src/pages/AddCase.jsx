import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createCase } from '../lib/api'
import { STAGES } from '../lib/stages'
import styles from '../styles/AddCase.module.css'

const CASE_TYPES = [
  'Immigration',
  'Personal Injury',
  'Family Law',
  'Criminal Defence',
  'Employment',
  'Real Estate',
  'Business / Commercial',
  'Estate & Probate',
  'Other',
]

export default function AddCase() {
  const [firstName,    setFirstName]    = useState('')
  const [lastName,     setLastName]     = useState('')
  const [clientEmail,  setClientEmail]  = useState('')
  const [caseType,     setCaseType]     = useState('')
  const [stage,        setStage]        = useState(STAGES[0].label)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const newCase = await createCase({
        clientName: `${firstName.trim()} ${lastName.trim()}`,
        clientEmail: clientEmail.trim(),
        caseType,
        stage,
      })
      navigate(`/cases/${newCase.id}`)
    } catch (err) {
      if (err.status === 401) { navigate('/login'); return }
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.back}>
        <Link to="/dashboard" className={styles.backLink}>← Dashboard</Link>
      </div>

      <div className={styles.card}>
        <h1 className={styles.heading}>Add Case</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <label className={styles.label}>
              First name
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={styles.input}
                required
                autoFocus
              />
            </label>
            <label className={styles.label}>
              Last name
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={styles.input}
                required
              />
            </label>
          </div>

          <label className={styles.label}>
            Client email
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            Case type
            <select
              value={caseType}
              onChange={(e) => setCaseType(e.target.value)}
              className={styles.select}
              required
            >
              <option value="" disabled>Select a type…</option>
              {CASE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            Starting stage
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className={styles.select}
            >
              {STAGES.map((s) => (
                <option key={s.label} value={s.label}>{s.label}</option>
              ))}
            </select>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <Link to="/dashboard" className={styles.cancel}>Cancel</Link>
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Creating…' : 'Create case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
