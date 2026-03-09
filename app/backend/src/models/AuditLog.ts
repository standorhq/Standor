import mongoose, { Schema, Document } from 'mongoose'

export type AuditAction =
    | 'role-change'
    | 'ai-rerun'
    | 'recording-download'
    | 'replay-download'
    | 'org-settings-change'
    | 'password-change'
    | 'new-login'
    | 'failed-login'
    | 'account-lockout'
    | 'email-verify'
    | 'mfa-enable'
    | 'mfa-disable'
    | 'room-create'
    | 'room-delete'
    | 'room-end'
    | 'problem-create'
    | 'problem-delete'
    | 'member-invite'
    | 'member-remove'

export interface IAuditLog extends Document {
    orgId?: mongoose.Types.ObjectId
    action: AuditAction
    actorId: mongoose.Types.ObjectId
    targetId?: string
    targetType?: 'User' | 'Organization' | 'Room' | 'Problem' | 'Analysis'
    metadata?: Record<string, unknown>
    ip?: string
    userAgent?: string
    createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>({
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    action: {
        type: String,
        required: true,
        enum: [
            'role-change', 'ai-rerun', 'recording-download', 'replay-download',
            'org-settings-change', 'password-change', 'new-login', 'failed-login',
            'account-lockout', 'email-verify', 'mfa-enable', 'mfa-disable',
            'room-create', 'room-delete', 'room-end', 'problem-create',
            'problem-delete', 'member-invite', 'member-remove',
        ],
    },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: String },
    targetType: { type: String, enum: ['User', 'Organization', 'Room', 'Problem', 'Analysis'] },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
}, {
    // Only createdAt — no updatedAt (immutable audit log)
    timestamps: { createdAt: true, updatedAt: false },
})

// Compound index for fast org-level queries, TTL not set — audit logs kept forever
AuditLogSchema.index({ orgId: 1, createdAt: -1 })
AuditLogSchema.index({ actorId: 1, createdAt: -1 })
AuditLogSchema.index({ action: 1, createdAt: -1 })

// Prevent updates — audit logs are append-only
AuditLogSchema.pre('findOneAndUpdate', function () {
    throw new Error('AuditLog entries are immutable')
})
AuditLogSchema.pre('updateOne', function () {
    throw new Error('AuditLog entries are immutable')
})
AuditLogSchema.pre('updateMany', function () {
    throw new Error('AuditLog entries are immutable')
})

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)
export default AuditLog
