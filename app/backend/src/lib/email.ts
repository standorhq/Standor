// FILE: apps/server/src/lib/email.ts

import nodemailer from 'nodemailer';
import { env } from './env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: env.SMTP_USER && env.SMTP_PASS
    ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
    : undefined,
});

interface SessionForEmail {
  problem: string;
  difficulty: string;
  roomId: string;
  aiAnalysis?: {
    overallScore: number;
    timeComplexity: string;
    spaceComplexity: string;
    summary: string;
    bugs: string[];
    suggestions: string[];
  } | null;
  host: { email: string; name: string };
  participant?: { email: string; name: string } | null;
  startedAt: Date;
  endedAt?: Date | null;
}

export async function sendSessionReport(session: SessionForEmail): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER) return;

  const duration = session.endedAt && session.startedAt
    ? Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60_000)
    : '–';

  const ai = session.aiAnalysis;

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><style>
      body { font-family: system-ui, sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 24px; }
      h1 { color: #0d9488; font-size: 22px; margin-bottom: 4px; }
      .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
      .card { background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
      .score { font-size: 36px; font-weight: 900; color: #0d9488; }
      .label { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
      .complexity { display: flex; gap: 24px; margin-top: 8px; }
      ul { margin: 8px 0 0; padding-left: 20px; }
      li { font-size: 14px; margin-bottom: 4px; }
      .footer { font-size: 11px; color: #94a3b8; margin-top: 32px; text-align: center; }
    </style></head>
    <body>
      <h1>Standor — Session Report</h1>
      <p class="meta">
        Problem: <strong>${session.problem}</strong> &nbsp;·&nbsp;
        Difficulty: <strong>${session.difficulty}</strong> &nbsp;·&nbsp;
        Duration: <strong>${duration} min</strong>
      </p>

      ${ai ? `
        <div class="card">
          <div class="label">AI Score</div>
          <div class="score">${ai.overallScore}<span style="font-size:18px;color:#94a3b8">/10</span></div>
          <div class="complexity">
            <div><div class="label">Time</div>${ai.timeComplexity}</div>
            <div><div class="label">Space</div>${ai.spaceComplexity}</div>
          </div>
        </div>

        ${ai.summary ? `<div class="card"><div class="label">Summary</div><p style="font-size:14px;margin:8px 0 0">${ai.summary}</p></div>` : ''}

        ${ai.bugs.length > 0 ? `
          <div class="card">
            <div class="label">Bugs found</div>
            <ul>${ai.bugs.map((b) => `<li>${b}</li>`).join('')}</ul>
          </div>` : ''}

        ${ai.suggestions.length > 0 ? `
          <div class="card">
            <div class="label">Suggestions</div>
            <ul>${ai.suggestions.map((s) => `<li>${s}</li>`).join('')}</ul>
          </div>` : ''}
      ` : '<p style="color:#64748b">AI analysis was not run for this session.</p>'}

      <p class="footer">Standor — The Standard for Technical Interviews &nbsp;·&nbsp; Room ID: ${session.roomId}</p>
    </body>
    </html>
  `;

  const recipients = [session.host.email, session.participant?.email].filter(Boolean) as string[];

  await Promise.allSettled(
    recipients.map((to) =>
      transporter.sendMail({
        from: `"Standor" <${env.FROM_EMAIL}>`,
        to,
        subject: `Session Report: ${session.problem}`,
        html,
      }),
    ),
  );
}
