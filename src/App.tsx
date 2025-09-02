@@ .. @@
 import React, { useState, useCallback, useEffect } from 'react';
 import { Question, Difficulty, Language, Domain, AppMode, ExamStatus, EXAM_SPEC, User } from './types';
 import { generateQuestion, generateFullExam } from './services/geminiService';
-import * as db from './services/database';
-import * as auth from './services/authService';
+import * as supabaseService from './services/supabaseService';
+import { buildExamReport, generateStudyPlan } from './services/analyticsService';
 import QuestionGeneratorForm from './components/QuestionGeneratorForm';
 import QuestionDisplay from './components/QuestionDisplay';
 import LoadingSpinner from './components/LoadingSpinner';
 import ErrorMessage from './components/ErrorMessage';
-import ExamView from './components/ExamView';
+import EnhancedExamView from './components/EnhancedExamView';
 import ExamResults from './components/ExamResults';
 import QuestionBankManager from './components/QuestionBankManager';
 import IncorrectReviewView from './components/IncorrectReviewView';
-import AuthView from './components/AuthView';
+import EnhancedAuthView from './components/EnhancedAuthView';
 import AdminDashboard from './components/AdminDashboard';
+import ReportPage from './components/ReportPage';
+import FlashcardCreator, { Flashcard } from './components/FlashcardCreator';
+import StudyPlanView from './components/StudyPlanView';
 
 
 const EXAM_PROGRESS_KEY = 'examProgress';
@@ .. @@
 const App: React.FC = () => {
   // Auth State
-  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.getCurrentUser());
+  const [currentUser, setCurrentUser] = useState<User | null>(null);
 
   // General App State
-  const [mode, setMode] = useState<AppMode>('single-question');
+  const [mode, setMode] = useState<AppMode | 'report' | 'flashcard-creator' | 'study-plan'>('single-question');
   const [error, setError] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(false);
 
@@ .. @@
   const [examStartTime, setExamStartTime] = useState<number | null>(null);
   const [timeTaken, setTimeTaken] = useState<number>(0);
   const [tabLeaveCount, setTabLeaveCount] = useState<number>(0);
+  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
 
   // Question Bank State
   const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
 
   // Review Incorrect State
   const [incorrectReviewItems, setIncorrectReviewItems] = useState<IncorrectReviewItem[]>([]);
