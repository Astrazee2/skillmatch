import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

router.post('/register', async (req, res) => {
  try {
    const { email, password, userType } = req.body
    if (!email || !password || !userType || !['sme', 'specialist'].includes(userType)) {
      return res.status(400).json({ error: 'Email, password, and userType (sme or specialist) required' })
    }
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ error: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashed, userType },
      select: { id: true, email: true, userType: true, createdAt: true },
    })
    if (userType === 'sme') {
      await prisma.sMEProfile.create({
        data: {
          userId: user.id,
          companyName: '',
          industry: '',
          profileComplete: false,
        },
      })
    }
    if (userType === 'specialist') {
      await prisma.specialistProfile.create({
        data: {
          userId: user.id,
          fullName: '',
          hourlyRate: 0,
          experienceYears: 0,
          expertiseAreas: [],
          skills: [],
          verificationStatus: 'pending',
        },
      })
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ user, token })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      user: { id: user.id, email: user.email, userType: user.userType, createdAt: user.createdAt },
      token,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
