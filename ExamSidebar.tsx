import React from 'react';
import { Question, EXAM_SPEC } from '../types';
import ExamTimer from './ExamTimer';
import QuestionNavigator from './QuestionNavigator';

interface ExamSidebarProps {
    examStartTime: number;
    finishExam: () => void;
    questions: Question[];
    currentQuestionIndex: number;
    setCurrentQuestionIndex: (index: number) => void;
    userAnswers: (number | null)[];
    flaggedQuestions: boolean[];
    onToggleFlag: () => void;
}

const ExamSidebar: React.FC<ExamSidebarProps> = ({
    examStartTime,
    finishExam,
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    userAnswers,
    flaggedQuestions,
    onToggleFlag,
}) => {

    const isCurrentFlagged = flaggedQuestions[currentQuestionIndex];

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-center mb-2 text-slate-700 dark:text-slate-200">Time Remaining</h3>
                <div className="flex justify-center">
                    <ExamTimer 
                        examStartTime={examStartTime} 
                        durationInMinutes={EXAM_SPEC.durationMinutes} 
                        onTimeUp={finishExam} 
                    />
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
                <h3 className="font-bold text-center mb-4 text-slate-700 dark:text-slate-200">Question Navigator</h3>
                 <QuestionNavigator 
                    questionCount={questions.length}
                    currentQuestionIndex={currentQuestionIndex}
                    userAnswers={userAnswers}
                    flaggedQuestions={flaggedQuestions}
                    onQuestionSelect={setCurrentQuestionIndex}
                />
            </div>
            
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 space-y-4">
                 <button 
                    onClick={onToggleFlag}
                    className={`w-full px-5 py-3 border rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    isCurrentFlagged 
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900' 
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-3.13L5 18V4z" />
                    </svg>
                    {isCurrentFlagged ? 'Unflag Question' : 'Flag for Review'}
                </button>

                 <button 
                    onClick={finishExam}
                    className="w-full px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                    Finish Exam
                </button>
             </div>

        </div>
    );
}

export default ExamSidebar;