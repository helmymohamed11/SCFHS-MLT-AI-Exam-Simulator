import React, { useState, useCallback, useEffect } from 'react';
import { Question, Difficulty, Language, Domain, AppMode, ExamStatus, EXAM_SPEC, User } from './types';
import { generateQuestion, generateFullExam } from './services/geminiService';
import * as db from './services/database';
import * as auth from './services/authService';
import QuestionGeneratorForm from './components/QuestionGeneratorForm';
import QuestionDisplay from './components/QuestionDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ExamView from './components/ExamView';
import ExamResults from './components/ExamResults';
import QuestionBankManager from './components/QuestionBankManager';
import IncorrectReviewView from './components/IncorrectReviewView';
import AuthView from './components/AuthView';
import AdminDashboard from './components/AdminDashboard';


const EXAM_PROGRESS_KEY = 'examProgress';

// A simple shuffle utility
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

interface IncorrectReviewItem {
  question: Question;
  userAnswer: number;
}


const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.getCurrentUser());

  // General App State
  const [mode, setMode] = useState<AppMode>('single-question');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Single Question State
  const [domain, setDomain] = useState<Domain>('Hematology');
  const [subtopic, setSubtopic] = useState<string>('Coagulation');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);
  const [language, setLanguage] = useState<Language>(Language.English);
  const [generatedQuestion, setGeneratedQuestion] = useState<Question | null>(null);
  
  // Full Exam State
  const [examStatus, setExamStatus] = useState<ExamStatus>('not-started');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [shuffledExamQuestions, setShuffledExamQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>([]);
  const [generationProgress, setGenerationProgress] = useState({ generated: 0, total: EXAM_SPEC.totalQuestions, domain: '' });
  const [examStartTime, setExamStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [tabLeaveCount, setTabLeaveCount] = useState<number>(0);

  // Question Bank State
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);

  // Review Incorrect State
  const [incorrectReviewItems, setIncorrectReviewItems] = useState<IncorrectReviewItem[]>([]);
  
  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };
  
  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    // Reset exam state to avoid showing another user's progress
    setExamStatus('not-started');
    setExamQuestions([]);
    setGeneratedQuestion(null);
    setError(null);
    setMode('single-question');
    localStorage.removeItem(EXAM_PROGRESS_KEY);
  };


  // Function to load bank stats
  const loadBankQuestions = useCallback(async () => {
    try {
      const allQuestions = await db.getBankQuestions();
      setBankQuestions(allQuestions);
    } catch (e) {
      console.error("Could not load question bank:", e);
      setError("Could not load the shared question bank. Please check your connection or contact support.");
    }
  }, []);

  // Load progress and bank stats from local storage on initial mount
  useEffect(() => {
    if (!currentUser) return; // Don't run effects if logged out

    loadBankQuestions();
    try {
      const savedProgress = localStorage.getItem(EXAM_PROGRESS_KEY);
      if (savedProgress) {
        const { shuffledExamQuestions, userAnswers, flaggedQuestions, currentQuestionIndex, examStartTime, examStatus } = JSON.parse(savedProgress);
        
        if (examStatus === 'in-progress' && examStartTime) {
            const elapsedTime = Date.now() - examStartTime;
            if (elapsedTime < EXAM_SPEC.durationMinutes * 60 * 1000) {
              setMode('exam');
              setShuffledExamQuestions(shuffledExamQuestions);
              setUserAnswers(userAnswers);
              setFlaggedQuestions(flaggedQuestions);
              setCurrentQuestionIndex(currentQuestionIndex);
              setExamStartTime(examStartTime);
              setExamStatus('in-progress');
            } else {
              // Exam expired while tab was closed
              localStorage.removeItem(EXAM_PROGRESS_KEY);
            }
        }
      }
    } catch (e) {
      console.error("Failed to load saved exam progress:", e);
      localStorage.removeItem(EXAM_PROGRESS_KEY);
    }
  }, [loadBankQuestions, currentUser]);

  // Save progress to local storage whenever it changes during an exam
  useEffect(() => {
    if (examStatus === 'in-progress' && examStartTime) {
      const progress = {
        shuffledExamQuestions,
        userAnswers,
        flaggedQuestions,
        currentQuestionIndex,
        examStartTime,
        examStatus,
      };
      localStorage.setItem(EXAM_PROGRESS_KEY, JSON.stringify(progress));
    }
  }, [shuffledExamQuestions, userAnswers, flaggedQuestions, currentQuestionIndex, examStartTime, examStatus]);


  const handleGenerateQuestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedQuestion(null);
    try {
      const question = await generateQuestion(domain, subtopic, difficulty, language);
      setGeneratedQuestion(question);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [domain, subtopic, difficulty, language]);

  const handleGenerateExam = useCallback(async () => {
    setExamStatus('generating');
    setError(null);
    setGenerationProgress({ generated: 0, total: EXAM_SPEC.totalQuestions, domain: 'Starting...' });
    try {
      const questions = await generateFullExam((progress) => {
        setGenerationProgress(progress);
      });
      setExamQuestions(questions);
      setExamStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during exam generation.');
      setExamStatus('not-started');
    }
  }, []);

  const startExamFromBank = useCallback(async () => {
    setError(null);
    setExamStatus('generating'); // Use 'generating' status to show a loading indicator.
    setGenerationProgress({ generated: 0, total: EXAM_SPEC.totalQuestions, domain: 'Preparing exam from bank...' });

    try {
      if (bankQuestions.length < EXAM_SPEC.totalQuestions) {
        throw new Error(`Not enough questions in the bank. Need ${EXAM_SPEC.totalQuestions}, but only have ${bankQuestions.length}.`);
      }
      
      const examQs = [...bankQuestions].sort(() => 0.5 - Math.random()).slice(0, EXAM_SPEC.totalQuestions);
      
      localStorage.removeItem(EXAM_PROGRESS_KEY);
      
      const shuffled = shuffleArray(examQs);
      setShuffledExamQuestions(shuffled);
      setUserAnswers(new Array(shuffled.length).fill(null));
      setFlaggedQuestions(new Array(shuffled.length).fill(false));
      setCurrentQuestionIndex(0);
      setExamStartTime(Date.now()); 
      setExamStatus('in-progress'); 

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while preparing the exam from the bank.');
      setExamStatus('not-started');
    }
  }, [bankQuestions]);

  const startExam = () => {
    localStorage.removeItem(EXAM_PROGRESS_KEY);
    
    const shuffled = shuffleArray(examQuestions);
    setShuffledExamQuestions(shuffled);
    setUserAnswers(new Array(shuffled.length).fill(null));
    setFlaggedQuestions(new Array(shuffled.length).fill(false));
    setCurrentQuestionIndex(0);
    setExamStartTime(Date.now());
    setExamStatus('in-progress');
  };
  
  const finishExam = useCallback((leaveCount: number) => {
    if (examStartTime) {
      setTimeTaken(Date.now() - examStartTime);
    }
    setTabLeaveCount(leaveCount);
    setExamStatus('finished');
    localStorage.removeItem(EXAM_PROGRESS_KEY);
  }, [examStartTime]);
  
  const handleStartReview = useCallback(() => {
    const incorrect = shuffledExamQuestions
      .map((question, index) => ({ question, userAnswer: userAnswers[index] }))
      .filter(item => item.userAnswer !== null && item.userAnswer !== item.question.correct_index);
    
    setIncorrectReviewItems(incorrect as IncorrectReviewItem[]);
    setMode('review-incorrect');
  }, [shuffledExamQuestions, userAnswers]);

  // --- RENDER LOGIC --- //

  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
  }

  const renderSingleQuestionMode = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <aside className="lg:col-span-4 xl:col-span-3">
        <div className="sticky top-24">
          <QuestionGeneratorForm
            domain={domain}
            setDomain={setDomain}
            subtopic={subtopic}
            setSubtopic={setSubtopic}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            language={language}
            setLanguage={setLanguage}
            onSubmit={handleGenerateQuestion}
            isLoading={isLoading}
          />
        </div>
      </aside>

      <div className="lg:col-span-8 xl:col-span-9">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 min-h-[60vh] flex flex-col justify-center items-center">
          {isLoading && <LoadingSpinner />}
          {error && !isLoading && <ErrorMessage message={error} />}
          {generatedQuestion && !isLoading && <QuestionDisplay question={generatedQuestion} />}
          {!isLoading && !error && !generatedQuestion && (
            <div className="text-center text-slate-500 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-lg font-medium">Your SCFHS MLT question will appear here</h3>
              <p className="mt-1 text-sm">Select the domain, subtopic, and difficulty, then click "Generate Question".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderExamMode = () => {
    if (examStatus === 'in-progress' && examStartTime) {
      return <ExamView 
                questions={shuffledExamQuestions}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
                userAnswers={userAnswers}
                setUserAnswers={setUserAnswers}
                flaggedQuestions={flaggedQuestions}
                setFlaggedQuestions={setFlaggedQuestions}
                finishExam={finishExam}
                examStartTime={examStartTime}
             />
    }
    
    if (examStatus === 'finished') {
        return <ExamResults 
                questions={shuffledExamQuestions}
                userAnswers={userAnswers}
                timeTaken={timeTaken}
                tabLeaveCount={tabLeaveCount}
                onStartReview={handleStartReview}
               />
    }

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8 flex flex-col justify-center items-center text-center">
        {error && <ErrorMessage message={error} />}
        {examStatus === 'not-started' && (
          <>
            <h2 className="text-2xl font-bold mb-2">Full Mock Exam Simulator</h2>
            <p className="max-w-prose mb-6 text-slate-600 dark:text-slate-300">Generate a full {EXAM_SPEC.totalQuestions}-question mock exam based on the official SCFHS domain weights. The exam is timed for {EXAM_SPEC.durationMinutes} minutes.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleGenerateExam} className="px-6 py-3 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                Generate with AI
              </button>
              <button
                onClick={startExamFromBank}
                disabled={bankQuestions.length < EXAM_SPEC.totalQuestions}
                className="px-6 py-3 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                title={bankQuestions.length < EXAM_SPEC.totalQuestions ? `You need at least ${EXAM_SPEC.totalQuestions} questions in the bank.` : ''}
              >
                Use Question Bank ({bankQuestions.length} available)
              </button>
            </div>
          </>
        )}
        {examStatus === 'generating' && (
           <div className="w-full max-w-lg">
             <h2 className="text-2xl font-bold mb-4">{generationProgress.domain.startsWith('Preparing') ? 'Preparing Exam...' : 'Generating Exam...'}</h2>
             {generationProgress.domain.startsWith('Preparing') ? (
                 <div className="flex justify-center items-center flex-col">
                    <svg className="animate-spin h-10 w-10 text-sky-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-sm text-slate-500">Loading questions from the shared question bank...</p>
                </div>
             ) : (
                <>
                    <p className="mb-2 text-slate-600 dark:text-slate-300">Generating question {generationProgress.generated} of {generationProgress.total} (Domain: {generationProgress.domain})</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                        <div className="bg-sky-600 h-4 rounded-full transition-all duration-500" style={{ width: `${(generationProgress.generated / generationProgress.total) * 100}%` }}></div>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">This may take a few minutes. Please don't close this window.</p>
                </>
             )}
           </div>
        )}
         {examStatus === 'ready' && (
           <>
            <h2 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">Your Exam is Ready!</h2>
            <p className="max-w-prose mb-6 text-slate-600 dark:text-slate-300">
                You are about to start a timed exam with {examQuestions.length} questions.
                The time limit is {EXAM_SPEC.durationMinutes} minutes. Good luck!
            </p>
             <button onClick={startExam} className="px-8 py-4 text-xl font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Start Exam
            </button>
           </>
        )}
      </div>
    );
  };

  const renderReviewMode = () => (
    <IncorrectReviewView 
        incorrectItems={incorrectReviewItems} 
        onExit={() => setMode('exam')} 
    />
  );

  const renderQuestionBankMode = () => <QuestionBankManager questions={bankQuestions} />;

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800/80 shadow-sm sticky top-0 z-20 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <span role="img" aria-label="microscope emoji" className="mr-3 text-2xl">🔬</span>
              SCFHS MLT AI Exam Simulator
            </h1>
             <div className="flex items-center space-x-4">
              <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
                Welcome, {currentUser.name}
              </span>
              <button 
                onClick={handleLogout} 
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                    onClick={() => setMode('single-question')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${mode === 'single-question' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200'}`}
                >
                    Single Question Generator
                </button>
                <button
                    onClick={() => setMode('exam')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${mode === 'exam' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200'}`}
                >
                    Full Mock Exam
                </button>
                <button
                    onClick={() => {
                      setMode('question-bank');
                    }}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${mode === 'question-bank' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200'}`}
                >
                    Question Bank
                </button>
            </nav>
        </div>
        
        {mode === 'single-question' && renderSingleQuestionMode()}
        {mode === 'exam' && renderExamMode()}
        {mode === 'question-bank' && renderQuestionBankMode()}
        {mode === 'review-incorrect' && renderReviewMode()}

      </main>
    </div>
  );
};

export default App;