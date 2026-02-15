import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categories = ['Design', 'Marketing', 'Tech', 'Operations', 'Finance']

async function main() {
  const hashed = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@skillmatch.com' },
    update: {},
    create: {
      email: 'admin@skillmatch.com',
      password: hashed,
      userType: 'admin',
    },
  })

  const smeUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sme1@test.com' },
      update: {},
      create: { email: 'sme1@test.com', password: hashed, userType: 'sme' },
    }),
    prisma.user.upsert({
      where: { email: 'sme2@test.com' },
      update: {},
      create: { email: 'sme2@test.com', password: hashed, userType: 'sme' },
    }),
    prisma.user.upsert({
      where: { email: 'sme3@test.com' },
      update: {},
      create: { email: 'sme3@test.com', password: hashed, userType: 'sme' },
    }),
  ])

  for (let i = 0; i < smeUsers.length; i++) {
    const u = smeUsers[i]
    await prisma.sMEProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        companyName: `SME Company ${i + 1}`,
        industry: ['Retail', 'Manufacturing', 'Healthcare'][i],
        companySize: ['1-10', '11-50', '51-200'][i],
        phone: `+123456789${i}`,
        profileComplete: true,
      },
    })
  }

  const specialistData = [
    { name: 'Sarah Chen', expertise: ['Design'], skills: ['UI/UX', 'Figma', 'Branding'], rate: 85, years: 6, rating: 4.9 },
    { name: 'Marcus Johnson', expertise: ['Marketing'], skills: ['SEO', 'Content', 'Social Media'], rate: 95, years: 8, rating: 4.8 },
    { name: 'Elena Rodriguez', expertise: ['Tech'], skills: ['React', 'Node.js', 'API'], rate: 120, years: 10, rating: 5.0 },
    { name: 'David Park', expertise: ['Operations'], skills: ['Process', 'Logistics', 'Supply Chain'], rate: 90, years: 5, rating: 4.7 },
    { name: 'Amanda Foster', expertise: ['Finance'], skills: ['Accounting', 'Budgeting', 'Reporting'], rate: 110, years: 7, rating: 4.9 },
    { name: 'James Wilson', expertise: ['Tech'], skills: ['Python', 'ML', 'Data'], rate: 130, years: 9, rating: 4.8 },
    { name: 'Lisa Kim', expertise: ['Design'], skills: ['Graphics', 'Illustration', 'Web Design'], rate: 75, years: 4, rating: 4.6 },
    { name: 'Robert Brown', expertise: ['Marketing'], skills: ['PPC', 'Analytics', 'Growth'], rate: 100, years: 6, rating: 4.7 },
    { name: 'Emma Davis', expertise: ['Tech'], skills: ['DevOps', 'Cloud', 'AWS'], rate: 115, years: 5, rating: 4.8 },
    { name: 'Chris Martin', expertise: ['Operations'], skills: ['Project Mgmt', 'Agile', 'Teams'], rate: 85, years: 6, rating: 4.9 },
    { name: 'Julia Lee', expertise: ['Finance'], skills: ['Tax', 'Audit', 'Compliance'], rate: 125, years: 12, rating: 5.0 },
    { name: 'Michael Torres', expertise: ['Design'], skills: ['Product Design', 'Prototyping'], rate: 95, years: 7, rating: 4.8 },
    { name: 'Rachel Green', expertise: ['Marketing'], skills: ['Email', 'Automation', 'CRM'], rate: 88, years: 5, rating: 4.6 },
    { name: 'Alex Thompson', expertise: ['Tech'], skills: ['Mobile', 'React Native', 'Flutter'], rate: 105, years: 4, rating: 4.7 },
    { name: 'Sophie Anderson', expertise: ['Operations'], skills: ['HR', 'Talent', 'Onboarding'], rate: 80, years: 5, rating: 4.8 },
  ]

  const specialists = []
  for (let i = 0; i < specialistData.length; i++) {
    const d = specialistData[i]
    const user = await prisma.user.upsert({
      where: { email: `specialist${i + 1}@test.com` },
      update: {},
      create: { email: `specialist${i + 1}@test.com`, password: hashed, userType: 'specialist' },
    })
    const profile = await prisma.specialistProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: d.name,
        profilePhotoUrl: `https://i.pravatar.cc/200?u=${user.id}`,
        bio: `Experienced ${d.expertise[0]} professional with ${d.years}+ years in the industry.`,
        hourlyRate: d.rate,
        experienceYears: d.years,
        rating: d.rating,
        verificationStatus: i < 12 ? 'verified' : 'pending',
        availabilityStatus: i % 4 !== 0,
        expertiseAreas: d.expertise,
        skills: d.skills,
        portfolioLinks: [{ label: 'Portfolio', url: 'https://example.com/portfolio' }],
      },
    })
    specialists.push({ user, profile })
  }

  const smeProfiles = await prisma.sMEProfile.findMany()
  const projectData = [
    { title: 'Website Redesign', category: 'Design', min: 2000, max: 5000, days: 14, skills: ['UI/UX', 'Figma', 'Web Design'] },
    { title: 'SEO Campaign', category: 'Marketing', min: 1500, max: 3000, days: 30, skills: ['SEO', 'Content'] },
    { title: 'E-commerce API', category: 'Tech', min: 5000, max: 10000, days: 21, skills: ['React', 'Node.js', 'API'] },
    { title: 'Process Optimization', category: 'Operations', min: 2500, max: 5000, days: 14, skills: ['Process', 'Operations'] },
    { title: 'Financial Audit Prep', category: 'Finance', min: 3000, max: 6000, days: 21, skills: ['Accounting', 'Audit'] },
    { title: 'Brand Identity', category: 'Design', min: 1000, max: 2500, days: 10, skills: ['Branding', 'Graphics'] },
    { title: 'Social Media Strategy', category: 'Marketing', min: 800, max: 2000, days: 14, skills: ['Social Media', 'Content'] },
    { title: 'Mobile App MVP', category: 'Tech', min: 8000, max: 15000, days: 45, skills: ['React Native', 'Mobile'] },
    { title: 'Inventory System', category: 'Operations', min: 4000, max: 8000, days: 30, skills: ['Logistics', 'Supply Chain'] },
    { title: 'Budget Planning', category: 'Finance', min: 2000, max: 4000, days: 14, skills: ['Budgeting', 'Reporting'] },
  ]

  for (let i = 0; i < projectData.length; i++) {
    const p = projectData[i]
    const sme = smeProfiles[i % smeProfiles.length]
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + p.days)
    await prisma.project.create({
      data: {
        smeId: sme.id,
        title: p.title,
        description: `We need an experienced professional for ${p.title}. Looking for someone with expertise in ${p.skills.join(', ')}.`,
        category: p.category,
        budgetMin: p.min,
        budgetMax: p.max,
        deadline,
        requiredSkills: p.skills,
        status: 'open',
      },
    })
  }

  console.log('Seed complete:', { admin, smeUsers: smeUsers.length, specialists: specialists.length })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
