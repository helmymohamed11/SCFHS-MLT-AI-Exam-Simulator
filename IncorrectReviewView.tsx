import React, { useState } from 'react';
import { Question } from '../types';

interface IncorrectReviewItem {
  question: Question;
  userAnswer: number;
}

interface IncorrectReviewViewProps {
  incorrectItems: IncorrectReviewItem[];
  onExit: () => void;
}

const IncorrectReviewView: React.FC<IncorrectReviewViewProps> = ({ incorrectItems, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (incorrectItems.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">No incorrect answers to review!</h2>
        <button onClick={onExit} className="px-6 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700">
          Back to Results
        </button>
      </div>
    );
  }

  const { question, userAnswer } = incorrectItems[currentIndex];
  const { stem, options, correct_index, explanation } = question;

  const goToNext = () => {
    if (currentIndex < incorrectItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6 animate-fade-in w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Reviewing Incorrect Answers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Question {currentIndex + 1} of {incorrectItems.length}
          </p>
        </div>
        <button onClick={onExit} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            Exit Review
        </button>
      </div>

      <div className="px-2">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6 leading-relaxed">
            {stem}
        </h2>

        <div className="space-y-4 mb-8">
            {options.map((option, index) => {
                const isCorrect = index === correct_index;
                const isUserChoice = index === userAnswer;
                
                let optionStyle = 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600';
                if (isCorrect) {
                    optionStyle = 'bg-green-50 dark:bg-green-900/50 border-green-500 dark:border-green-700';
                } else if (isUserChoice) {
                    optionStyle = 'bg-red-50 dark:bg-red-900/50 border-red-500 dark:border-red-700';
                }

                return (
                    <div
                        key={index}
                        className={`flex items-start p-4 border rounded-lg transition-colors ${optionStyle}`}
                    >
                         <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-4">
                           {isCorrect && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                           )}
                           {isUserChoice && !isCorrect && (
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                               </svg>
                           )}
                        </div>
                        <p className="flex-grow text-slate-700 dark:text-slate-200">{option}</p>
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
                {explanation}
            </p>
            </div>
        </div>
      </div>

       <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-6 flex justify-between items-center">
            <button 
                onClick={goToPrev} 
                disabled={currentIndex === 0}
                className="px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Previous
            </button>
            <button 
                onClick={goToNext} 
                disabled={currentIndex === incorrectItems.length - 1}
                className="px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Next
            </button>
      </div>
    </div>
  );
};

export default IncorrectReviewView;
