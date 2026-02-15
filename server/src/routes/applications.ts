import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post('/', authMiddleware, requireRole('specialist'), async (req: any, res) => {
  try {
    const { projectId, proposalText, quotedPrice } = req.body
    if (!projectId || !proposalText) return res.status(400).json({ error: 'Project ID and proposal required' })
    const specialist = await prisma.specialistProfile.findUnique({ where: { userId: req.user.userId } })
    if (!specialist) return res.status(404).json({ error: 'Specialist profile not found' })
    const existing = await prisma.application.findFirst({
      where: { projectId, specialistId: specialist.id },
    })
    if (existing) return res.status(400).json({ error: 'Already applied to this project' })
    const application = await prisma.application.create({
      data: {
        projectId,
        specialistId: specialist.id,
        proposalText,
        quotedPrice: quotedPrice != null ? Number(quotedPrice) : null,
      },
    })
    res.status(201).json(application)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to submit application' })
  }
})

router.get('/my-applications', authMiddleware, requireRole('specialist'), async (req: any, res) => {
  try {
    const specialist = await prisma.specialistProfile.findUnique({ where: { userId: req.user.userId } })
    if (!specialist) return res.status(404).json({ error: 'Specialist profile not found' })
    const applications = await prisma.application.findMany({
      where: { specialistId: specialist.id },
      include: { project: { include: { sme: { select: { userId: true, companyName: true } } } } },
      orderBy: { appliedAt: 'desc' },
    })
    res.json(applications)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch applications' })
  }
})

router.patch('/:id/status', authMiddleware, requireRole('sme'), async (req: any, res) => {
  try {
    const { status } = req.body
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    const sme = await prisma.sMEProfile.findUnique({ where: { userId: req.user.userId } })
    if (!sme) return res.status(404).json({ error: 'SME profile not found' })
    const app = await prisma.application.findFirst({
      where: { id: req.params.id },
      include: { project: true },
    })
    if (!app || app.project.smeId !== sme.id) return res.status(404).json({ error: 'Application not found' })
    const [updated] = await prisma.$transaction([
      prisma.application.update({
        where: { id: req.params.id },
        data: { status },
      }),
      ...(status === 'accepted'
        ? [
            prisma.application.updateMany({
              where: {
                projectId: app.projectId,
                id: { not: req.params.id },
              },
              data: { status: 'rejected' },
            }),
            prisma.project.update({
              where: { id: app.projectId },
              data: { status: 'in_progress' },
            }),
          ]
        : []),
    ])
    res.json(updated)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to update application' })
  }
})

export default router
