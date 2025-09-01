import React, { useRef, useEffect } from 'react';

interface QuestionNavigatorProps {
  questionCount: number;
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  flaggedQuestions: boolean[];
  onQuestionSelect: (index: number) => void;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questionCount,
  currentQuestionIndex,
  userAnswers,
  flaggedQuestions,
  onQuestionSelect,
}) => {
  const activeItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Scroll the active question into view if it's not visible
    if (activeItemRef.current) {
        activeItemRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    }
  }, [currentQuestionIndex]);
  

  return (
    <div className="w-full">
       <div 
        className="grid grid-cols-10 gap-2 p-2 max-h-64 overflow-y-auto bg-slate-100 dark:bg-slate-900/50 rounded-lg"
        style={{ scrollbarWidth: 'thin' }}
       >
        {Array.from({ length: questionCount }).map((_, index) => {
          const isCurrent = index === currentQuestionIndex;
          const isAnswered = userAnswers[index] !== null;
          const isFlagged = flaggedQuestions[index];

          let baseClasses = 'w-full h-9 flex-shrink-0 flex items-center justify-center rounded-md font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-sky-500';
          let stateClasses = '';

          if (isCurrent) {
            stateClasses = 'bg-sky-500 text-white scale-110 shadow-lg';
          } else if (isFlagged) {
            stateClasses = isAnswered 
              ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 ring-2 ring-amber-500'
              : 'bg-transparent text-slate-600 dark:text-slate-300 ring-2 ring-amber-500 hover:bg-slate-200 dark:hover:bg-slate-700';
          } else if (isAnswered) {
             stateClasses = 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-400 dark:hover:bg-slate-500';
          } else {
             stateClasses = 'bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
          }
          
          return (
            <button
              key={index}
              ref={isCurrent ? activeItemRef : null}
              onClick={() => onQuestionSelect(index)}
              className={`${baseClasses} ${stateClasses}`}
              aria-label={`Go to question ${index + 1}`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-3 px-1">
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-sky-500 mr-1.5"></span>Current</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 mr-1.5"></span>Answered</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full border-2 border-amber-500 mr-1.5"></span>Flagged</div>
          <div className="flex items-center"><span className="w-3 h-3 rounded-full border-2 border-slate-300 dark:border-slate-500 mr-1.5"></span>Unanswered</div>
      </div>
    </div>
  );
};

export default QuestionNavigator;