import React, { useState, useEffect, useMemo } from 'react';
import { Question } from '../types';
import ExamSidebar from './ExamSidebar';

interface ExamViewProps {
  questions: Question[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  userAnswers: (number | null)[];
  setUserAnswers: (answers: (number | null)[]) => void;
  flaggedQuestions: boolean[];
  setFlaggedQuestions: (flags: boolean[]) => void;
  finishExam: (leaveCount: number) => void;
  examStartTime: number;
}

// A simple shuffle utility
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};


const AntiCheatNotifier: React.FC<{ leaveCount: number }> = ({ leaveCount }) => {
    if (leaveCount === 0) return null;
    return (
        <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in" role="alert">
            <div className="flex items-center">
                 <svg className="fill-current w-5 h-5 mr-2" xmlns="http://www.w.org/2000/svg" viewBox="0 0 20 20"><path d="M12.432 0c1.34 0 2.01 1.25 1.44 2.37l-7.2 12.96c-.57 1.12-2.31 1.12-2.88 0l-7.2-12.96C-1.18 1.25-.51 0 .83 0h11.6zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-4a1 1 0 01-1-1V6a1 1 0 012 0v3a1 1 0 01-1 1z"/></svg>
                <span className="font-bold">Warning:</span>
                <span className="ml-2">You have switched tabs {leaveCount} time{leaveCount > 1 ? 's' : ''}. This is monitored.</span>
            </div>
        </div>
    )
}

const ExamView: React.FC<ExamViewProps> = ({ 
    questions, 
    currentQuestionIndex, 
    setCurrentQuestionIndex,
    userAnswers,
    setUserAnswers,
    flaggedQuestions,
    setFlaggedQuestions,
    finishExam,
    examStartTime,
}) => {
  const [tabLeaveCount, setTabLeaveCount] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
        if(document.hidden) {
            setTabLeaveCount(count => count + 1);
        }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  
  const { shuffledOptions } = useMemo(() => {
    if (!currentQuestion) return { shuffledOptions: [] };
    const shuffled = shuffleArray(currentQuestion.options);
    return { shuffledOptions: shuffled };
  }, [currentQuestion]);
  

  const handleAnswerSelect = (selectedIndex: number) => {
    const newAnswers = [...userAnswers];
    const originalIndex = currentQuestion.options.indexOf(shuffledOptions[selectedIndex]);
    newAnswers[currentQuestionIndex] = originalIndex;
    setUserAnswers(newAnswers);
  };
  
  const handleToggleFlag = () => {
    const newFlags = [...flaggedQuestions];
    newFlags[currentQuestionIndex] = !newFlags[currentQuestionIndex];
    setFlaggedQuestions(newFlags);
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }
  
  const currentAnswerOriginalIndex = userAnswers[currentQuestionIndex];
  const currentAnswerText = currentAnswerOriginalIndex !== null ? currentQuestion.options[currentAnswerOriginalIndex] : null;
  const currentAnswerShuffledIndex = currentAnswerText !== null ? shuffledOptions.indexOf(currentAnswerText) : -1;

  return (
    <div className="w-full animate-fade-in">
        <AntiCheatNotifier leaveCount={tabLeaveCount} />
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
            {/* Main Question Content */}
            <div className="lg:col-span-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
                    <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                        <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                        <h2 className="mt-2 text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                            {currentQuestion.stem}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {shuffledOptions.map((option, index) => {
                            const isSelected = index === currentAnswerShuffledIndex;
                            return (
                                <label
                                    key={index}
                                    className={`flex items-start p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                                        isSelected
                                        ? 'bg-sky-50 dark:bg-sky-900/50 border-sky-500 ring-2 ring-sky-500'
                                        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-sky-400 dark:hover:border-sky-600'
                                    }`}
                                >
                                    <div className="flex items-center h-6">
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestionIndex}`}
                                            checked={isSelected}
                                            onChange={() => handleAnswerSelect(index)}
                                            className="focus:ring-sky-500 h-4 w-4 text-sky-600 border-slate-300"
                                        />
                                    </div>
                                    <div className="ml-4 text-base">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{option}</span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                    
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-8 flex justify-between items-center">
                        <button 
                            onClick={goToPrev} 
                            disabled={currentQuestionIndex === 0}
                            className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button 
                            onClick={goToNext} 
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>

                </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
                <div className="sticky top-24">
                     <ExamSidebar
                        examStartTime={examStartTime}
                        finishExam={() => finishExam(tabLeaveCount)}
                        questions={questions}
                        currentQuestionIndex={currentQuestionIndex}
                        setCurrentQuestionIndex={setCurrentQuestionIndex}
                        userAnswers={userAnswers}
                        flaggedQuestions={flaggedQuestions}
                        onToggleFlag={handleToggleFlag}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default ExamView;