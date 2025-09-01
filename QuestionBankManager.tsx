import React, { useState, useMemo } from 'react';
import { Question, Domain, DOMAINS } from '../types';

interface QuestionBankViewerProps {
    questions: Question[];
}

const QuestionBankManager: React.FC<QuestionBankViewerProps> = ({ questions }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredQuestions = useMemo(() => {
        if (!searchTerm.trim()) {
            return questions;
        }
        const lowercasedTerm = searchTerm.toLowerCase();
        return questions.filter(q =>
            q.stem.toLowerCase().includes(lowercasedTerm) ||
            q.explanation.toLowerCase().includes(lowercasedTerm) ||
            q.domain.toLowerCase().includes(lowercasedTerm) ||
            q.subtopic.toLowerCase().includes(lowercasedTerm)
        );
    }, [questions, searchTerm]);

    const stats = useMemo(() => {
        const byDomain = questions.reduce((acc, q) => {
            acc[q.domain] = (acc[q.domain] || 0) + 1;
            return acc;
        }, {} as Record<Domain, number>);
        return { count: questions.length, byDomain };
    }, [questions]);


    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 text-center">
                 <h2 className="text-2xl font-bold mb-2">Question Bank Browser</h2>
                 <p className="max-w-prose mx-auto text-slate-600 dark:text-slate-300">
                    Browse and search the official question bank used for the mock exam simulator.
                 </p>
             </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <aside className="lg:col-span-4">
                    <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-bold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">Bank Statistics</h3>
                        {stats && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-semibold">Total Questions:</span>
                                    <span className="font-bold text-sky-600 dark:text-sky-400">{stats.count}</span>
                                </div>
                                <h4 className="font-semibold pt-2">By Domain:</h4>
                                <ul className="text-sm space-y-1">
                                    {DOMAINS.map(domain => {
                                        const count = stats.byDomain[domain] || 0;
                                        if (count === 0) return null;
                                        return (
                                            <li key={domain} className="flex justify-between items-center">
                                                <span>{domain}</span>
                                                <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                    {count}
                                                </span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                 </aside>

                 <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold mb-4">Banked Questions</h3>
                    <div className="relative mb-4">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            placeholder="Search by keyword, domain, or subtopic..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white dark:bg-slate-700 dark:border-slate-600 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                        />
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Showing {filteredQuestions.length} of {questions.length} questions.
                    </div>
                    <div className="mt-4 max-h-[70vh] overflow-y-auto space-y-2 pr-2">
                        {questions.length === 0 ? (
                             <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                <p>The question bank is currently empty or could not be loaded.</p>
                             </div>
                        ) : (
                            filteredQuestions.length > 0 ? (
                                filteredQuestions.map(q => (
                                    <details key={q.id} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg group">
                                        <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
                                            <span className="w-[calc(100%-2rem)]">{q.stem}</span>
                                            <div className="text-slate-500 group-open:rotate-90 transform transition-transform">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </summary>
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                            <div className="space-y-2 mb-4">
                                                {q.options.map((option, index) => (
                                                    <div key={index} className={`flex items-start p-2 rounded ${index === q.correct_index ? 'bg-green-100 dark:bg-green-900/50' : ''}`}>
                                                        <span className={`font-bold mr-2 ${index === q.correct_index ? 'text-green-700 dark:text-green-300' : ''}`}>
                                                            {String.fromCharCode(65 + index)}:
                                                        </span>
                                                        <span>{option}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <h5 className="font-semibold mt-4">Explanation:</h5>
                                            <p className="text-sm italic p-2 bg-sky-50 dark:bg-sky-900/50 border-l-2 border-sky-500 rounded-r-md">{q.explanation}</p>
                                            <div className="text-xs mt-3 flex flex-wrap gap-x-4 gap-y-1">
                                                <span><strong>Domain:</strong> {q.domain}</span>
                                                <span><strong>Subtopic:</strong> {q.subtopic}</span>
                                                <span><strong>Difficulty:</strong> {q.difficulty}</span>
                                            </div>
                                        </div>
                                    </details>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <p>No questions match your search.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionBankManager;