import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import prisma from '../lib/prisma.js'
import bcrypt from 'bcrypt'
import multer from 'multer'
import path from 'path'

const router = Router()

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `logo-${Date.now()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/png', 'image/jpeg'].includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only PNG and JPG files are allowed'))
  },
})

router.patch('/settings', requireAuth, upload.single('logo'), async (req, res, next) => {
  try {
    const data = {}
    if (req.body.name) data.name = req.body.name
    if (req.file) data.logoUrl = `/uploads/${req.file.filename}`

    const firm = await prisma.firm.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, logoUrl: true },
    })
    res.json(firm)
  } catch (err) {
    next(err)
  }
})

router.patch('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const firm = await prisma.firm.findUnique({ where: { id: req.user.id } })
    const match = await bcrypt.compare(currentPassword, firm.password)
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' })

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.firm.update({ where: { id: req.user.id }, data: { password: hashed } })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
