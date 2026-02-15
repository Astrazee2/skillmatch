import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Full name is required' })
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' })
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' })
    if (!subject?.trim()) return res.status(400).json({ error: 'Subject is required' })
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' })
    if (message.trim().length < 10) return res.status(400).json({ error: 'Message must be at least 10 characters' })

    const submission = await prisma.contactSubmission.create({
      data: { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() },
    })
    res.status(201).json(submission)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to submit contact form' })
  }
})

export default router
