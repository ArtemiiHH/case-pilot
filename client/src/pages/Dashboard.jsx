import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { getCases } from '../lib/api'
import { STAGES } from '../lib/stages'
import { relativeTime, isStale } from '../lib/time'
import DashboardLayout from '../components/DashboardLayout'
import styles from '../styles/Dashboard.module.css'

const RESOLVED_STAGE = 'Resolved / Closed'

function filterFromPath(pathname) {
  if (pathname.endsWith('/active'))   return 'active'
  if (pathname.endsWith('/resolved')) return 'resolved'
  return 'all'
}

export default function Dashboard() {
  const [cases,   setCases]   = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    getCases()
      .then(setCases)
      .catch((err) => { if (err.status === 401) navigate('/login') })
      .finally(() => setLoading(false))
  }, [navigate])

  const filter = filterFromPath(pathname)
  const visibleCases = cases.filter((c) => {
    if (filter === 'active')   return c.stage !== RESOLVED_STAGE
    if (filter === 'resolved') return c.stage === RESOLVED_STAGE
    return true
  })

  return (
    <DashboardLayout>
      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : visibleCases.length === 0 ? (
        <EmptyState filter={filter} hasAnyCases={cases.length > 0} />
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
            {visibleCases.map((c) => (
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
    </DashboardLayout>
  )
}

function StagePill({ stage }) {
  const stageInfo = STAGES.find((s) => s.label === stage)
  const color = stageInfo?.color ?? 'blue'
  return (
    <span className={`${styles.pill} ${styles[color]}`}>{stage}</span>
  )
}

function EmptyState({ filter, hasAnyCases }) {
  if (filter !== 'all' && hasAnyCases) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>
          {filter === 'active' ? 'No active cases.' : 'No resolved cases yet.'}
        </p>
        <Link to="/dashboard" className={styles.addBtn}>View all cases</Link>
      </div>
    )
  }

  return (
    <div className={styles.empty}>
      <p className={styles.emptyText}>No cases yet.</p>
      <p className={styles.emptyHint}>Add your first case to start keeping clients informed.</p>
      <Link to="/add-case" className={styles.addBtn}>Add your first case</Link>
    </div>
  )
}
