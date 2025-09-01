import React from 'react';
import { Question, Domain, DOMAINS, EXAM_SPEC } from '../types';

interface ExamResultsProps {
  questions: Question[];
  userAnswers: (number | null)[];
  timeTaken: number;
  tabLeaveCount: number;
  onStartReview: () => void;
}

const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

const ExamResults: React.FC<ExamResultsProps> = ({ questions, userAnswers, timeTaken, tabLeaveCount, onStartReview }) => {
    const correctAnswers = userAnswers.filter((answer, index) => answer === questions[index].correct_index).length;
    const incorrectAnswers = questions.length - correctAnswers;
    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= EXAM_SPEC.passPercentage;

    const domainStats: Record<Domain, { correct: number, total: number }> = 
        DOMAINS.reduce((acc, domain) => {
            acc[domain] = { correct: 0, total: 0 };
            return acc;
        }, {} as Record<Domain, { correct: number, total: number }>);

    questions.forEach((question, index) => {
        const domain = question.domain;
        if (domainStats[domain]) {
            domainStats[domain].total++;
            if (userAnswers[index] === question.correct_index) {
                domainStats[domain].correct++;
            }
        }
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8 animate-fade-in w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-2">Exam Results</h1>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Here is a summary of your performance.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-8">
                <div className={`p-4 rounded-lg ${passed ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-300">Status</div>
                    <div className={`text-2xl font-bold ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {passed ? 'Passed' : 'Failed'}
                    </div>
                </div>
                 <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-300">Final Score</div>
                    <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{score.toFixed(1)}%</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-300">Time Taken</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatTime(timeTaken)}</div>
                </div>
            </div>

            {incorrectAnswers > 0 && (
                <div className="text-center mb-8">
                     <button 
                        onClick={onStartReview}
                        className="px-6 py-3 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                        Review {incorrectAnswers} Incorrect Answer{incorrectAnswers > 1 ? 's' : ''}
                    </button>
                </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h2 className="text-xl font-bold mb-4">Performance by Domain</h2>
                <div className="space-y-4">
                    {Object.entries(domainStats).map(([domain, stats]) => {
                        if (stats.total === 0) return null;
                        const accuracy = (stats.correct / stats.total) * 100;
                        const accuracyColor = accuracy >= 75 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500';

                        return (
                            <div key={domain}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{domain}</span>
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        {stats.correct} / {stats.total} ({accuracy.toFixed(0)}%)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                    <div className={`${accuracyColor} h-2.5 rounded-full`} style={{ width: `${accuracy}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {tabLeaveCount > 0 && (
                 <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
                    <h2 className="text-xl font-bold mb-3 text-amber-600 dark:text-amber-400">Proctoring Summary</h2>
                    <div className="bg-amber-50 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-lg" role="alert">
                        <div className="flex items-center">
                            <svg className="fill-current w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01 1.25 1.44 2.37l-7.2 12.96c-.57 1.12-2.31 1.12-2.88 0l-7.2-12.96C-1.18 1.25-.51 0 .83 0h11.6zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-4a1 1 0 01-1-1V6a1 1 0 012 0v3a1 1 0 01-1 1z"/></svg>
                            <span className="font-semibold">Attention:</span>
                            <span className="ml-2">The exam window lost focus <span className="font-bold">{tabLeaveCount}</span> time{tabLeaveCount > 1 ? 's' : ''} during the test.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamResults;