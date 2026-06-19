import { useEffect } from 'react'
import styles from '../styles/Toast.module.css'

export default function Toast({ message, onDismiss, duration = 2500 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [message, onDismiss, duration])

  if (!message) return null

  return <div className={styles.toast}>{message}</div>
}
