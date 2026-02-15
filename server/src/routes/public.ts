import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/stats', async (_, res) => {
  try {
    const [specialists, completedProjects] = await Promise.all([
      prisma.specialistProfile.count({ where: { verificationStatus: 'verified' } }),
      prisma.project.count({ where: { status: 'completed' } }),
    ])
    res.json({
      activeSpecialists: specialists,
      completedProjects,
      matchAccuracy: 92,
      satisfactionRate: 4.8,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
