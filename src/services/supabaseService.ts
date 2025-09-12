import { supabase } from '../lib/supabase';
import { Question, User, Domain, Difficulty } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface AttemptReport {
  attempt_id: string;
  score_pct: number;
  passed: boolean;
  time_total_sec: number;
  domains: DomainPerformance[];
  subtopics_weakest: SubtopicPerformance[];
  skipped_ids: string[];
  flagged_ids: string[];
  recommendations: Recommendation[];
  srs_plan: SRSPlan;
}

export interface DomainPerformance {
  name: string;
  n: number;
  correct: number;
  acc: number;
  time_avg_sec: number;
  bucket: 'weak' | 'mid' | 'good' | 'strong';
  impact?: number;
}

export interface SubtopicPerformance {
  name: string;
  acc: number;
  items: string[];
}

export interface Recommendation {
  type: 'read' | 'drill' | 'review';
  title: string;
  duration_min: number;
  domain?: string;
  subtopic?: string;
  count?: number;
}

export interface SRSPlan {
  daily_new: number;
  review_min: number;
}

// Auth functions
export const signUp = async (email: string, password: string, userData: Partial<User>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: userData.email!,
        name: userData.name!,
        age: userData.age!,
        phone: userData.phone!,
        role: 'user',
        subscription_tier: 'free',
        subscription_end_date: null,
      });

    if (profileError) throw profileError;
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    phone: profile.phone,
    email: profile.email,
    role: profile.role,
    subscription_tier: profile.subscription_tier,
    subscription_end_date: profile.subscription_end_date,
  };
};

export const updateUserSubscription = async (userId: string, tier: 'free' | 'paid', endDate: string | null) => {
  const { data, error } = await supabase
    .from('users')
    .update({ subscription_tier: tier, subscription_end_date: endDate })
    .eq('id', userId);

  if (error) throw error;
  return data;
};

// Question functions
export const getQuestions = async (): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(q => ({
    id: q.id,
    stem: q.stem,
    options: q.options,
    correct_index: q.correct_index,
    explanation: q.explanation,
    domain: q.domain as Domain,
    subtopic: q.subtopic,
    difficulty: q.difficulty === 1 ? Difficulty.Easy : q.difficulty === 2 ? Difficulty.Medium : Difficulty.Hard,
    tags: q.tags || [],
    refs: q.refs || [],
  }));
};

export const addQuestion = async (question: Omit<Question, 'id'>, userId: string): Promise<Question> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const questionData = {
    id: uuidv4(),
    stem: question.stem,
    options: question.options,
    correct_index: question.correct_index,
    explanation: question.explanation,
    domain: question.domain,
    subtopic: question.subtopic,
    difficulty: question.difficulty === Difficulty.Easy ? 1 : question.difficulty === Difficulty.Medium ? 2 : 3,
    tags: question.tags || [],
    refs: question.refs || [],
    image_url: null,
    is_active: true,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from('questions')
    .insert(questionData)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    stem: data.stem,
    options: data.options,
    correct_index: data.correct_index,
    explanation: data.explanation,
    domain: data.domain as Domain,
    subtopic: data.subtopic,
    difficulty: data.difficulty === 1 ? Difficulty.Easy : data.difficulty === 2 ? Difficulty.Medium : Difficulty.Hard,
    tags: data.tags || [],
    refs: data.refs || [],
  };
};

