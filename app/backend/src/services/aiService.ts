import axios from 'axios'
import { env } from '../config/env.js'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'
const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'
const OLLAMA_BASE = 'http://localhost:11434/api'

type AIProvider = 'openrouter' | 'deepseek' | 'ollama'
const DEFAULT_PROVIDER: AIProvider = (process.env.AI_PROVIDER as AIProvider) || 'openrouter'
const MODEL_MAPPING = {
    openrouter: 'google/gemini-2.0-flash-001',
    deepseek: 'deepseek-coder',
    ollama: 'deepseek-coder:6.7b'
}

function buildPrompt(code: string, language: string): string {
    return `You are a Senior Principal Engineer at a top-tier FAANG company. 
Analyze the following ${language} code for an interview candidate. 

Focus on:
1. Time and Space Complexity (Big O).
2. Correctness and potential edge cases (e.g., integer overflow, null pointers, empty inputs).
3. Code style, maintainability, and idiomatic ${language} patterns.
4. Hidden performance bottlenecks or memory leaks.

Respond ONLY with a valid JSON object. No markdown, no conversational text.

Code:
\`\`\`${language}
${code}
\`\`\`

JSON Shape:
{
  "timeComplexity": "O(log n) - Binary search pattern",
  "spaceComplexity": "O(1)",
  "correctness": "Description of correctness and identified edge cases",
  "bugs": ["Specific bug 1", "Specific bug 2"],
  "suggestions": ["Refactoring suggestion 1", "Optimization 2"],
  "testCases": [
    { "input": "...", "expectedOutput": "...", "description": "Edge case test" }
  ],
  "codeStyle": "Critique of variable naming, indentation, and structure",
  "overallScore": 8.5,
  "summary": "Concise high-level summary of the candidate's performance."
}`
}

export class AIService {
    static async analyzeCode(code: string, language: string) {
        console.log(`[AI] Analyzing ${language} code via ${DEFAULT_PROVIDER}...`)

        const apiKey = DEFAULT_PROVIDER === 'openrouter' ? env.OPENROUTER_API_KEY : env.DEEPSEEK_API_KEY
        if (!apiKey && DEFAULT_PROVIDER !== 'ollama') {
            console.warn(`[AI] API Key missing for ${DEFAULT_PROVIDER} — returning stub`)
            return stubAnalysis(code, language)
        }

        try {
            let rawResult = ''

            if (DEFAULT_PROVIDER === 'ollama') {
                const { data } = await axios.post(`${OLLAMA_BASE}/generate`, {
                    model: MODEL_MAPPING.ollama,
                    prompt: buildPrompt(code, language),
                    stream: false,
                    format: 'json'
                })
                rawResult = data.response
            } else {
                const endpoint = DEFAULT_PROVIDER === 'deepseek' ? DEEPSEEK_BASE : OPENROUTER_BASE
                const model = MODEL_MAPPING[DEFAULT_PROVIDER]

                const { data } = await axios.post(
                    `${endpoint}/chat/completions`,
                    {
                        model,
                        messages: [{ role: 'user', content: buildPrompt(code, language) }],
                        temperature: 0.15,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 45_000
                    }
                )
                rawResult = data?.choices?.[0]?.message?.content ?? ''
            }

            const jsonText = rawResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            const parsed = JSON.parse(jsonText)

            return {
                timeComplexity: String(parsed.timeComplexity ?? 'Unknown'),
                spaceComplexity: String(parsed.spaceComplexity ?? 'Unknown'),
                correctness: String(parsed.correctness ?? 'Unknown'),
                bugs: Array.isArray(parsed.bugs) ? parsed.bugs.map(String) : [],
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.map(String) : [],
                testCases: Array.isArray(parsed.testCases) ? parsed.testCases.map((tc: any) => `${tc.input} -> ${tc.expectedOutput}`) : [],
                codeStyle: String(parsed.codeStyle ?? ''),
                overallScore: Math.min(10, Math.max(0, Number(parsed.overallScore) || 5)),
                summary: String(parsed.summary ?? ''),
            }
        } catch (err) {
            console.error(`[AI] ${DEFAULT_PROVIDER} provider error:`, err)
            return stubAnalysis(code, language)
        }
    }

    static async generateHint(code: string, language: string, problem: string): Promise<string> {
        const prompt = `You are a technical interviewer. The candidate is solving: "${problem}".
Their current ${language} code:
\`\`\`${language}
${code}
\`\`\`
Provide ONE brief, non-spoiler hint (1-2 sentences max) that nudges the candidate in the right direction without revealing the solution.
Respond ONLY with the hint text — no markdown, no preamble.`

        const apiKey = DEFAULT_PROVIDER === 'openrouter' ? env.OPENROUTER_API_KEY : env.DEEPSEEK_API_KEY
        if (!apiKey && DEFAULT_PROVIDER !== 'ollama') {
            return 'Think about the time complexity of your current approach and whether a different data structure could help.'
        }
        try {
            let hint = ''
            if (DEFAULT_PROVIDER === 'ollama') {
                const { data } = await axios.post(`${OLLAMA_BASE}/generate`, {
                    model: MODEL_MAPPING.ollama,
                    prompt,
                    stream: false,
                })
                hint = data.response?.trim() ?? ''
            } else {
                const endpoint = DEFAULT_PROVIDER === 'deepseek' ? DEEPSEEK_BASE : OPENROUTER_BASE
                const { data } = await axios.post(
                    `${endpoint}/chat/completions`,
                    {
                        model: MODEL_MAPPING[DEFAULT_PROVIDER],
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.4,
                        max_tokens: 120,
                    },
                    {
                        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                        timeout: 20_000,
                    }
                )
                hint = data?.choices?.[0]?.message?.content?.trim() ?? ''
            }
            return hint || 'Consider the edge cases in your algorithm and how the data flows through each step.'
        } catch {
            return 'Think carefully about your loop invariants and base cases.'
        }
    }
}

function stubAnalysis(code: string, language: string) {
    const lines = code.split('\n').length
    return {
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        correctness: 'Analysis unavailable — configure OPENROUTER_API_KEY for real analysis',
        bugs: [],
        suggestions: [
            'Add input validation for edge cases',
            'Consider adding inline comments for complex logic',
        ],
        testCases: [
            { input: 'example', expectedOutput: 'result', description: 'Basic test case' },
        ],
        codeStyle: `${lines}-line ${language} solution with standard conventions`,
        overallScore: 7,
        summary: `This ${language} solution has been submitted for review. Enable AI analysis by setting OPENROUTER_API_KEY in your backend environment.`,
    }
}
