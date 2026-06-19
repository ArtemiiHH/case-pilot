async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    const e = new Error(err.error ?? res.statusText)
    e.status = res.status
    throw e
  }
  return res.json()
}

export const api = {
  get:   (path)       => request('GET',   path),
  post:  (path, body) => request('POST',  path, body),
  patch: (path, body) => request('PATCH', path, body),
}

export const getMe      = ()           => api.get('/auth/me')
export const login      = (email, pw)  => api.post('/auth/login', { email, password: pw })
export const logout     = ()           => api.post('/auth/logout')
export const getCases   = ()           => api.get('/cases')
export const getCase    = (id)         => api.get(`/cases/${id}`)
export const createCase = (data)       => api.post('/cases', data)
export const updateCase = (id, data)   => api.patch(`/cases/${id}`, data)
export const getClientCase = (token)   => api.get(`/case/${token}`)
export const saveSettings  = (form)    => request('PATCH', '/firms/settings', form)
export const changePassword = (data)   => api.patch('/firms/password', data)
