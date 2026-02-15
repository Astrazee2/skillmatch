import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req: any, res) => {
  try {
    const { withUser, projectId } = req.query
    const userId = req.user.userId
    const where: any = {
      OR: [{ senderId: userId }, { receiverId: userId }],
    }
    if (withUser) {
      where.AND = [
        { OR: [{ senderId: withUser }, { receiverId: withUser }] },
      ]
    }
    if (projectId) where.projectId = projectId
    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, email: true } },
        receiver: { select: { id: true, email: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { sentAt: 'asc' },
    })
    res.json(messages)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

router.post('/', async (req: any, res) => {
  try {
    const { receiverId, projectId, messageText } = req.body
    if (!receiverId || !messageText) return res.status(400).json({ error: 'Receiver and message required' })
    const msg = await prisma.message.create({
      data: {
        senderId: req.user.userId,
        receiverId,
        projectId: projectId || null,
        messageText,
      },
    })
    res.status(201).json(msg)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

router.patch('/:id/read', async (req: any, res) => {
  try {
    const msg = await prisma.message.findFirst({
      where: { id: req.params.id, receiverId: req.user.userId },
    })
    if (!msg) return res.status(404).json({ error: 'Message not found' })
    await prisma.message.update({
      where: { id: req.params.id },
      data: { read: true },
    })
    res.json({ ok: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to mark as read' })
  }
})

export default router
