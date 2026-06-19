import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCases, logout } from '../lib/api'
import { STAGES } from '../lib/stages'
import { relativeTime, isStale } from '../lib/time'
import styles from '../styles/Dashboard.module.css'

export default function Dashboard() {
  const [cases,   setCases]   = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getCases()
      .then(setCases)
      .catch((err) => { if (err.status === 401) navigate('/login') })
      .finally(() => setLoading(false))
  }, [navigate])

  async function handleLogout() {
    await logout().catch(() => {})
    navigate('/login')
  }

  if (loading) {
    return <div className={styles.loading}>Loading…</div>
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Cases</h1>
        <div className={styles.headerActions}>
          <Link to="/settings" className={styles.navLink}>Settings</Link>
          <button onClick={handleLogout} className={styles.navLink}>Logout</button>
          <Link to="/add-case" className={styles.addBtn}>Add Case</Link>
        </div>
      </header>

      {cases.length === 0 ? (
        <EmptyState />
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Case Type</th>
              <th>Stage</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr
                key={c.id}
                className={isStale(c.updatedAt) ? styles.stale : undefined}
                onClick={() => navigate(`/cases/${c.id}`)}
              >
                <td className={styles.clientName}>{c.clientName}</td>
                <td>{c.caseType}</td>
                <td><StagePill stage={c.stage} /></td>
                <td className={styles.timestamp}>{relativeTime(c.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function StagePill({ stage }) {
  const stageInfo = STAGES.find((s) => s.label === stage)
  const color = stageInfo?.color ?? 'blue'
  return (
    <span className={`${styles.pill} ${styles[color]}`}>{stage}</span>
  )
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyText}>No cases yet.</p>
      <p className={styles.emptyHint}>Add your first case to start keeping clients informed.</p>
      <Link to="/add-case" className={styles.addBtn}>Add your first case</Link>
    </div>
  )
}
