import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getMe, saveSettings, changePassword } from '../lib/api'
import Toast from '../components/Toast'
import styles from '../styles/Settings.module.css'

const MAX_LOGO_BYTES = 2 * 1024 * 1024

export default function Settings() {
  const navigate = useNavigate()
  const logoInputRef = useRef(null)
  const [firm,    setFirm]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast,   setToast]   = useState('')

  const [name,          setName]          = useState('')
  const [logoFile,      setLogoFile]      = useState(null)
  const [logoPreview,   setLogoPreview]   = useState(null)
  const [detailsError,  setDetailsError]  = useState('')
  const [savingDetails, setSavingDetails] = useState(false)

  const [currentPassword,  setCurrentPassword]  = useState('')
  const [newPassword,      setNewPassword]      = useState('')
  const [confirmPassword,  setConfirmPassword]  = useState('')
  const [passwordError,    setPasswordError]    = useState('')
  const [savingPassword,   setSavingPassword]   = useState(false)

  useEffect(() => {
    getMe()
      .then((data) => {
        setFirm(data)
        setName(data.name)
      })
      .catch((err) => { if (err.status === 401) navigate('/login') })
      .finally(() => setLoading(false))
  }, [navigate])

  function handleLogoChange(e) {
    const file = e.target.files[0]
    setDetailsError('')
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setDetailsError('Only PNG and JPG files are allowed.')
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      setDetailsError('Logo must be under 2MB.')
      return
    }
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSaveDetails(e) {
    e.preventDefault()
    setDetailsError('')
    setSavingDetails(true)
    try {
      const form = new FormData()
      form.append('name', name)
      if (logoFile) form.append('logo', logoFile)
      const updated = await saveSettings(form)
      setFirm(updated)
      setLogoFile(null)
      setToast('Firm details saved')
    } catch (err) {
      if (err.status === 401) { navigate('/login'); return }
      setDetailsError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSavingDetails(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    setSavingPassword(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setToast('Password updated')
    } catch (err) {
      if (err.status === 401) { navigate('/login'); return }
      setPasswordError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) return <div className={styles.loading}>Loading…</div>

  return (
    <div className={styles.page}>
      <div className={styles.back}>
        <Link to="/dashboard" className={styles.backLink}>← Dashboard</Link>
      </div>

      <h1 className={styles.heading}>Settings</h1>

      <section className={styles.card}>
        <h2 className={styles.sectionLabel}>Your Firm Details</h2>
        <form onSubmit={handleSaveDetails} className={styles.form}>
          <label className={styles.fieldLabel}>
            Firm name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </label>

          <label className={styles.fieldLabel}>
            Logo
            <div className={styles.logoUpload}>
              <div className={styles.logoPreviewWrap}>
                {(logoPreview || firm.logoUrl) ? (
                  <img
                    src={logoPreview || firm.logoUrl}
                    alt="Firm logo"
                    className={styles.logoPreview}
                  />
                ) : (
                  <span className={styles.logoPlaceholder}>No logo</span>
                )}
              </div>
              <div className={styles.logoUploadControls}>
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoFile || firm.logoUrl ? 'Change logo' : 'Upload logo'}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleLogoChange}
                  className={styles.hiddenFileInput}
                />
                <span className={styles.hint}>
                  {logoFile ? logoFile.name : 'PNG or JPG, max 2MB'}
                </span>
              </div>
            </div>
          </label>

          {detailsError && <p className={styles.error}>{detailsError}</p>}

          <p className={styles.hint}>This information will be displayed on the tracking page your clients receive.</p>

          <div className={styles.formFooter}>
            <button type="submit" className={styles.btn} disabled={savingDetails}>
              {savingDetails ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionLabel}>Change Password</h2>
        <form onSubmit={handleChangePassword} className={styles.form}>
          <label className={styles.fieldLabel}>
            Current password
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={styles.input}
              autoComplete="current-password"
              required
            />
          </label>

          <label className={styles.fieldLabel}>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label className={styles.fieldLabel}>
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          {passwordError && <p className={styles.error}>{passwordError}</p>}

          <div className={styles.formFooter}>
            <button type="submit" className={styles.btn} disabled={savingPassword}>
              {savingPassword ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>

      <Toast message={toast} onDismiss={() => setToast('')} />
    </div>
  )
}
