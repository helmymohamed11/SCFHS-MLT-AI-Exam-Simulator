import { Question } from '../types';
import { AttemptReport, DomainPerformance, SubtopicPerformance, Recommendation } from './supabaseService';

export interface ExamResponse {
  questionId: string;
  selectedIndex: number | null;
  correct: boolean;
  timeSpentSec: number;
  flagged: boolean;
  skipped: boolean;
  question: Question;
}

export const buildExamReport = (
  responses: ExamResponse[],
  attemptId: string,
  totalTimeSec: number
): AttemptReport => {
  const domainStats = new Map<string, { correct: number; total: number; timeTotal: number }>();
  const subtopicStats = new Map<string, { correct: number; total: number; questionIds: string[] }>();
  const skippedIds: string[] = [];
  const flaggedIds: string[] = [];

  // Process responses
  responses.forEach(response => {
    const domain = response.question.domain;
    const subtopic = response.question.subtopic;

    // Domain statistics
    if (!domainStats.has(domain)) {
      domainStats.set(domain, { correct: 0, total: 0, timeTotal: 0 });
    }
    const domainStat = domainStats.get(domain)!;
    domainStat.total++;
    if (response.correct) domainStat.correct++;
    domainStat.timeTotal += response.timeSpentSec || 0;

    // Subtopic statistics
    if (!subtopicStats.has(subtopic)) {
      subtopicStats.set(subtopic, { correct: 0, total: 0, questionIds: [] });
    }
    const subtopicStat = subtopicStats.get(subtopic)!;
    subtopicStat.total++;
    if (response.correct) subtopicStat.correct++;
    subtopicStat.questionIds.push(response.questionId);

    // Track special cases
    if (response.skipped) skippedIds.push(response.questionId);
    if (response.flagged) flaggedIds.push(response.questionId);
  });

  // Build domain performance
  const domains: DomainPerformance[] = Array.from(domainStats.entries()).map(([name, stats]) => {
    const acc = stats.total > 0 ? stats.correct / stats.total : 0;
    const timeAvgSec = stats.total > 0 ? stats.timeTotal / stats.total : 0;
    
    let bucket: 'weak' | 'mid' | 'good' | 'strong';
    if (acc < 0.5) bucket = 'weak';
    else if (acc < 0.7) bucket = 'mid';
    else if (acc < 0.8) bucket = 'good';
    else bucket = 'strong';

    // Calculate impact (potential points if improved to 70%)
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

  // Generate recommendations
  const recommendations: Recommendation[] = domains
    .filter(d => d.bucket === 'weak')
    .sort((a, b) => (b.impact || 0) - (a.impact || 0))
    .slice(0, 3)
    .map(d => ({
      type: 'drill' as const,
      title: `Intensive Practice: ${d.name}`,
      duration_min: 45,
      domain: d.name,
      count: Math.min(20, d.n),
    }));

  // Calculate overall score
  const totalCorrect = responses.filter(r => r.correct).length;
  const scorePct = responses.length > 0 ? (totalCorrect / responses.length) * 100 : 0;
  const passed = scorePct >= 60;

  return {
    attempt_id: attemptId,
    score_pct: scorePct,
    passed,
    time_total_sec: totalTimeSec,
    domains,
    subtopics_weakest: subtopicsWeakest,
    skipped_ids: skippedIds,
    flagged_ids: flaggedIds,
    recommendations,
    srs_plan: {
      daily_new: Math.max(10, Math.min(25, Math.floor(responses.length * 0.1))),
      review_min: Math.max(15, Math.min(45, Math.floor(totalTimeSec / 60 * 0.2))),
    },
  };
};

export const generateStudyPlan = (report: AttemptReport) => {
  const weakDomains = report.domains.filter(d => d.bucket === 'weak');
  const midDomains = report.domains.filter(d => d.bucket === 'mid');
  
  const priorities = [
    ...weakDomains.slice(0, 2).map(d => ({
      domain: d.name,
      reason: `Low accuracy (${(d.acc * 100).toFixed(1)}%) with high impact potential (+${d.impact} points)`,
      action: `Complete 20 practice questions focusing on weak subtopics`,
    })),
    ...midDomains.slice(0, 1).map(d => ({
      domain: d.name,
      reason: `Moderate performance (${(d.acc * 100).toFixed(1)}%) - can be improved to strong`,
      action: `Review concepts and practice 15 targeted questions`,
    })),
  ];

  const weekPlan = [
    { day: 'Monday', focus: priorities[0]?.domain || 'Review', duration: 45, activity: 'Concept review + 10 practice questions' },
    { day: 'Tuesday', focus: priorities[1]?.domain || 'Practice', duration: 40, activity: 'Drill weak subtopics' },
    { day: 'Wednesday', focus: 'Mixed Review', duration: 35, activity: 'Flashcards + quick quiz' },
    { day: 'Thursday', focus: priorities[0]?.domain || 'Review', duration: 45, activity: 'Advanced practice questions' },
    { day: 'Friday', focus: 'Comprehensive', duration: 50, activity: 'Mixed domain practice test' },
    { day: 'Saturday', focus: 'Review', duration: 30, activity: 'Review flagged questions' },
    { day: 'Sunday', focus: 'Assessment', duration: 60, activity: 'Mini mock exam (50 questions)' },
  ];

  return {
    priorities,
    weekPlan,
    timeTips: [
      'Focus on time management - you spent more time on easier questions',
      'Practice quick elimination of obviously wrong answers',
      'Set a target of 1.2 minutes per question on average',
    ],
  };
};