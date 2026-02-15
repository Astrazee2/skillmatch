import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware, requireRole('admin'))

router.get('/users', async (_, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        userType: true,
        createdAt: true,
        smeProfile: true,
        specialistProfile: true,
      },
    })
    res.json(users)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

router.get('/projects', async (_, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { sme: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(projects)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

router.patch('/specialists/:id/verify', async (req, res) => {
  try {
    const { status } = req.body
    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    const profile = await prisma.specialistProfile.update({
      where: { id: req.params.id },
      data: { verificationStatus: status },
    })
    res.json(profile)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to update verification' })
  }
})

router.get('/analytics', async (_, res) => {
  try {
    const [userCount, projectCount, specialistCount, openProjects] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.specialistProfile.count(),
      prisma.project.count({ where: { status: 'open' } }),
    ])
    res.json({
      totalUsers: userCount,
      totalProjects: projectCount,
      totalSpecialists: specialistCount,
      openProjects,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

export default router
