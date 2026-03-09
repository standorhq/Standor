import { Router } from 'express'
import { z } from 'zod'
import axios from 'axios'
import Problem from '../models/Problem.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { env } from '../config/env.js'
import type { Response, NextFunction } from 'express'

export const problemsRouter = Router()
problemsRouter.use(requireAuth)

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (req.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' })
        return
    }
    next()
}

const starterCodeSchema = z.array(z.object({
    language: z.string().min(1).max(30),
    code: z.string().max(10_000),
})).optional()

const testCasesSchema = z.array(z.object({
    input: z.string().max(5_000),
    expected: z.string().max(5_000),
    hidden: z.boolean().default(false),
})).optional()

const problemBodySchema = z.object({
    title: z.string().min(2).max(200),
    description: z.string().min(10).max(20_000),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    category: z.string().min(1).max(100),
    tags: z.array(z.string().max(50)).max(20).optional(),
    constraints: z.array(z.string().max(500)).max(20).optional(),
    examples: z.array(z.object({
        input: z.string().max(1_000),
        output: z.string().max(1_000),
        explanation: z.string().max(1_000).optional(),
    })).min(1).max(10).optional(),
    starterCode: starterCodeSchema,
    testCases: testCasesSchema,
    isCustom: z.boolean().optional(),
})

// GET /api/problems?q=&difficulty=&category=&tag=
problemsRouter.get('/', async (req, res) => {
    const { q, difficulty, category, tag } = req.query as Record<string, string | undefined>

    try {
        const query: any = {}

        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } }
            ]
        }

        if (difficulty) {
            query.difficulty = difficulty.toUpperCase()
        }

        if (category) {
            query.category = { $regex: `^${category}$`, $options: 'i' }
        }

        if (tag) {
            query.tags = { $regex: `^${tag}$`, $options: 'i' }
        }

        const results = await Problem.find(query)

        res.json(
            results.map((p) => ({
                id: p._id,
                title: p.title,
                difficulty: p.difficulty,
                category: p.category,
                tags: p.tags,
                description: p.description,
                examples: p.examples,
                testCaseCount: p.testCases.length,
            }))
        )
    } catch {
        res.status(500).json({ error: 'Failed to fetch problems' })
    }
})

// GET /api/problems/categories
problemsRouter.get('/categories', async (_req, res) => {
    try {
        const cats = await Problem.distinct('category')
        res.json(cats.sort())
    } catch {
        res.status(500).json({ error: 'Failed to fetch categories' })
    }
})

// GET /api/problems/tags
problemsRouter.get('/tags', async (_req, res) => {
    try {
        const tags = await Problem.distinct('tags')
        res.json(tags.sort())
    } catch {
        res.status(500).json({ error: 'Failed to fetch tags' })
    }
})

// GET /api/problems/:slug
problemsRouter.get('/:slug', async (req, res) => {
    const slug = decodeURIComponent(req.params.slug ?? '')
    try {
        const problem = await Problem.findOne({ title: { $regex: `^${slug}$`, $options: 'i' } })

        if (!problem) {
            res.status(404).json({ error: 'Problem not found' })
            return
        }

        res.json({
            id: problem._id,
            title: problem.title,
            difficulty: problem.difficulty,
            category: problem.category,
            tags: problem.tags,
            description: problem.description,
            examples: problem.examples,
            starterCode: problem.starterCode.reduce((acc: any, curr) => {
                acc[curr.language] = curr.code
                return acc
            }, {}),
            testCases: problem.testCases.filter((tc) => !tc.hidden),
        })
    } catch {
        res.status(500).json({ error: 'Failed to fetch problem' })
    }
})

// POST /api/problems/:slug/run — run code via Piston
problemsRouter.post('/:slug/run', async (req, res) => {
    const schema = z.object({
        language: z.string().min(1).max(50),
        code: z.string().min(1).max(50_000),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request' })
        return
    }

    const slug = decodeURIComponent(req.params.slug ?? '')
    const problem = await Problem.findOne({ title: { $regex: `^${slug}$`, $options: 'i' } })

    if (!problem) {
        res.status(404).json({ error: 'Problem not found' })
        return
    }

    const { language, code } = parsed.data

    const results = await Promise.all(
        problem.testCases.map(async (tc, i) => {
            try {
                const { data } = await axios.post(
                    `${env.PISTON_API_URL}/execute`,
                    {
                        language,
                        version: '*',
                        files: [{ content: code }],
                        stdin: tc.input,
                        run_timeout: 2000,
                    },
                    { timeout: 15_000 },
                )

                const actual = (String((data as any).run?.stdout ?? '')).trim()
                const expected = tc.expected.trim()
                const passed = actual === expected

                return {
                    index: i + 1,
                    passed,
                    hidden: tc.hidden,
                    input: tc.hidden ? null : tc.input,
                    expected: tc.hidden ? null : tc.expected,
                    actual: tc.hidden ? (passed ? 'Passed' : 'Failed') : actual,
                    stderr: tc.hidden ? null : ((data as any).run?.stderr ?? ''),
                }
            } catch {
                return { index: i + 1, passed: false, hidden: tc.hidden, input: null, expected: null, actual: 'Execution error', stderr: null }
            }
        }),
    )

    const total = results.length
    const passed = results.filter((r) => r.passed).length

    res.json({ passed, total, results })
})

// ── Admin CRUD ──────────────────────────────────────────────────────────────

// POST /api/problems — create a new problem (ADMIN or custom)
problemsRouter.post('/', async (req, res) => {
    const authReq = req as AuthRequest
    const parsed = problemBodySchema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: 'Invalid problem data', details: parsed.error.flatten() }); return }

    // Non-admins can only create custom problems
    const isAdmin = authReq.role === 'ADMIN'
    try {
        const problem = await Problem.create({
            ...parsed.data,
            isCustom: isAdmin ? (parsed.data.isCustom ?? false) : true,
            createdBy: authReq.userId,
        })
        res.status(201).json({
            id: problem._id,
            title: problem.title,
            difficulty: problem.difficulty,
            category: problem.category,
            tags: problem.tags,
        })
    } catch (e: any) {
        if (e.code === 11000) { res.status(409).json({ error: 'A problem with this title already exists' }); return }
        console.error('[problems/create]', e)
        res.status(500).json({ error: 'Failed to create problem' })
    }
})

// PATCH /api/problems/:id — update a problem (ADMIN only)
problemsRouter.patch('/:id', requireAdmin, async (req, res) => {
    const parsed = problemBodySchema.partial().safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: 'Invalid update data', details: parsed.error.flatten() }); return }

    try {
        const problem = await Problem.findByIdAndUpdate(
            req.params.id,
            { $set: parsed.data },
            { new: true, runValidators: true }
        )
        if (!problem) { res.status(404).json({ error: 'Problem not found' }); return }
        res.json({ id: problem._id, title: problem.title, difficulty: problem.difficulty, category: problem.category })
    } catch (e: any) {
        if (e.code === 11000) { res.status(409).json({ error: 'A problem with this title already exists' }); return }
        console.error('[problems/update]', e)
        res.status(500).json({ error: 'Failed to update problem' })
    }
})

// DELETE /api/problems/:id — delete a problem (ADMIN only)
problemsRouter.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const problem = await Problem.findByIdAndDelete(req.params.id)
        if (!problem) { res.status(404).json({ error: 'Problem not found' }); return }
        res.json({ deleted: true, id: req.params.id })
    } catch (e) {
        console.error('[problems/delete]', e)
        res.status(500).json({ error: 'Failed to delete problem' })
    }
})

// GET /api/problems/:id/full — full detail by ObjectId (ADMIN)
problemsRouter.get('/:id/full', requireAdmin, async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id)
        if (!problem) { res.status(404).json({ error: 'Problem not found' }); return }
        res.json(problem)
    } catch {
        res.status(500).json({ error: 'Failed to fetch problem' })
    }
})
