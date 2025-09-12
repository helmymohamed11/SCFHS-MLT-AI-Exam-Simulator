import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Flag, ChevronLeft, ChevronRight, Grid3X3, AlertTriangle } from 'lucide-react';
import { Question, User } from '../types';
import { saveResponse } from '../services/supabaseService';

interface EnhancedExamViewProps {
  user: User;
  questions: Question[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  userAnswers: (number | null)[];
  setUserAnswers: (answers: (number | null)[]) => void;
  flaggedQuestions: boolean[];
  setFlaggedQuestions: (flagged: boolean[]) => void;
  finishExam: (tabLeaveCount: number) => void;
  examStartTime: number;
  attemptId?: string;
}

const EnhancedExamView: React.FC<EnhancedExamViewProps> = ({
  user,
  questions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  userAnswers,
  setUserAnswers,
  flaggedQuestions,
  setFlaggedQuestions,
  finishExam,
  examStartTime,
  attemptId,
}) => {
  const examDuration = user.subscription_tier === 'free' ? 30 * 60 : 180 * 60; // 30 mins for free, 180 for paid
  const [timeRemaining, setTimeRemaining] = useState<number>(examDuration);
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [tabLeaveCount, setTabLeaveCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - examStartTime) / 1000);
      const remaining = Math.max(0, examDuration - elapsed);
      setTimeRemaining(remaining);

      // Show warnings at 10, 5, and 1 minute for free tier
      if (user.subscription_tier === 'free') {
        if (remaining === 10 * 60 || remaining === 5 * 60 || remaining === 1 * 60) {
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 5000);
        }
      } else {
        // Show warnings at 30, 10, and 5 minutes for paid tier
        if (remaining === 30 * 60 || remaining === 10 * 60 || remaining === 5 * 60) {
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 5000);
        }
      }

      if (remaining === 0) {
        finishExam(tabLeaveCount);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [examStartTime, finishExam, tabLeaveCount, examDuration, user.subscription_tier]);

  // Tab visibility tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabLeaveCount(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Reset question start time when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswerSelect = useCallback(async (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);

    // Save response to database if attemptId is available
    if (attemptId && currentQuestion.id) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const isCorrect = answerIndex === currentQuestion.correct_index;
      
      try {
        await saveResponse(
          attemptId,
          currentQuestion.id.toString(),
          answerIndex,
          isCorrect,
          timeSpent,
          flaggedQuestions[currentQuestionIndex],
          false // not skipped since they answered
        );
      } catch (error) {
        console.error('Failed to save response:', error);
      }
    }
  }, [userAnswers, setUserAnswers, currentQuestionIndex, attemptId, currentQuestion, questionStartTime, flaggedQuestions]);

  const handleFlagToggle = useCallback(() => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestionIndex] = !newFlagged[currentQuestionIndex];
    setFlaggedQuestions(newFlagged);
  }, [flaggedQuestions, setFlaggedQuestions, currentQuestionIndex]);

  const handleSkipQuestion = useCallback(async () => {
    // Save as skipped response
    if (attemptId && currentQuestion.id) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      
      try {
        await saveResponse(
          attemptId,
          currentQuestion.id.toString(),
          null, // no answer selected
          false, // not correct
          timeSpent,
          flaggedQuestions[currentQuestionIndex],
          true // skipped
        );
      } catch (error) {
        console.error('Failed to save skipped response:', error);
      }
    }

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [attemptId, currentQuestion, questionStartTime, flaggedQuestions, currentQuestionIndex, questions.length, setCurrentQuestionIndex]);

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (examDuration <= 30 * 60) { // For free tier, don't show hours
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const warningTime = user.subscription_tier === 'free' ? 5 * 60 : 30 * 60;
    const criticalTime = user.subscription_tier === 'free' ? 1 * 60 : 5 * 60;
    if (timeRemaining <= criticalTime) return 'text-red-600 animate-pulse';
    if (timeRemaining <= warningTime) return 'text-amber-600';
    return 'text-slate-600 dark:text-slate-400';
  };

  const answeredCount = userAnswers.filter(answer => answer !== null).length;
  const flaggedCount = flaggedQuestions.filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Time Warning Modal */}
      {showTimeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
              <h3 className="text-lg font-semibold">Time Warning</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You have {Math.floor(timeRemaining / 60)} minutes remaining!
            </p>
            <button
              onClick={() => setShowTimeWarning(false)}
              className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-green-600">Answered: {answeredCount}</span>
              <span className="text-amber-600">Flagged: {flaggedCount}</span>
              {tabLeaveCount > 0 && (
                <span className="text-red-600">Tab leaves: {tabLeaveCount}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center font-mono text-2xl font-bold ${getTimeColor()}`}>
              <Clock className="h-6 w-6 mr-2" />
              {formatTimeRemaining(timeRemaining)}
            </div>
            <button
              onClick={() => setShowQuestionGrid(!showQuestionGrid)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              title="Question Navigator"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Question Grid */}
      {showQuestionGrid && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => {
              const isAnswered = userAnswers[index] !== null;
              const isFlagged = flaggedQuestions[index];
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`
                    relative w-10 h-10 text-sm font-medium rounded-md transition-all
                    ${isCurrent 
                      ? 'bg-sky-600 text-white ring-2 ring-sky-300' 
                      : isAnswered 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400'
                    }
                  `}
                >
                  {index + 1}
                  {isFlagged && (
                    <Flag className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Question Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 rounded-full text-sm font-medium">
              {currentQuestion.domain}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 rounded-full text-sm">
              {currentQuestion.subtopic}
            </span>
          </div>
          <button
            onClick={handleFlagToggle}
            className={`p-2 rounded-md transition-colors ${
              flaggedQuestions[currentQuestionIndex]
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400'
                : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400'
            }`}
            title={flaggedQuestions[currentQuestionIndex] ? 'Remove flag' : 'Flag for review'}
          >
            <Flag className="h-5 w-5" />
          </button>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
          <p className="text-lg leading-relaxed">{currentQuestion.stem}</p>
        </div>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${userAnswers[currentQuestionIndex] === index
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }
              `}
            >
              <div className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSkipQuestion}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Skip
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={() => finishExam(tabLeaveCount)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors"
              >
                Finish Exam
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                className="flex items-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Progress
          </span>
          <span className="text-sm text-slate-500">
            {answeredCount}/{questions.length} answered
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-sky-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedExamView;