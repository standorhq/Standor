// FILE: apps/server/src/lib/ai.ts
// Thin wrapper — delegates to packages/ai-engine adapter

import { env } from './env.js';
import type { AnalysisResult } from '../../../packages/ai-engine/src/index.js';

// Lazy import so server starts without the package if not needed
let _analyze: ((code: string, language: string) => Promise<AnalysisResult>) | null = null;

async function getAnalyzer() {
  if (_analyze) return _analyze;
  const { createAdapter } = await import('../../../packages/ai-engine/src/index.js');
  const adapter = createAdapter({
    provider: env.OPENROUTER_API_KEY ? 'openrouter' : 'fallback',
    apiKey: env.OPENROUTER_API_KEY,
    model: env.OPENROUTER_MODEL,
  });
  _analyze = adapter.analyze.bind(adapter);
  return _analyze;
}

export async function analyzeCode(code: string, language: string): Promise<AnalysisResult> {
  const analyze = await getAnalyzer();
  return analyze(code, language);
}
