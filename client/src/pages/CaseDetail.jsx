import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCase, updateCase } from '../lib/api'
import { STAGES } from '../lib/stages'
import { relativeTime } from '../lib/time'
import styles from '../styles/CaseDetail.module.css'

const NOTE_MAX = 300

export default function CaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caseData,       setCaseData]       = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [notFound,       setNotFound]       = useState(false)
  const [copied,         setCopied]         = useState(false)
  const [selectedStage,  setSelectedStage]  = useState('')
  const [note,           setNote]           = useState('')
  const [sending,        setSending]        = useState(false)
  const [sendError,      setSendError]      = useState('')

  function load() {
    return getCase(id)
      .then((data) => {
        setCaseData(data)
        setSelectedStage(data.stage)
      })
      .catch((err) => {
        if (err.status === 401) navigate('/login')
        else setNotFound(true)
      })
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/case/${caseData.token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSendUpdate(e) {
    e.preventDefault()
    setSendError('')
    setSending(true)
    try {
      await updateCase(id, {
        stage: selectedStage,
        note: note.trim() || undefined,
      })
      setNote('')
      await load()
    } catch (err) {
      if (err.status === 401) { navigate('/login'); return }
      setSendError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (loading)  return <div className={styles.loading}>Loading…</div>
  if (notFound) return (
    <div className={styles.notFound}>
      <p>Case not found.</p>
      <Link to="/dashboard" className={styles.notFoundLink}>Back to dashboard</Link>
    </div>
  )

  const stageColor  = STAGES.find((s) => s.label === caseData.stage)?.color ?? 'blue'
  const trackingUrl = `${window.location.origin}/case/${caseData.token}`
  const charsLeft   = NOTE_MAX - note.length

  return (
    <div className={styles.page}>
      <div className={styles.back}>
        <Link to="/dashboard" className={styles.backLink}>← Dashboard</Link>
      </div>

      <header className={styles.header}>
        <div>
          <h1 className={styles.clientName}>{caseData.clientName}</h1>
          <p className={styles.clientEmail}>{caseData.clientEmail}</p>
          <span className={styles.caseType}>{caseData.caseType}</span>
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.card}>
          <h2 className={styles.sectionLabel}>Current Stage</h2>
          <span className={`${styles.stagePill} ${styles[stageColor]}`}>
            {caseData.stage}
          </span>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionLabel}>Send Update</h2>
          <form onSubmit={handleSendUpdate} className={styles.updateForm}>
            <label className={styles.fieldLabel}>
              Stage
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className={styles.select}
              >
                {STAGES.map((s) => (
                  <option key={s.label} value={s.label}>{s.label}</option>
                ))}
              </select>
            </label>

            <label className={styles.fieldLabel}>
              Note <span className={styles.optional}>(optional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
                className={styles.textarea}
                placeholder="Add a brief note for your client…"
                rows={3}
              />
              <span className={`${styles.charCount} ${charsLeft <= 30 ? styles.charWarn : ''}`}>
                {charsLeft} characters remaining
              </span>
            </label>

            {sendError && <p className={styles.sendError}>{sendError}</p>}

            <div className={styles.formFooter}>
              <button type="submit" className={styles.sendBtn} disabled={sending}>
                {sending ? 'Sending…' : 'Send Update'}
              </button>
            </div>
          </form>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionLabel}>Client Tracking Link</h2>
          <div className={styles.linkRow}>
            <span className={styles.linkUrl}>{trackingUrl}</span>
            <button onClick={copyLink} className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionLabel}>Update History</h2>
          {caseData.updates.length === 0 ? (
            <p className={styles.empty}>No updates yet.</p>
          ) : (
            <ol className={styles.timeline}>
              {caseData.updates.map((u, i) => (
                <li key={u.id} className={`${styles.timelineItem} ${i === 0 ? styles.latest : ''}`}>
                  <div className={styles.timelineTop}>
                    <span className={styles.timelineStage}>{u.stage}</span>
                    <span className={styles.timelineTime}>{relativeTime(u.createdAt)}</span>
                  </div>
                  {u.note && <p className={styles.timelineNote}>{u.note}</p>}
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  )
}
