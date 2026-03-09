import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import EventLog from '../models/EventLog.js'
import InterviewRoom from '../models/InterviewRoom.js'

export const replayRouter = Router()
replayRouter.use(requireAuth)

// GET /api/replay/:roomId — get full event log for replay
replayRouter.get('/:roomId', async (req, res) => {
    const authReq = req as AuthRequest
    try {
        const room = await InterviewRoom.findOne({ roomId: req.params.roomId })
        if (!room) { res.status(404).json({ error: 'Room not found' }); return }

        // Only host or participant can replay
        const uid = authReq.userId!
        const isAuthorized =
            room.hostId.toString() === uid ||
            (room.participantId && room.participantId.toString() === uid)
        if (!isAuthorized) { res.status(403).json({ error: 'Forbidden' }); return }

        const log = await EventLog.findOne({ roomId: req.params.roomId })
        if (!log) { res.json({ events: [], roomId: req.params.roomId }); return }

        res.json({
            roomId: req.params.roomId,
            room: {
                problem: room.problem,
                difficulty: room.difficulty,
                language: room.language,
                startedAt: room.startedAt,
                endedAt: room.endedAt,
            },
            events: log.events,
            initialSnapshot: room.codeSnapshots?.[0]?.content || '',
        })
    } catch (e) {
        console.error('[replay/get]', e)
        res.status(500).json({ error: 'Failed to fetch replay data' })
    }
})

// POST /api/replay/:roomId/append — append events (called by socket handlers)
replayRouter.post('/:roomId/append', async (req, res) => {
    const schema = z.object({
        events: z.array(z.object({
            type: z.enum(['editor-delta', 'cursor', 'file-change', 'chat', 'room-state', 'system', 'code-run', 'ai-analysis']),
            payload: z.record(z.string(), z.unknown()),
            timestamp: z.string().optional(),
            actorId: z.string(),
        })).min(1).max(100),
    })

    const parsed = schema.safeParse(req.body)
    if (!parsed.success) { res.status(400).json({ error: 'Invalid events' }); return }

    try {
        const eventsToInsert = parsed.data.events.map(e => ({
            ...e,
            timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
        }))

        await EventLog.findOneAndUpdate(
            { roomId: req.params.roomId },
            { $push: { events: { $each: eventsToInsert } } },
            { upsert: true, new: true },
        )
        res.json({ appended: parsed.data.events.length })
    } catch (e) {
        console.error('[replay/append]', e)
        res.status(500).json({ error: 'Failed to append events' })
    }
})
