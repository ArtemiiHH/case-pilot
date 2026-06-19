export function relativeTime(date) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours   = Math.floor(diff / 3_600_000)
  const days    = Math.floor(diff / 86_400_000)

  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours   < 24) return `${hours}h ago`
  if (days    < 7)  return `${days}d ago`
  if (days    < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(date).toLocaleDateString()
}

export function isStale(date) {
  return Date.now() - new Date(date).getTime() > 7 * 24 * 60 * 60 * 1000
}
