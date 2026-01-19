import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import authRoutes from './routes/auth.js'
import entriesRoutes from './routes/entries.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/entries', entriesRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Calorie Calculator API is running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📁 Frontend URL: ${process.env.FRONTEND_URL}`)
})
