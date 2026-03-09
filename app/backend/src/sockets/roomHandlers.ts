import { Server, Socket } from 'socket.io'
import InterviewRoom from '../models/InterviewRoom.js'
import EventLog from '../models/EventLog.js'
import { AIService } from '../services/aiService.js'

async function appendEvent(roomId: string, type: string, payload: Record<string, unknown>, actorId: string) {
    try {
        await EventLog.findOneAndUpdate(
            { roomId },
            { $push: { events: { type, payload, timestamp: new Date(), actorId } } },
            { upsert: true }
        )
    } catch { /* non-critical */ }
}

const rooms = new Map<string, Set<string>>()

export const registerRoomHandlers = (io: Server, socket: Socket) => {
    const userId = (socket as any).userId
    const userName = (socket as any).userName || 'Anonymous'

    socket.on('join-room', async (roomId: string) => {
        try {
            const room = await InterviewRoom.findOne({ roomId })
            if (!room) {
                socket.emit('error', { message: 'Room not found' })
                return
            }

            socket.join(roomId)
            if (!rooms.has(roomId)) rooms.set(roomId, new Set())
            rooms.get(roomId)!.add(socket.id)

            socket.to(roomId).emit('user-joined', { userId, userName, socketId: socket.id })
            socket.emit('room-info', {
                participants: rooms.get(roomId)!.size,
                status: room.status,
                problem: room.problem
            })
            void appendEvent(roomId, 'room-state', { event: 'join', userName, userId }, userId)
        } catch (e) {
            console.error('[Socket/Room]', e)
        }
    })

    socket.on('typing', ({ roomId }: { roomId: string }) => {
        socket.to(roomId).emit('user-typing', { userName })
    })

    socket.on('stop-typing', ({ roomId }: { roomId: string }) => {
        socket.to(roomId).emit('user-stop-typing', { userName })
    })

    socket.on('ai:hint-request', async ({ roomId, code, language, problem }: { roomId: string; code: string; language: string; problem: string }) => {
        try {
            const hint = await AIService.generateHint(code, language, problem)
            io.to(roomId).emit('ai:hint', { hint, timestamp: Date.now() })
        } catch {
            socket.emit('ai:hint', { hint: 'Think carefully about your current approach and edge cases.', timestamp: Date.now() })
        }
    })

    socket.on('disconnecting', () => {
        socket.rooms.forEach(roomId => {
            const members = rooms.get(roomId)
            if (members) {
                members.delete(socket.id)
                socket.to(roomId).emit('user-left', { userId, userName, socketId: socket.id })
                void appendEvent(roomId, 'room-state', { event: 'leave', userName, userId }, userId)
                if (members.size === 0) rooms.delete(roomId)
            }
        })
    })
}
