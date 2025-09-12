import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, BookOpen } from 'lucide-react';

interface QuestionDisplayProps {
  question: Question;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const getOptionClass = (index: number) => {
    if (selectedAnswer === null) {
      return 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50';
    }
    
    if (index === question.correct_index) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }
    
    if (index === selectedAnswer && index !== question.correct_index) {
      return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    }
    
    return 'border-slate-200 dark:border-slate-700 opacity-60';
  };

  const getOptionIcon = (index: number) => {
    if (selectedAnswer === null) return null;
    
    if (index === question.correct_index) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    if (index === selectedAnswer && index !== question.correct_index) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
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

      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            disabled={selectedAnswer !== null}
            className={`
              w-full text-left p-4 rounded-lg border-2 transition-all
              ${getOptionClass(index)}
              ${selectedAnswer === null ? 'cursor-pointer' : 'cursor-default'}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <span className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
              </div>
              {getOptionIcon(index)}
            </div>
          </button>
        ))}
      </div>

      {showExplanation && (
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
      )}
    </div>
  );
};

export default QuestionDisplay;