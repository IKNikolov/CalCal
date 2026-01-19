import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'))
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, req.userId + '-' + uniqueSuffix + path.extname(file.originalname))
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'))
        }
    },
})

// Get entries for a specific date
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { date } = req.query
        const entryDate = date || new Date().toISOString().split('T')[0]

        const result = await db.query(
            'SELECT * FROM calorie_entries WHERE user_id = $1 AND entry_date = $2 ORDER BY created_at DESC',
            [req.userId, entryDate]
        )

        res.json(result.rows)
    } catch (error) {
        console.error('Get entries error:', error)
        res.status(500).json({ error: 'Failed to fetch entries' })
    }
})

// Get historical entries (date range)
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const { start_date, end_date } = req.query

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'start_date and end_date are required' })
        }

        const result = await db.query(
            'SELECT * FROM calorie_entries WHERE user_id = $1 AND entry_date >= $2 AND entry_date <= $3 ORDER BY entry_date DESC, created_at DESC',
            [req.userId, start_date, end_date]
        )

        res.json(result.rows)
    } catch (error) {
        console.error('Get history error:', error)
        res.status(500).json({ error: 'Failed to fetch history' })
    }
})

// Create new entry
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            entry_date,
            food_description,
            total_calories,
            entry_type,
            image_url,
            ai_response,
            confidence,
        } = req.body

        if (!food_description || !total_calories || !entry_type) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        const result = await db.query(
            `INSERT INTO calorie_entries
       (user_id, entry_date, food_description, total_calories, entry_type, image_url, ai_response, confidence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [
                req.userId,
                entry_date || new Date().toISOString().split('T')[0],
                food_description,
                total_calories,
                entry_type,
                image_url || null,
                ai_response ? JSON.stringify(ai_response) : null,
                confidence || null,
            ]
        )

        res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Create entry error:', error)
        res.status(500).json({ error: 'Failed to create entry' })
    }
})

// Update entry
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params
        const { food_description, total_calories } = req.body

        // Verify ownership
        const checkResult = await db.query(
            'SELECT * FROM calorie_entries WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        )

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Entry not found' })
        }

        const result = await db.query(
            'UPDATE calorie_entries SET food_description = COALESCE($1, food_description), total_calories = COALESCE($2, total_calories) WHERE id = $3 AND user_id = $4 RETURNING *',
            [food_description, total_calories, id, req.userId]
        )

        res.json(result.rows[0])
    } catch (error) {
        console.error('Update entry error:', error)
        res.status(500).json({ error: 'Failed to update entry' })
    }
})

// Delete entry
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params

        const result = await db.query(
            'DELETE FROM calorie_entries WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Entry not found' })
        }

        res.json({ message: 'Entry deleted successfully' })
    } catch (error) {
        console.error('Delete entry error:', error)
        res.status(500).json({ error: 'Failed to delete entry' })
    }
})

// Upload image
router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' })
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        res.json({ imageUrl })
    } catch (error) {
        console.error('Upload error:', error)
        res.status(500).json({ error: 'Failed to upload image' })
    }
})

export default router
