// FILE: apps/web/src/types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
}

export interface AIAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  correctness: number;
  bugs: string[];
  suggestions: string[];
  codeStyle: number;
  overallScore: number;
  summary: string;
  analyzedAt: string;
}

export interface CodeSnapshot {
  content: string;
  language: string;
  timestamp: string;
}

export interface Session {
  _id: string;
  roomId: string;
  problem: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'completed';
  host: User | string;
  participant?: User | string;
  codeSnapshots: CodeSnapshot[];
  aiAnalysis?: AIAnalysis;
  startedAt: string;
  endedAt?: string;
}

export interface Message {
  sender: string;
  text: string;
  ts: number;
}

// AI engine output schema (shared with server)
export interface AnalysisResult {
  summary: string;
  complexity: {
    time: string;
    space: string;
  };
  bugs: string[];
  suggestions: string[];
  style: number;       // 1–10
  tests: string[];     // suggested test cases
  overallScore: number;
}
