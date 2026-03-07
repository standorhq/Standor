// FILE: apps/server/src/jobs/cleanup.ts
// Background job: auto-expire sessions stuck in ACTIVE > 4 hours.

import { prisma } from '../lib/prisma.js';

export async function cleanupStaleSessions(): Promise<void> {
  const cutoff = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const { count } = await prisma.session.updateMany({
    where: { status: 'ACTIVE', startedAt: { lt: cutoff } },
    data: { status: 'COMPLETED', endedAt: new Date() },
  });
  if (count > 0) console.log(`[cleanup] expired ${count} stale session(s)`);
}