export const updateQuestion = async (questionId: string, question: Partial<Omit<Question, 'id'>>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const questionData = {
    ...question,
    difficulty: question.difficulty === Difficulty.Easy ? 1 : question.difficulty === Difficulty.Medium ? 2 : 3,
  };

  const { data, error } = await supabase
    .from('questions')
    .update(questionData)
    .eq('id', questionId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteQuestion = async (questionId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('questions')
    .update({ is_active: false })
    .eq('id', questionId);

  if (error) throw error;
  return data;
};


// Attempt functions
export const createAttempt = async (examType: string): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('attempts')
    .insert({
      id: uuidv4(),
      user_id: user.id,
      exam_type: examType,
      started_at: new Date().toISOString(),
      tab_leave_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const finishAttempt = async (
  attemptId: string,
  scorePct: number,
  passed: boolean,
  timeTotalSec: number,
  tabLeaveCount: number,
  breakdownJson?: any
) => {
  const { error } = await supabase
    .from('attempts')
    .update({
      finished_at: new Date().toISOString(),
      score_pct: scorePct,
      passed,
      time_total_sec: timeTotalSec,
      tab_leave_count: tabLeaveCount,
      breakdown_json: breakdownJson,
    })
    .eq('id', attemptId);

  if (error) throw error;
};

export const saveResponse = async (
  attemptId: string,
  questionId: string,
  selectedIndex: number | null,
  correct: boolean,
  timeSpentSec: number | null,
  flagged: boolean = false,
  skipped: boolean = false,
  confidence: number | null = null
) => {
  const { error } = await supabase
    .from('responses')
    .insert({
      id: uuidv4(),
      attempt_id: attemptId,
      question_id: questionId,
      selected_index: selectedIndex,
      correct,
      time_spent_sec: timeSpentSec,
      flagged,
      skipped,
      confidence,
    });

  if (error) throw error;
};

export const getAttemptReport = async (attemptId: string): Promise<AttemptReport> => {
  // Get attempt details
  const { data: attempt, error: attemptError } = await supabase
    .from('attempts')
    .select('*')
    .eq('id', attemptId)
    .single();

  if (attemptError) throw attemptError;

  // Get responses with question details
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select(`
      *,
      questions (
        domain,
        subtopic,
        difficulty
      )
    `)
    .eq('attempt_id', attemptId);

  if (responsesError) throw responsesError;

  // Calculate domain performance
  const domainStats = new Map<string, { correct: number; total: number; timeTotal: number }>();
  const subtopicStats = new Map<string, { correct: number; total: number; questionIds: string[] }>();
  const skippedIds: string[] = [];
  const flaggedIds: string[] = [];

  responses.forEach(response => {
    const domain = response.questions?.domain || 'Unknown';
    const subtopic = response.questions?.subtopic || 'Unknown';

    // Domain stats
    if (!domainStats.has(domain)) {
      domainStats.set(domain, { correct: 0, total: 0, timeTotal: 0 });
    }
    const domainStat = domainStats.get(domain)!;
    domainStat.total++;
    if (response.correct) domainStat.correct++;
    domainStat.timeTotal += response.time_spent_sec || 0;

    // Subtopic stats
    if (!subtopicStats.has(subtopic)) {
      subtopicStats.set(subtopic, { correct: 0, total: 0, questionIds: [] });
    }
    const subtopicStat = subtopicStats.get(subtopic)!;
    subtopicStat.total++;
    if (response.correct) subtopicStat.correct++;
    subtopicStat.questionIds.push(response.question_id);

    // Track skipped and flagged
    if (response.skipped) skippedIds.push(response.question_id);
    if (response.flagged) flaggedIds.push(response.question_id);
  });

  // Build domain performance array
  const domains: DomainPerformance[] = Array.from(domainStats.entries()).map(([name, stats]) => {
    const acc = stats.total > 0 ? stats.correct / stats.total : 0;
    const timeAvgSec = stats.total > 0 ? stats.timeTotal / stats.total : 0;
    
    let bucket: 'weak' | 'mid' | 'good' | 'strong';
    if (acc < 0.5) bucket = 'weak';
    else if (acc < 0.7) bucket = 'mid';
    else if (acc < 0.8) bucket = 'good';
    else bucket = 'strong';

    const impact = bucket === 'weak' ? Math.ceil(Math.max(0, 0.7 - acc) * stats.total * 100 / responses.length) : 0;

    return {
      name,
      n: stats.total,
      correct: stats.correct,
      acc,
      time_avg_sec: timeAvgSec,
      bucket,
      impact,
    };
  });

  // Build weakest subtopics
  const subtopicsWeakest: SubtopicPerformance[] = Array.from(subtopicStats.entries())
    .map(([name, stats]) => ({
      name,
      acc: stats.total > 0 ? stats.correct / stats.total : 0,
      items: stats.questionIds,
    }))
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 5);

  // Generate basic recommendations
  const recommendations: Recommendation[] = domains
    .filter(d => d.bucket === 'weak')
    .slice(0, 3)
    .map(d => ({
      type: 'drill' as const,
      title: `Focus on ${d.name}`,
      duration_min: 45,
      domain: d.name,
      count: Math.min(20, d.n),
    }));

  return {
    attempt_id: attemptId,
    score_pct: attempt.score_pct || 0,
    passed: attempt.passed || false,
    time_total_sec: attempt.time_total_sec || 0,
    domains,
    subtopics_weakest: subtopicsWeakest,
    skipped_ids: skippedIds,
    flagged_ids: flaggedIds,
    recommendations,
    srs_plan: {
      daily_new: 15,
      review_min: 25,
    },
  };
};