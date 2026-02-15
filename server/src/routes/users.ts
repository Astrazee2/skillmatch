import { Router } from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/me', async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        userType: true,
        createdAt: true,
        smeProfile: true,
        specialistProfile: true,
      },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

router.patch('/sme-profile', requireRole('sme'), async (req: any, res) => {
  try {
    const { companyName, industry, companySize, phone } = req.body
    const profile = await prisma.sMEProfile.update({
      where: { userId: req.user.userId },
      data: {
        companyName: companyName ?? undefined,
        industry: industry ?? undefined,
        companySize: companySize ?? undefined,
        phone: phone ?? undefined,
        profileComplete: Boolean(companyName && industry),
      },
    })
    res.json(profile)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

router.patch('/specialist-profile', requireRole('specialist'), async (req: any, res) => {
  try {
    const {
      fullName,
      profilePhotoUrl,
      bio,
      hourlyRate,
      experienceYears,
      expertiseAreas,
      skills,
      portfolioLinks,
      availabilityStatus,
    } = req.body
    const profile = await prisma.specialistProfile.update({
      where: { userId: req.user.userId },
      data: {
        fullName: fullName ?? undefined,
        profilePhotoUrl: profilePhotoUrl ?? undefined,
        bio: bio ?? undefined,
        hourlyRate: hourlyRate ?? undefined,
        experienceYears: experienceYears ?? undefined,
        expertiseAreas: expertiseAreas ?? undefined,
        skills: skills ?? undefined,
        portfolioLinks: portfolioLinks ?? undefined,
        availabilityStatus: availabilityStatus ?? undefined,
      },
    })
    res.json(profile)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

router.get('/specialists', requireRole('sme', 'admin'), async (req, res) => {
  try {
    const { category, minRating, maxRate, available } = req.query
    const where: any = { verificationStatus: 'verified' }
    if (category) where.expertiseAreas = { has: String(category) }
    if (minRating) where.rating = { gte: Number(minRating) }
    if (maxRate) where.hourlyRate = { lte: Number(maxRate) }
    if (available === 'true') where.availabilityStatus = true
    const specialists = await prisma.specialistProfile.findMany({
      where,
      include: { user: { select: { email: true } } },
    })
    res.json(specialists)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch specialists' })
  }
})

export default router
