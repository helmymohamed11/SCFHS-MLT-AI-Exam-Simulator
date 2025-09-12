import React, { useState } from 'react';
import { Question } from '../types';
import { ChevronLeft, ChevronRight, X, BookOpen } from 'lucide-react';

interface IncorrectReviewItem {
  question: Question;
  userAnswer: number;
}

interface IncorrectReviewViewProps {
  incorrectItems: IncorrectReviewItem[];
  onExit: () => void;
}

const IncorrectReviewView: React.FC<IncorrectReviewViewProps> = ({
  incorrectItems,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (incorrectItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Perfect Score!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          You answered all questions correctly. Great job!
        </p>
        <button
          onClick={onExit}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-colors"
        >
          Back to Results
        </button>
      </div>
    );
  }

  const currentItem = incorrectItems[currentIndex];
  const { question, userAnswer } = currentItem;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Review Incorrect Answers
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Question {currentIndex + 1} of {incorrectItems.length}
          </p>
        </div>
        <button
          onClick={onExit}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          title="Exit review"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div
          className="bg-sky-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / incorrectItems.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8">
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <span className="px-3 py-1 bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 rounded-full text-sm font-medium">
              {question.domain}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full text-sm">
              {question.subtopic}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm">
              {question.difficulty}
            </span>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed">{question.stem}</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correct_index;
            const isUserAnswer = index === userAnswer;
            
            let className = 'w-full text-left p-4 rounded-lg border-2 ';
            
            if (isCorrect) {
              className += 'border-green-500 bg-green-50 dark:bg-green-900/20';
            } else if (isUserAnswer) {
              className += 'border-red-500 bg-red-50 dark:bg-red-900/20';
            } else {
              className += 'border-slate-200 dark:border-slate-700';
            }

            return (
              <div key={index} className={className}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <span className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCorrect && (
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                        ✓ Correct
                      </span>
                    )}
                    {isUserAnswer && !isCorrect && (
                      <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                        ✗ Your Answer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <BookOpen className="h-5 w-5 text-slate-600 dark:text-slate-400 mr-2" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Explanation
            </h3>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p>{question.explanation}</p>
          </div>
          
          {question.refs && question.refs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                References:
              </h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                {question.refs.map((ref, index) => (
                  <li key={index}>• {ref}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </button>

        <div className="text-sm text-slate-500">
          {currentIndex + 1} of {incorrectItems.length}
        </div>

        <button
          onClick={() => setCurrentIndex(Math.min(incorrectItems.length - 1, currentIndex + 1))}
          disabled={currentIndex === incorrectItems.length - 1}
          className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default IncorrectReviewView;