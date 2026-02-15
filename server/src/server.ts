import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import projectRoutes from './routes/projects.js'
import applicationRoutes from './routes/applications.js'
import messageRoutes from './routes/messages.js'
import matchingRoutes from './routes/matching.js'
import adminRoutes from './routes/admin.js'
import contactRoutes from './routes/contact.js'
import publicRoutes from './routes/public.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/matching', matchingRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/public', publicRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`SkillMatch API running on port ${PORT}`))
