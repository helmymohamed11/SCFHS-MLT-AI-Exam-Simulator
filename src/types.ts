export enum Difficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3,
}

export enum Language {
  English = 'en',
  Arabic = 'ar',
}

export type Domain = 
  | 'Clinical Chemistry'
  | 'Hematology'
  | 'Microbiology'
  | 'Blood Bank'
  | 'Immunology'
  | 'Urinalysis & Other Body Fluids'
  | 'Lab Operations'
  | 'Patient Safety & Professionalism'
  | 'Histo/Cyto-Techniques';

export interface Question {
  id: string;
  stem: string;
  options: string[];
  correct_index: number;
  explanation: string;
  domain: Domain;
  subtopic: string;
  difficulty: Difficulty;
  tags: string[];
  image_url?: string;
  refs?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type AppMode = 'single-question' | 'exam' | 'question-bank' | 'review-incorrect';

export type ExamStatus = 'not-started' | 'generating' | 'ready' | 'in-progress' | 'finished';

export const EXAM_SPEC = {
  totalQuestions: 150,
  durationMinutes: 180,
  passingScore: 60,
  domainWeights: {
    'Clinical Chemistry': 0.20,
    'Hematology': 0.20,
    'Microbiology': 0.20,
    'Blood Bank': 0.20,
    'Immunology': 0.10,
    'Urinalysis & Other Body Fluids': 0.05,
    'Lab Operations': 0.03,
    'Patient Safety & Professionalism': 0.02,
  }
};

export interface User {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  password?: string; // Should not be sent to client, but needed for simulation
  role: 'user' | 'admin';
}

export interface AttemptData {
  id: string;
  userId: string;
  examType: string;
  startedAt: string;
  finishedAt?: string;
  scorePct?: number;
  passed?: boolean;
  timeTotalSec?: number;
  breakdownJson?: any;
  tabLeaveCount: number;
}

export interface ResponseData {
  id: string;
  attemptId: string;
  questionId: string;
  selectedIndex?: number;
  correct: boolean;
  timeSpentSec?: number;
  flagged: boolean;
  skipped: boolean;
  confidence?: number;
}