+  
+  // Report and Study Plan State
+  const [currentReport, setCurrentReport] = useState<any>(null);
+  const [studyPlan, setStudyPlan] = useState<any>(null);
+  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
+
+  // Check authentication on mount
+  useEffect(() => {
+    const checkAuth = async () => {
+      try {
+        const user = await supabaseService.getCurrentUser();
+        setCurrentUser(user);
+      } catch (error) {
+        console.error('Auth check failed:', error);
+      }
+    };
+    
+    checkAuth();
+  }, []);
   
   // Auth Handlers
   const handleLoginSuccess = (user: User) => {
@@ -25,7 +50,7 @@
   };
   
   const handleLogout = () => {
-    auth.logout();
+    supabaseService.signOut();
     setCurrentUser(null);
     // Reset exam state to avoid showing another user's progress
     setExamStatus('not-started');
@@ .. @@
   // Function to load bank stats
   const loadBankQuestions = useCallback(async () => {
     try {
-      const allQuestions = await db.getBankQuestions();
+      const allQuestions = await supabaseService.getQuestions();
       setBankQuestions(allQuestions);
     } catch (e) {
       console.error("Could not load question bank:", e);
@@ .. @@
   const startExam = () => {
     localStorage.removeItem(EXAM_PROGRESS_KEY);
     
+    // Create attempt in database
+    const createAttemptAndStart = async () => {
+      try {
+        const attemptId = await supabaseService.createAttempt('full-exam');
+        setCurrentAttemptId(attemptId);
+      } catch (error) {
+        console.error('Failed to create attempt:', error);
+      }
+    };
+    
+    createAttemptAndStart();
+    
     const shuffled = shuffleArray(examQuestions);
     setShuffledExamQuestions(shuffled);
     setUserAnswers(new Array(shuffled.length).fill(null));
@@ .. @@
   };
   
-  const finishExam = useCallback((leaveCount: number) => {
+  const finishExam = useCallback(async (leaveCount: number) => {
     if (examStartTime) {
       setTimeTaken(Date.now() - examStartTime);
     }
     setTabLeaveCount(leaveCount);
-    setExamStatus('finished');
+    
+    // Calculate results and save to database
+    if (currentAttemptId) {
+      const totalCorrect = userAnswers.filter((answer, index) => 
+        answer !== null && answer === shuffledExamQuestions[index]?.correct_index
+      ).length;
+      const scorePct = (totalCorrect / shuffledExamQuestions.length) * 100;
+      const passed = scorePct >= 60;
+      const timeTotalSec = examStartTime ? Math.floor((Date.now() - examStartTime) / 1000) : 0;
+      
+      try {
+        await supabaseService.finishAttempt(
+          currentAttemptId,
+          scorePct,
+          passed,
+          timeTotalSec,
+          leaveCount
+        );
+        
+        // Generate report
+        const report = await supabaseService.getAttemptReport(currentAttemptId);
+        setCurrentReport(report);
+        setMode('report');
+      } catch (error) {
+        console.error('Failed to finish attempt:', error);
+        setExamStatus('finished'); // Fallback to old behavior
+      }
+    } else {
+      setExamStatus('finished'); // Fallback to old behavior
+    }
+    
     localStorage.removeItem(EXAM_PROGRESS_KEY);
-  }, [examStartTime]);
+  }, [examStartTime, currentAttemptId, userAnswers, shuffledExamQuestions]);
   
   const handleStartReview = useCallback(() => {
     const incorrect = shuffledExamQuestions
@@ .. @@
     setIncorrectReviewItems(incorrect as IncorrectReviewItem[]);
     setMode('review-incorrect');
   }, [shuffledExamQuestions, userAnswers]);
+  
+  const handleCreateFlashcards = () => {
+    const incorrectQuestions = shuffledExamQuestions.filter((question, index) => 
+      userAnswers[index] !== null && userAnswers[index] !== question.correct_index
+    );
+    setMode('flashcard-creator');
+  };
+  
+  const handleFlashcardsCreated = (newFlashcards: Flashcard[]) => {
+    setFlashcards(newFlashcards);
+    setMode('study-plan');
+    
+    // Generate study plan
+    if (currentReport) {
+      const plan = generateStudyPlan(currentReport);
+      setStudyPlan(plan);
+    }
+  };

   // --- RENDER LOGIC --- //

   if (!currentUser) {
-    return <AuthView onLoginSuccess={handleLoginSuccess} />;
+    return <EnhancedAuthView onLoginSuccess={handleLoginSuccess} />;
   }

@@ .. @@
   const renderExamMode = () => {
     if (examStatus === 'in-progress' && examStartTime) {
-      return <ExamView 
+      return <EnhancedExamView 
                 questions={shuffledExamQuestions}
                 currentQuestionIndex={currentQuestionIndex}
                 setCurrentQuestionIndex={setCurrentQuestionIndex}
@@ .. @@
                 setFlaggedQuestions={setFlaggedQuestions}
                 finishExam={finishExam}
                 examStartTime={examStartTime}
+                attemptId={currentAttemptId}
              />
     }
     
@@ .. @@
   const renderReviewMode = () => (
     <IncorrectReviewView 
         incorrectItems={incorrectReviewItems} 
         onExit={() => setMode('exam')} 
     />
   );

   const renderQuestionBankMode = () => <QuestionBankManager questions={bankQuestions} />;
+  
+  const renderReportMode = () => {
+    if (!currentReport || !currentAttemptId) return null;
+    
+    return (
+      <ReportPage
+        attemptId={currentAttemptId}
+        onCreateFlashcards={handleCreateFlashcards}
+        onBackToExam={() => {
+          setMode('exam');
+          setExamStatus('not-started');
+          setCurrentReport(null);
+          setCurrentAttemptId(null);
+        }}
+      />
+    );
+  };
+  
+  const renderFlashcardCreator = () => {
+    const incorrectQuestions = shuffledExamQuestions.filter((question, index) => 
+      userAnswers[index] !== null && userAnswers[index] !== question.correct_index
+    );
+    
+    return (
+      <FlashcardCreator
+        incorrectQuestions={incorrectQuestions}
+        onClose={() => setMode('report')}
+        onCreateFlashcards={handleFlashcardsCreated}
+      />
+    );
+  };
+  
+  const renderStudyPlan = () => {
+    if (!studyPlan) return null;
+    
+    return (
+      <div className="space-y-6">
+        <div className="text-center">
+          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
+            Your Personalized Study Plan
+          </h1>
+          <p className="text-slate-600 dark:text-slate-400">
+            Based on your exam performance, here's your optimized study strategy
+          </p>
+        </div>
+        
+        <StudyPlanView
+          priorities={studyPlan.priorities}
+          weekPlan={studyPlan.weekPlan}
+          timeTips={studyPlan.timeTips}
+        />
+        
+        <div className="text-center">
+          <button
+            onClick={() => setMode('exam')}
+            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105"
+          >
+            Back to Exam Menu
+          </button>
+        </div>
+      </div>
+    );
+  };

   return (
@@ .. @@
         {mode === 'exam' && renderExamMode()}
         {mode === 'question-bank' && renderQuestionBankMode()}
         {mode === 'review-incorrect' && renderReviewMode()}
+        {mode === 'report' && renderReportMode()}
+        {mode === 'flashcard-creator' && renderFlashcardCreator()}
+        {mode === 'study-plan' && renderStudyPlan()}

       </main>
     </div>