import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { getMe, logout } from '../lib/api'
import styles from '../styles/DashboardLayout.module.css'

function sideLinkClass({ isActive }) {
  return `${styles.sideLink} ${isActive ? styles.sideLinkActive : ''}`
}

export default function DashboardLayout({ children }) {
  const [firm, setFirm] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getMe().then(setFirm).catch(() => {})
  }, [])

  async function handleLogout() {
    await logout().catch(() => {})
    navigate('/login')
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logoPlaceholder}>CasePilot</span>
        </div>
        <div className={styles.headerActions}>
          <Link to="/settings" className={styles.navLink}>Settings</Link>
          <button onClick={handleLogout} className={styles.navLink}>Logout</button>
          <Link to="/add-case" className={styles.addBtn}>Add Case</Link>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.sidebar}>
          <NavLink to="/dashboard" end className={sideLinkClass}>All Cases</NavLink>
          <NavLink to="/dashboard/active" className={sideLinkClass}>Active Cases</NavLink>
          <NavLink to="/dashboard/resolved" className={sideLinkClass}>Resolved</NavLink>
          <Link to="/settings" className={styles.sideLinkBottom}>
            {firm?.logoUrl ? (
              <img src={firm.logoUrl} alt={firm.name} className={styles.sideLogo} />
            ) : (
              <span className={styles.sideLogoPlaceholder}>{firm?.name?.[0] ?? 'F'}</span>
            )}
            <span>Settings</span>
          </Link>
        </nav>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
