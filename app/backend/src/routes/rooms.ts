import { Router } from 'express'
import { z } from 'zod'
import InterviewRoom from '../models/InterviewRoom.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { AIService } from '../services/aiService.js'
import { EmailService } from '../services/emailService.js'

export const sessionRouter = Router()
sessionRouter.use(requireAuth)

// POST /api/rooms  (also mounted at /api/sessions)
sessionRouter.post('/', async (req, res) => {
    const authReq = req as AuthRequest
    const schema = z.object({
        problem: z.string().min(2).max(200),
        difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
        language: z.string().min(1).max(50).optional(),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten() })
        return
    }

    try {
        const room = await InterviewRoom.create({
            problem: parsed.data.problem,
            difficulty: parsed.data.difficulty,
            language: parsed.data.language ?? 'javascript',
            hostId: authReq.userId!,
        })
        res.status(201).json(room)
    } catch (e) {
        console.error('[rooms/create]', e)
        res.status(500).json({ error: 'Failed to create session' })
    }
})

// GET /api/rooms/export?format=csv — download CSV of all sessions
sessionRouter.get('/export', async (req, res) => {
    const authReq = req as AuthRequest
    const userFilter = { $or: [{ hostId: authReq.userId }, { participantId: authReq.userId }] }
    try {
        const rooms = await InterviewRoom.find(userFilter).sort({ startedAt: -1 }).limit(1000)

        const header = ['Room ID', 'Problem', 'Difficulty', 'Status', 'Started At', 'Ended At', 'Duration (min)', 'AI Score', 'Time Complexity', 'Space Complexity'].join(',')
        const rows = rooms.map(r => {
            const start = r.startedAt ? new Date(r.startedAt).getTime() : 0
            const end = r.endedAt ? new Date(r.endedAt).getTime() : 0
            const durationMin = start && end ? ((end - start) / 60000).toFixed(1) : ''
            const lastAnalysis = r.analyses?.[r.analyses.length - 1]
            return [
                r.roomId,
                `"${(r.problem || '').replace(/"/g, '""')}"`,
                r.difficulty,
                r.status,
                r.startedAt ? new Date(r.startedAt).toISOString() : '',
                r.endedAt ? new Date(r.endedAt).toISOString() : '',
                durationMin,
                lastAnalysis?.overallScore ?? '',
                `"${lastAnalysis?.timeComplexity ?? ''}"`,
                `"${lastAnalysis?.spaceComplexity ?? ''}"`,
            ].join(',')
        })

        const csv = [header, ...rows].join('\n')
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="standor-sessions.csv"')
        res.send(csv)
    } catch {
        res.status(500).json({ error: 'Export failed' })
    }
})

