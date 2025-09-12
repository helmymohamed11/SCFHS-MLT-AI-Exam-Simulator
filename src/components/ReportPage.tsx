import React, { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, BookOpen, Flag, SkipForward, CheckCircle, XCircle } from 'lucide-react';
import { AttemptReport, getAttemptReport } from '../services/supabaseService';
import ScoreDonut from './charts/ScoreDonut';
import DomainBar from './charts/DomainBar';
import SubtopicHeatmap from './charts/SubtopicHeatmap';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface ReportPageProps {
  attemptId: string;
  onCreateFlashcards: () => void;
  onBackToExam: () => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ attemptId, onCreateFlashcards, onBackToExam }) => {
  const [report, setReport] = useState<AttemptReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const reportData = await getAttemptReport(attemptId);
        setReport(reportData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!report) {
    return <ErrorMessage message="No report data available" />;
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getBucketBadge = (bucket: string) => {
    const colors = {
      weak: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      mid: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      good: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
      strong: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[bucket as keyof typeof colors] || colors.mid}`}>
        {bucket}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
          Your Exam Performance Report
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          A detailed analysis of your mock exam attempt.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <ScoreDonut score={report.score_pct} passed={report.passed} />
          <p className={`mt-4 text-xl font-bold ${report.passed ? 'text-green-500' : 'text-red-500'}`}>
            {report.passed ? 'Passed' : 'Failed'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <Clock className="h-10 w-10 text-sky-500 mb-3" />
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatTime(report.time_total_sec)}
          </span>
          <span className="text-sm font-medium text-slate-500 mt-1">Time Taken</span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <SkipForward className="h-10 w-10 text-amber-500 mb-3" />
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {report.skipped_ids.length}
          </span>
          <span className="text-sm font-medium text-slate-500 mt-1">Questions Skipped</span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
          <Flag className="h-10 w-10 text-indigo-500 mb-3" />
          <span className="text-3xl font-bold text-slate-900 dark:text-white">
            {report.flagged_ids.length}
          </span>
          <span className="text-sm font-medium text-slate-500 mt-1">Questions Flagged</span>
        </div>
      </div>

      {/* Domain Performance */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
          <Target className="h-6 w-6 mr-3 text-sky-500" />
          Domain Performance Analysis
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Your performance across different knowledge domains. Focus on weaker areas to improve your score.
        </p>
        <div className="h-80">
          <DomainBar domains={report.domains} />
        </div>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.domains.map((domain, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-all hover:shadow-md hover:border-sky-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-md text-slate-900 dark:text-white">
                  {domain.name}
                </h3>
                {getBucketBadge(domain.bucket)}
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {(domain.acc * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-500">
                {domain.correct}/{domain.n} correct
              </div>
              {domain.impact && domain.impact > 0 && (
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
                  +{domain.impact} potential points
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weakest Subtopics */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
          <TrendingUp className="h-6 w-6 mr-3 text-amber-500" />
          Top Areas for Improvement
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          These are the subtopics where you had the lowest accuracy. Prioritize these in your study plan.
        </p>
        <SubtopicHeatmap subtopics={report.subtopics_weakest} />
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
            <BookOpen className="h-6 w-6 mr-3 text-green-500" />
            Personalized Study Recommendations
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Based on your performance, here are some targeted activities to boost your score.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {report.recommendations.map((rec, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                  {rec.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-grow">
                  Estimated duration: {rec.duration_min} minutes. Activity type: {rec.type}.
                </p>
                <button className="w-full mt-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors">
                  Start Practice Drill
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onCreateFlashcards}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105"
        >
          Create Flashcards from Incorrect Answers
        </button>
        <button
          onClick={onBackToExam}
          className="px-8 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ReportPage;