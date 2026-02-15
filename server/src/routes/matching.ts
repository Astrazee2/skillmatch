import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Match score: skills 40%, budget 25%, availability 15%, industry 10%, rating 10%
function calcMatchScore(
  project: { requiredSkills: string[]; budgetMin: number; budgetMax: number },
  specialist: { skills: string[]; expertiseAreas: string[]; hourlyRate: number; availabilityStatus: boolean; rating: number }
): number {
  let score = 0
  const skills = [...(specialist.skills || []), ...(specialist.expertiseAreas || [])]
  const reqSkills = project.requiredSkills || []
  if (reqSkills.length > 0) {
    const matched = reqSkills.filter((s: string) =>
      skills.some((t: string) => t.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(t.toLowerCase()))
    ).length
    score += (matched / reqSkills.length) * 40
  } else score += 20
  const mid = (project.budgetMin + project.budgetMax) / 2
  if (specialist.hourlyRate <= project.budgetMax && specialist.hourlyRate >= project.budgetMin) score += 25
  else if (specialist.hourlyRate <= mid * 1.2) score += 15
  else if (specialist.hourlyRate <= project.budgetMax * 1.5) score += 8
  if (specialist.availabilityStatus) score += 15
  score += Math.min(10, (specialist.rating / 5) * 10)
  return Math.round(Math.min(100, score))
}

router.get('/project/:projectId', authMiddleware, requireRole('sme'), async (req: any, res) => {
  try {
    const sme = await prisma.sMEProfile.findUnique({ where: { userId: req.user.userId } })
    if (!sme) return res.status(404).json({ error: 'SME profile not found' })
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, smeId: sme.id },
    })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    const specialists = await prisma.specialistProfile.findMany({
      where: {
        verificationStatus: { in: ['verified', 'pending'] },
        expertiseAreas: { hasSome: [project.category] },
      },
      include: { user: { select: { email: true } } },
    })
    const withScores = specialists.map((s) => ({
      ...s,
      matchScore: calcMatchScore(project, s),
    }))
    withScores.sort((a, b) => b.matchScore - a.matchScore)
    const { sort } = req.query
    if (sort === 'rating') withScores.sort((a, b) => b.rating - a.rating)
    if (sort === 'price-asc') withScores.sort((a, b) => a.hourlyRate - b.hourlyRate)
    if (sort === 'price-desc') withScores.sort((a, b) => b.hourlyRate - a.hourlyRate)
    res.json(withScores)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Matching failed' })
  }
})

router.get('/specialist/:specialistId', authMiddleware, requireRole('specialist'), async (req: any, res) => {
  try {
    const specialist = await prisma.specialistProfile.findUnique({
      where: { userId: req.user.userId },
    })
    if (!specialist || specialist.id !== req.params.specialistId) {
      return res.status(404).json({ error: 'Specialist not found' })
    }
    const projects = await prisma.project.findMany({
      where: {
        status: 'open',
        category: { in: specialist.expertiseAreas },
      },
      include: { sme: true },
    })
    const withScores = projects.map((p) => ({
      ...p,
      matchScore: calcMatchScore(p, specialist),
    }))
    withScores.sort((a, b) => b.matchScore - a.matchScore)
    res.json(withScores)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Matching failed' })
  }
})

router.get('/browse-specialists', authMiddleware, async (req: any, res) => {
  try {
    const { category, minRating, maxRate, available, sort } = req.query
    const where: any = { verificationStatus: { in: ['verified', 'pending'] } }
    if (category) where.expertiseAreas = { has: String(category) }
    if (minRating) where.rating = { gte: Number(minRating) }
    if (maxRate) where.hourlyRate = { lte: Number(maxRate) }
    if (available === 'true') where.availabilityStatus = true
    let specialists = await prisma.specialistProfile.findMany({
      where,
      include: { user: { select: { id: true, email: true } } },
    })
    if (sort === 'rating') specialists.sort((a, b) => b.rating - a.rating)
    if (sort === 'price-asc') specialists.sort((a, b) => a.hourlyRate - b.hourlyRate)
    if (sort === 'price-desc') specialists.sort((a, b) => b.hourlyRate - a.hourlyRate)
    res.json(specialists)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch specialists' })
  }
})

export default router
