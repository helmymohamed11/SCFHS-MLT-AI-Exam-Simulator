import React, { useState, useEffect } from 'react';
import { Clock, Target, TrendingUp, BookOpen, Flag, SkipForward } from 'lucide-react';
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
      mid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      good: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      strong: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[bucket as keyof typeof colors] || colors.mid}`}>
        {bucket}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Exam Results
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Detailed analysis of your performance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 text-center">
          <ScoreDonut score={report.score_pct} passed={report.passed} />
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-500">Time Taken</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatTime(report.time_total_sec)}
          </div>
          <div className="text-sm text-slate-500">
            of 3 hours
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <SkipForward className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-500">Skipped</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {report.skipped_ids.length}
          </div>
          <div className="text-sm text-slate-500">
            questions
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <Flag className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-500">Flagged</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {report.flagged_ids.length}
          </div>
          <div className="text-sm text-slate-500">
            for review
          </div>
        </div>
      </div>

      {/* Domain Performance */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Domain Performance
        </h2>
        <DomainBar domains={report.domains} />
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.domains.map((domain, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  {domain.name}
                </h3>
                {getBucketBadge(domain.bucket)}
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {(domain.acc * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-500">
                {domain.correct}/{domain.n} correct
              </div>
              {domain.impact && domain.impact > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  +{domain.impact} points potential
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weakest Subtopics */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Areas for Improvement
        </h2>
        <SubtopicHeatmap subtopics={report.subtopics_weakest} />
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Study Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.recommendations.map((rec, index) => (
              <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {rec.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {rec.duration_min} minutes • {rec.type}
                </p>
                <button className="w-full px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-md transition-colors">
                  Start Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onCreateFlashcards}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105"
        >
          Create Flashcards from Incorrect
        </button>
        <button
          onClick={onBackToExam}
          className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105"
        >
          Back to Exam Menu
        </button>
      </div>
    </div>
  );
};

export default ReportPage;