import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (_, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'open' },
      include: { sme: { include: { user: { select: { email: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(projects)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

router.get('/sme/my-projects', authMiddleware, requireRole('sme'), async (req: any, res) => {
  try {
    const sme = await prisma.sMEProfile.findUnique({ where: { userId: req.user.userId } })
    if (!sme) return res.status(404).json({ error: 'SME profile not found' })
    const projects = await prisma.project.findMany({
      where: { smeId: sme.id },
      include: { applications: { include: { specialist: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(projects)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        sme: { include: { user: { select: { email: true } } } },
        applications: { include: { specialist: true } },
      },
    })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
})

router.post('/', authMiddleware, requireRole('sme'), async (req: any, res) => {
  try {
    const { title, description, category, budgetMin, budgetMax, deadline, requiredSkills } = req.body
    if (!title || !description || !category || budgetMin == null || budgetMax == null || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const sme = await prisma.sMEProfile.findUnique({ where: { userId: req.user.userId } })
    if (!sme) return res.status(404).json({ error: 'SME profile not found' })
    const project = await prisma.project.create({
      data: {
        smeId: sme.id,
        title,
        description,
        category,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        deadline: new Date(deadline),
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      },
    })
    res.status(201).json(project)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

const VALID_PROJECT_STATUSES = ['open', 'in_progress', 'completed', 'cancelled'] as const

router.patch('/:id/status', authMiddleware, requireRole('sme'), async (req: any, res) => {
  try {
    const { status } = req.body
    if (!status || !VALID_PROJECT_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: open, in_progress, completed, cancelled' })
    }
    const sme = await prisma.sMEProfile.findUnique({ where: { userId: req.user.userId } })
    if (!sme) return res.status(404).json({ error: 'SME profile not found' })
    const project = await prisma.project.findFirst({
      where: { id: req.params.id, smeId: sme.id },
    })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: { status },
    })
    res.json(updated)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to update project' })
  }
})

export default router
