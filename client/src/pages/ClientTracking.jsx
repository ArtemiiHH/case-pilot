import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getClientCase } from '../lib/api'
import { STAGES } from '../lib/stages'
import { relativeTime } from '../lib/time'
import styles from '../styles/ClientTracking.module.css'

export default function ClientTracking() {
  const { token } = useParams()
  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getClientCase(token)
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [token])

  if (loading)  return <div className={styles.loading}>Loading…</div>
  if (notFound) return (
    <div className={styles.notFound}>
      <p>This tracking link could not be found.</p>
    </div>
  )

  const firstName          = data.clientName.split(' ')[0]
  const currentStageIndex  = STAGES.findIndex((s) => s.label === data.stage)
  const stageColor         = STAGES[currentStageIndex]?.color ?? 'blue'
  const latestNote         = data.updates[0]?.note ?? null

  return (
    <div className={styles.page}>
      <div className={styles.document}>
        <header className={styles.docHeader}>
          {data.firm.logoUrl ? (
            <img
              src={data.firm.logoUrl}
              alt={data.firm.name}
              className={styles.logo}
            />
          ) : (
            <div className={styles.logoPlaceholder}>{data.firm.name[0]}</div>
          )}
          <span className={styles.firmName}>{data.firm.name}</span>
        </header>

        <main className={styles.main}>
          <p className={styles.greeting}>Case Update for {firstName}</p>

          <p className={`${styles.currentStage} ${styles[stageColor]}`}>{data.stage}</p>

          <p className={styles.lastUpdated}>
            Last updated {relativeTime(data.updatedAt)}
          </p>

          {latestNote && (
            <div className={styles.noteBox}>
              <p className={styles.noteText}>{latestNote}</p>
            </div>
          )}

          <StepBar currentIndex={currentStageIndex} />

          {data.updates.length > 0 && (
            <section className={styles.history}>
              <h2 className={styles.historyLabel}>Update History</h2>
              <ol className={styles.timeline}>
                {data.updates.map((u) => (
                  <li key={u.id} className={styles.timelineItem}>
                    <div className={styles.timelineTop}>
                      <span className={styles.timelineStage}>{u.stage}</span>
                      <span className={styles.timelineTime}>{relativeTime(u.createdAt)}</span>
                    </div>
                    {u.note && <p className={styles.timelineNote}>{u.note}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

function StepBar({ currentIndex }) {
  return (
    <div className={styles.stepBar} role="list" aria-label="Case progress">
      {STAGES.map((s, i) => {
        const done    = i < currentIndex
        const current = i === currentIndex
        return (
          <div key={s.label} className={styles.stepWrapper} role="listitem">
            {i > 0 && (
              <div className={`${styles.connector} ${done || current ? styles.connectorFilled : ''}`} />
            )}
            <div className={styles.step}>
              <div className={`${styles.dot} ${done ? styles.dotDone : ''} ${current ? styles.dotCurrent : ''}`}>
                {done && <CheckIcon />}
                {current && <div className={styles.dotPulse} />}
              </div>
              <span className={`${styles.stepLabel} ${current ? styles.stepLabelActive : ''} ${!done && !current ? styles.stepLabelFuture : ''}`}>
                {s.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
      <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
