import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth.js'
import prisma from '../lib/prisma.js'
import { generateToken } from '../lib/tokens.js'
import { sendCaseCreatedEmail, sendCaseUpdatedEmail } from '../lib/email.js'

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const cases = await prisma.case.findMany({
      where: { firmId: req.user.id },
      orderBy: { updatedAt: 'asc' },
    })
    res.json(cases)
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { clientName, clientEmail, caseType, stage } = req.body
    const token = generateToken()

    const newCase = await prisma.case.create({
      data: {
        clientName,
        clientEmail,
        caseType,
        stage: stage ?? 'Case Opened',
        token,
        firmId: req.user.id,
      },
    })

    await prisma.update.create({
      data: { stage: newCase.stage, caseId: newCase.id },
    })

    const trackingUrl = `${process.env.CLIENT_URL}/case/${token}`
    const [firstName] = clientName.split(' ')
    await sendCaseCreatedEmail({
      firmName: req.user.name,
      firmEmail: req.user.email,
      clientEmail,
      clientFirstName: firstName,
      trackingUrl,
    }).catch((err) => console.error('Failed to send case-created email:', err))

    res.status(201).json(newCase)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const caseRecord = await prisma.case.findUnique({
      where: { id: req.params.id },
      include: { updates: { orderBy: { createdAt: 'desc' } } },
    })
    if (!caseRecord || caseRecord.firmId !== req.user.id) {
      return res.status(404).json({ error: 'Not found' })
    }
    res.json(caseRecord)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.case.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.firmId !== req.user.id) {
      return res.status(404).json({ error: 'Not found' })
    }

    const { stage, note } = req.body
    const updated = await prisma.case.update({
      where: { id: req.params.id },
      data: { stage, updatedAt: new Date() },
    })

    await prisma.update.create({
      data: { stage, note: note ?? null, caseId: updated.id },
    })

    const trackingUrl = `${process.env.CLIENT_URL}/case/${existing.token}`
    const [firstName] = existing.clientName.split(' ')
    await sendCaseUpdatedEmail({
      firmName: req.user.name,
      firmEmail: req.user.email,
      clientEmail: existing.clientEmail,
      clientFirstName: firstName,
      newStage: stage,
      note: note ?? null,
      trackingUrl,
    }).catch((err) => console.error('Failed to send case-updated email:', err))

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

export default router
