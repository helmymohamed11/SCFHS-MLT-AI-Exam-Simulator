import React from 'react';
import { Question } from '../types';
import { Clock, Target, TrendingUp, BookOpen } from 'lucide-react';

interface ExamResultsProps {
  questions: Question[];
  userAnswers: (number | null)[];
  timeTaken: number;
  tabLeaveCount: number;
  onStartReview: () => void;
}

const ExamResults: React.FC<ExamResultsProps> = ({
  questions,
  userAnswers,
  timeTaken,
  tabLeaveCount,
  onStartReview,
}) => {
  const totalQuestions = questions.length;
  const answeredQuestions = userAnswers.filter(answer => answer !== null).length;
  const correctAnswers = questions.filter((question, index) => 
    userAnswers[index] !== null && userAnswers[index] === question.correct_index
  ).length;
  
  const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const passed = score >= 60;
  
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Calculate domain breakdown
  const domainStats = new Map<string, { correct: number; total: number }>();
  questions.forEach((question, index) => {
    const domain = question.domain;
    if (!domainStats.has(domain)) {
      domainStats.set(domain, { correct: 0, total: 0 });
    }
    const stats = domainStats.get(domain)!;
    stats.total++;
    if (userAnswers[index] !== null && userAnswers[index] === question.correct_index) {
      stats.correct++;
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Overall Results */}
      <div className="text-center">
        <div className={`text-6xl font-bold mb-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {score.toFixed(1)}%
        </div>
        <div className={`text-2xl font-semibold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed ? 'PASSED' : 'FAILED'}
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {correctAnswers} out of {totalQuestions} questions correct
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 text-center">
          <Clock className="h-8 w-8 text-sky-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatTime(timeTaken)}
          </div>
          <div className="text-sm text-slate-500">Time Taken</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 text-center">
          <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {answeredQuestions}/{totalQuestions}
          </div>
          <div className="text-sm text-slate-500">Questions Answered</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 text-center">
          <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {tabLeaveCount}
          </div>
          <div className="text-sm text-slate-500">Tab Switches</div>
        </div>
      </div>

      {/* Domain Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Domain Performance
        </h2>
        <div className="space-y-4">
          {Array.from(domainStats.entries()).map(([domain, stats]) => {
            const domainScore = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
            return (
              <div key={domain} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {domain}
                    </span>
                    <span className="text-sm text-slate-500">
                      {stats.correct}/{stats.total} ({domainScore.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        domainScore >= 70 ? 'bg-green-500' : 
                        domainScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${domainScore}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onStartReview}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105"
        >
          Review Incorrect Answers
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105"
        >
          Take Another Exam
        </button>
      </div>
    </div>
  );
};

export default ExamResults;