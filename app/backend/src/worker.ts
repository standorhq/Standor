/**
 * BullMQ Worker Process — runs as a separate K8s Deployment
 * Handles: AI analysis, snapshot archival, email notifications
 */
import mongoose from 'mongoose'
import { env } from './config/env.js'
import { aiAnalysisWorker } from './workers/aiAnalysisWorker.js'
import { snapshotWorker } from './workers/snapshotWorker.js'
import { emailWorker } from './workers/emailWorker.js'

async function start() {
    await mongoose.connect(env.MONGODB_URI)
    console.log('[Worker] MongoDB connected')

    console.log('[Worker] AI analysis worker started')
    console.log('[Worker] Snapshot worker started')
    console.log('[Worker] Email worker started')

    process.on('SIGTERM', async () => {
        console.log('[Worker] SIGTERM received — graceful shutdown')
        await Promise.all([
            aiAnalysisWorker.close(),
            snapshotWorker.close(),
            emailWorker.close(),
        ])
        await mongoose.disconnect()
        process.exit(0)
    })

    process.on('SIGINT', async () => {
        await Promise.all([
            aiAnalysisWorker.close(),
            snapshotWorker.close(),
            emailWorker.close(),
        ])
        await mongoose.disconnect()
        process.exit(0)
    })
}

start().catch(err => {
    console.error('[Worker] Fatal startup error:', err)
    process.exit(1)
})
