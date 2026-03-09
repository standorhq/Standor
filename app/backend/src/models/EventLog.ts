import mongoose, { Schema, Document } from 'mongoose'

export type EventType =
    | 'editor-delta'
    | 'cursor'
    | 'file-change'
    | 'chat'
    | 'room-state'
    | 'system'
    | 'code-run'
    | 'ai-analysis'

export interface IEvent {
    type: EventType
    payload: Record<string, unknown>
    timestamp: Date
    actorId: string
}

export interface IEventLog extends Document {
    roomId: string
    orgId?: string
    events: IEvent[]
    createdAt: Date
    updatedAt: Date
}

const EventSchema = new Schema<IEvent>(
    {
        type: {
            type: String,
            enum: ['editor-delta', 'cursor', 'file-change', 'chat', 'room-state', 'system', 'code-run', 'ai-analysis'],
            required: true,
        },
        payload: { type: Schema.Types.Mixed, required: true },
        timestamp: { type: Date, default: Date.now },
        actorId: { type: String, required: true },
    },
    { _id: false },
)

const EventLogSchema = new Schema<IEventLog>(
    {
        roomId: { type: String, required: true, index: true },
        orgId: { type: String },
        events: { type: [EventSchema], default: [] },
    },
    { timestamps: true },
)

// Compound index for replay queries
EventLogSchema.index({ roomId: 1, 'events.timestamp': 1 })

export default mongoose.model<IEventLog>('EventLog', EventLogSchema)
