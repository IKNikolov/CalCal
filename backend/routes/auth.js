import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Register
router.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const { email, password } = req.body

            // Check if user exists
            const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email])
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Email already registered' })
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10)

            // Create user
            const result = await db.query(
                'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, daily_calorie_goal, created_at',
                [email, passwordHash]
            )

            const user = result.rows[0]

            // Generate token
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            })

            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    daily_calorie_goal: user.daily_calorie_goal,
                },
            })
        } catch (error) {
            console.error('Register error:', error)
            res.status(500).json({ error: 'Failed to register user' })
        }
    }
)

// Login
router.post(
    '/login',
    [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const { email, password } = req.body

            // Find user
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' })
            }

            const user = result.rows[0]

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash)
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' })
            }

            // Generate token
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            })

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    daily_calorie_goal: user.daily_calorie_goal,
                },
            })
        } catch (error) {
            console.error('Login error:', error)
            res.status(500).json({ error: 'Failed to login' })
        }
    }
)

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, email, daily_calorie_goal, created_at, updated_at FROM users WHERE id = $1',
            [req.userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json(result.rows[0])
    } catch (error) {
        console.error('Get user error:', error)
        res.status(500).json({ error: 'Failed to fetch user' })
    }
})

// Update calorie goal
router.patch('/calorie-goal', authMiddleware, async (req, res) => {
    try {
        const { daily_calorie_goal } = req.body

        if (!daily_calorie_goal || daily_calorie_goal < 0) {
            return res.status(400).json({ error: 'Invalid calorie goal' })
        }

        const result = await db.query(
            'UPDATE users SET daily_calorie_goal = $1 WHERE id = $2 RETURNING id, email, daily_calorie_goal, updated_at',
            [daily_calorie_goal, req.userId]
        )

        res.json(result.rows[0])
    } catch (error) {
        console.error('Update goal error:', error)
        res.status(500).json({ error: 'Failed to update calorie goal' })
    }
})

export default router
