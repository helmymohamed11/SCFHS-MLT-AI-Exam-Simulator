import React from 'react';
import { Question } from '../types';

interface QuestionDisplayProps {
  question: Question;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  return (
    <div className="w-full max-w-3xl text-left animate-fade-in">
      <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6 leading-relaxed">
        {question.stem}
      </h2>

      <div className="space-y-4 mb-8">
        {question.options.map((option, index) => {
          const isCorrect = index === question.correct_index;
          const optionChar = String.fromCharCode(65 + index); // A, B, C, D

          return (
            <div
              key={index}
              className={`flex items-start p-4 border rounded-lg transition-colors ${
                isCorrect
                  ? 'bg-green-50 dark:bg-green-900/50 border-green-500 dark:border-green-700'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold text-sm ${
                  isCorrect
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200'
                }`}
              >
                {optionChar}
              </div>
              <p className="flex-grow text-slate-700 dark:text-slate-200">{option}</p>
              {isCorrect && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-500 ml-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
          Explanation
        </h3>
        <div className="p-4 bg-sky-50 dark:bg-sky-900/50 border-l-4 border-sky-500 rounded-r-lg">
          <p className="text-slate-700 dark:text-slate-300">
            {question.explanation}
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
          Question Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <p className="font-semibold text-slate-600 dark:text-slate-300">Domain</p>
            <p className="text-slate-800 dark:text-slate-100">{question.domain}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <p className="font-semibold text-slate-600 dark:text-slate-300">Subtopic</p>
            <p className="text-slate-800 dark:text-slate-100">{question.subtopic}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <p className="font-semibold text-slate-600 dark:text-slate-300">Difficulty</p>
            <p className="text-slate-800 dark:text-slate-100">{question.difficulty}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <p className="font-semibold text-slate-600 dark:text-slate-300">Tags</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {question.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <p className="font-semibold text-slate-600 dark:text-slate-300">References</p>
            <ul className="list-disc list-inside mt-1 space-y-1 text-slate-800 dark:text-slate-100">
              {question.refs.map((ref, index) => (
                <li key={index}>{ref}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplay;