// GET /api/rooms/my-sessions
sessionRouter.get('/my-sessions', async (req, res) => {
    const authReq = req as AuthRequest
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    try {
        const rooms = await InterviewRoom.find({
            $or: [{ hostId: authReq.userId }, { participantId: authReq.userId }],
        })
            .sort({ startedAt: -1 })
            .skip(skip)
            .limit(limit)

        const total = await InterviewRoom.countDocuments({
            $or: [{ hostId: authReq.userId }, { participantId: authReq.userId }],
        })

        res.json({
            rooms,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch {
        res.status(500).json({ error: 'Failed to fetch sessions' })
    }
})

// GET /api/rooms/stats
sessionRouter.get('/stats', async (req, res) => {
    const authReq = req as AuthRequest
    const userFilter = { $or: [{ hostId: authReq.userId }, { participantId: authReq.userId }] }
    try {
        const [total, active, completed, withParticipant] = await Promise.all([
            InterviewRoom.countDocuments(userFilter),
            InterviewRoom.countDocuments({ ...userFilter, status: 'ACTIVE' }),
            InterviewRoom.countDocuments({ ...userFilter, status: 'COMPLETED' }),
            InterviewRoom.countDocuments({ ...userFilter, participantId: { $exists: true, $ne: null } }),
        ])

        // Calculate pass rate and avg score for completed rooms
        const completedRooms = await InterviewRoom.find({ ...userFilter, status: 'COMPLETED' }, { analyses: { $slice: -1 } })

        const scores = completedRooms
            .map(r => r.analyses[0]?.overallScore)
            .filter(s => s !== undefined) as number[]

        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
        const passRate = scores.length > 0 ? (scores.filter(s => s >= 7).length / scores.length) * 100 : 0

        res.json({ total, active, completed, withParticipant, avgScore, passRate })
    } catch {
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})

// GET /api/rooms/analytics
sessionRouter.get('/analytics', async (req, res) => {
    const authReq = req as AuthRequest
    const userFilter = { $or: [{ hostId: authReq.userId }, { participantId: authReq.userId }] }
    try {
        // Fetch last 100 sessions to build charts (or use aggregation)
        // For simplicity and richness, we'll use aggregation
        const activity = await InterviewRoom.aggregate([
            { $match: userFilter },
            {
                $group: {
                    _id: {
                        year: { $year: "$startedAt" },
                        week: { $week: "$startedAt" }
                    },
                    count: { $sum: 1 },
                    date: { $first: "$startedAt" }
                }
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } },
            { $limit: 12 }
        ])

        const difficultyBreakdown = await InterviewRoom.aggregate([
            { $match: userFilter },
            {
                $group: {
                    _id: "$difficulty",
                    count: { $sum: 1 }
                }
            }
        ])

        res.json({
            activity: activity.map(a => ({
                week: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: a.count
            })),
            difficulty: difficultyBreakdown.map(d => ({
                diff: d._id,
                count: d.count
            }))
        })
    } catch {
        res.status(500).json({ error: 'Failed to fetch analytics' })
    }
})

// GET /api/rooms/:roomId
sessionRouter.get('/:roomId', async (req, res) => {
    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
        if (!room) {
            res.status(444).json({ error: 'Session not found' })
            return
        }
        res.json(room)
    } catch {
        res.status(500).json({ error: 'Failed to fetch session' })
    }
})

// POST /api/rooms/:roomId/join
sessionRouter.post('/:roomId/join', async (req, res) => {
    const authReq = req as AuthRequest
    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
        if (!room) {
            res.status(404).json({ error: 'Session not found' })
            return
        }
        if (room.status !== 'ACTIVE') {
            res.status(400).json({ error: 'Session is not active' })
            return
        }
        if (!room.participantId && room.hostId.toString() !== authReq.userId) {
            room.participantId = authReq.userId as any
            await room.save()
        }
        res.json({ joined: true })
    } catch {
        res.status(500).json({ error: 'Failed to join session' })
    }
})

// POST /api/rooms/:roomId/snapshot
sessionRouter.post('/:roomId/snapshot', async (req, res) => {
    const schema = z.object({
        content: z.string().max(100_000),
        language: z.string().min(1).max(50),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid snapshot data' })
        return
    }

    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
        if (!room) {
            res.status(404).json({ error: 'Session not found' })
            return
        }

        room.codeSnapshots.push({
            content: parsed.data.content,
            language: parsed.data.language,
            timestamp: new Date(),
        })
        if (room.codeSnapshots.length > 20) {
            room.codeSnapshots.splice(0, room.codeSnapshots.length - 20)
        }

        await room.save()
        res.json({ saved: true })
    } catch {
        res.status(500).json({ error: 'Failed to save snapshot' })
    }
})

// POST /api/rooms/:roomId/analyze
sessionRouter.post('/:roomId/analyze', async (req, res) => {
    const schema = z.object({
        code: z.string().min(1).max(50_000),
        language: z.string().min(1).max(50),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request' })
        return
    }

    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
        if (!room) {
            res.status(404).json({ error: 'Session not found' })
            return
        }

        const result = await AIService.analyzeCode(parsed.data.code, parsed.data.language)

        const aiAnalysis = {
            timeComplexity: result.timeComplexity,
            spaceComplexity: result.spaceComplexity,
            correctness: result.correctness,
            bugs: result.bugs,
            suggestions: result.suggestions,
            testCases: result.testCases,
            codeStyle: result.codeStyle,
            overallScore: result.overallScore,
            summary: result.summary,
            analyzedAt: new Date(),
        }

        room.analyses.push(aiAnalysis as any)
        await room.save()

        res.json({ aiAnalysis })
    } catch (e) {
        console.error('[rooms/analyze]', e)
        res.status(500).json({ error: 'AI analysis failed' })
    }
})

// DELETE /api/rooms/:roomId  (host only)
sessionRouter.delete('/:roomId', async (req, res) => {
    const authReq = req as AuthRequest
    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
        if (!room) { res.status(404).json({ error: 'Session not found' }); return }
        if (room.hostId.toString() !== authReq.userId) {
            res.status(403).json({ error: 'Only the host can delete the session' }); return
        }
        await InterviewRoom.deleteOne({ roomId: req.params.roomId })
        res.json({ deleted: true })
    } catch { res.status(500).json({ error: 'Failed to delete session' }) }
})

// POST /api/rooms/:roomId/end
sessionRouter.post('/:roomId/end', async (req, res) => {
    const authReq = req as AuthRequest
    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
            .populate('hostId')
            .populate('participantId')

        if (!room) {
            res.status(404).json({ error: 'Session not found' })
            return
        }
        if ((room.hostId as any)._id.toString() !== authReq.userId) {
            res.status(403).json({ error: 'Only the host can end the session' })
            return
        }

        room.status = 'COMPLETED'
        room.endedAt = new Date()

        // Trigger final analysis if not done recently
        const lastSnapshot = room.codeSnapshots[room.codeSnapshots.length - 1]
        if (lastSnapshot) {
            try {
                const result = await AIService.analyzeCode(lastSnapshot.content, lastSnapshot.language)
                room.analyses.push({
                    ...result,
                    analyzedAt: new Date()
                } as any)
            } catch (e) {
                console.error('[EndSession] Final analysis failed:', e)
            }
        }

        await room.save()

        // Send professional email report
        const host = room.hostId as any
        const participant = room.participantId as any
        const finalAnalysis = room.analyses[room.analyses.length - 1]

        const reportHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #0EA5A4;">Standor Interview Report</h1>
                <p>The interview for <strong>${room.problem}</strong> has been completed.</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0;">Performance Summary</h2>
                    <p style="font-size: 24px; font-weight: bold; color: #333;">Score: ${finalAnalysis?.overallScore ?? 'N/A'}/10</p>
                    <p><strong>Complexity:</strong> ${finalAnalysis?.timeComplexity ?? 'N/A'} (Time), ${finalAnalysis?.spaceComplexity ?? 'N/A'} (Space)</p>
                    <p><strong>Summary:</strong> ${finalAnalysis?.summary ?? 'No summary available.'}</p>
                </div>
                <h3>Key Feedback</h3>
                <ul>
                    ${(finalAnalysis?.suggestions || []).map(s => `<li>${s}</li>`).join('')}
                </ul>
                <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                    This is an automated report from your Standor session. Visit your dashboard for the full code replay.
                </p>
            </div>
        `

        if (host?.email) {
            void EmailService.sendEmail(host.email, `Interview Report: ${room.problem}`, reportHtml).catch(console.error)
        }
        if (participant?.email) {
            void EmailService.sendEmail(participant.email, `Interview Report: ${room.problem}`, reportHtml).catch(console.error)
        }

        res.json(room)
    } catch {
        res.status(500).json({ error: 'Failed to end session' })
    }
})
