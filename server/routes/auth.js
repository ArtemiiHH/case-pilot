import { Router } from 'express'
import passport from 'passport'

const router = Router()

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, firm, info) => {
    if (err) return next(err)
    if (!firm) return res.status(401).json({ error: info?.message ?? 'Invalid credentials' })
    req.logIn(firm, (err) => {
      if (err) return next(err)
      res.json({ firm: { id: firm.id, name: firm.name, email: firm.email, logoUrl: firm.logoUrl } })
    })
  })(req, res, next)
})

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.json({ ok: true })
  })
})

router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthenticated' })
  const { id, name, email, logoUrl } = req.user
  res.json({ id, name, email, logoUrl })
})

export default router
