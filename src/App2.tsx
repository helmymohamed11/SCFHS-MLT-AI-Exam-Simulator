import React, { useState, useCallback, useEffect } from 'react';
import { Question, User, ExamStatus } from './types';
import * as supabaseService from './services/supabaseService';
import EnhancedExamView from './components/EnhancedExamView';
import EnhancedAuthView from './components/EnhancedAuthView';

const EXAM_PROGRESS_KEY = 'examProgress';

// A simple shuffle function
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const App2: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // General App State
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Exam Mode State
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [shuffledExamQuestions, setShuffledExamQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [examStatus, setExamStatus] = useState<ExamStatus>('not-started');
  const [examStartTime, setExamStartTime] = useState<number | null>(null);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await supabaseService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };

    checkAuth();
  }, []);

  // Load questions for the exam
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const questions = await supabaseService.getQuestions();
        setExamQuestions(questions);
      } catch (e) {
        console.error("Could not load questions:", e);
        setError("Could not load exam questions.");
      }
      setIsLoading(false);
    };
    if (currentUser) {
      loadQuestions();
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    supabaseService.signOut();
    setCurrentUser(null);
    // Reset exam state to avoid showing another user's progress
    setExamStatus('not-started');
    setShuffledExamQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setFlaggedQuestions([]);
  };

  const startExam = () => {
    if (!currentUser) return;

    // Subscription check
    if (currentUser.subscription_tier === 'paid') {
      const now = new Date();
      const endDate = currentUser.subscription_end_date ? new Date(currentUser.subscription_end_date) : null;
      if (!endDate || now > endDate) {
        setError("Your paid subscription has expired. Please renew to continue.");
        return;
      }
    }

    localStorage.removeItem(EXAM_PROGRESS_KEY);

    // Create attempt in database
    const createAttemptAndStart = async () => {
      try {
        const attemptId = await supabaseService.createAttempt('full-exam');
        setCurrentAttemptId(attemptId);
      } catch (error) {
        console.error('Failed to create attempt:', error);
      }
    };

    createAttemptAndStart();

    const shuffled = shuffleArray(examQuestions);
    setShuffledExamQuestions(shuffled);
    setUserAnswers(new Array(shuffled.length).fill(null));
    setCurrentQuestionIndex(0);
    setExamStatus('in-progress');
    setExamStartTime(Date.now());
  };

  const finishExam = useCallback(async () => {
    setExamStatus('finished');
    localStorage.removeItem(EXAM_PROGRESS_KEY);
  }, []);

  // --- RENDER LOGIC --- //

  if (!currentUser) {
    return <EnhancedAuthView onLoginSuccess={handleLoginSuccess} />;
  }

  const renderExamMode = () => {
    if (examStatus === 'in-progress' && examStartTime) {
      return <EnhancedExamView
                user={currentUser}
                questions={shuffledExamQuestions}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
                flaggedQuestions={flaggedQuestions}
                setFlaggedQuestions={setFlaggedQuestions}
                finishExam={finishExam}
                examStartTime={examStartTime}
                attemptId={currentAttemptId}
             />
    }

    // Fallback for 'not-started' or other states
    return (
        <div className="text-center">
            <button
                onClick={startExam}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105"
                disabled={isLoading || examQuestions.length === 0}
            >
                {isLoading ? 'Loading...' : 'Start Mock Exam'}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">SCFHS MLT AI Tutor</h1>
        <div className="flex items-center space-x-4">
          <button onClick={handleLogout} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-500">
            Logout
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {renderExamMode()}
        </div>
      </main>
    </div>
  );
};

export default App2;
