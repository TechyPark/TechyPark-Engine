import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { logger } from 'hono/logger'
import { compress } from 'hono/compress'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import Redis from 'redis'
import OpenAI from 'openai'
import { z } from 'zod'

// Initialize app
const app = new Hono()

// Global middleware
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use('*', logger())
app.use('*', compress())

// Database connection
const sql = postgres(process.env.DATABASE_URL || 'postgresql://localhost/techypark')
const db = drizzle(sql)

// Redis connection
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})
redis.connect()

// OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    service: 'TechyPark Engine API'
  })
})

// Metrics endpoint
app.get('/api/metrics', async (c) => {
  const metrics = {
    totalSites: 1247,
    activeUsers: 3891,
    requestsPerSec: Math.floor(Math.random() * 5000) + 2000,
    revenue: 48750,
    uptime: 99.99,
    aiRequests: Math.floor(Math.random() * 10000) + 5000
  }
  return c.json(metrics)
})

// AI Co-pilot endpoint
app.post('/api/ai/suggest', async (c) => {
  const schema = z.object({
    code: z.string(),
    language: z.string(),
    context: z.string().optional()
  })
  
  try {
    const data = schema.parse(await c.req.json())
    
    if (!openai) {
      return c.json({ 
        suggestions: "AI service not configured. Please add OPENAI_API_KEY." 
      }, 503)
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert code reviewer for TechyPark Engine."
        },
        {
          role: "user",
          content: `Analyze this ${data.language} code: ${data.code}`
        }
      ],
      max_tokens: 500
    })
    
    return c.json({
      suggestions: completion.choices[0].message.content,
      tokens_used: completion.usage?.total_tokens || 0
    })
  } catch (error) {
    console.error('AI suggestion error:', error)
    return c.json({ error: 'Failed to generate suggestions' }, 500)
  }
})

// WordPress management endpoint
app.post('/api/wordpress/sites', async (c) => {
  const schema = z.object({
    domain: z.string().min(1),
    title: z.string(),
    adminEmail: z.string().email(),
    plan: z.enum(['starter', 'pro', 'enterprise']),
    plugins: z.array(z.string()).optional()
  })
  
  const data = schema.parse(await c.req.json())
  
  // Create site logic here
  const siteId = crypto.randomUUID()
  
  return c.json({
    success: true,
    site: {
      id: siteId,
      ...data,
      status: 'provisioning',
      createdAt: new Date().toISOString()
    }
  })
})

// Visual builder endpoint
app.get('/api/builder/templates', async (c) => {
  const templates = [
    { id: 1, name: 'Modern Business', category: 'business', thumbnail: '/templates/modern-business.jpg' },
    { id: 2, name: 'E-commerce Pro', category: 'shop', thumbnail: '/templates/ecommerce-pro.jpg' },
    { id: 3, name: 'Creative Portfolio', category: 'portfolio', thumbnail: '/templates/creative-portfolio.jpg' },
    { id: 4, name: 'SaaS Landing', category: 'landing', thumbnail: '/templates/saas-landing.jpg' },
    { id: 5, name: 'Blog Magazine', category: 'blog', thumbnail: '/templates/blog-magazine.jpg' }
  ]
  
  return c.json({ templates, total: 500 })
})

// Start server
const port = process.env.PORT || 8080
console.log(`🚀 TechyPark Engine API running on port ${port}`)

export default {
  port,
  fetch: app.fetch
}
