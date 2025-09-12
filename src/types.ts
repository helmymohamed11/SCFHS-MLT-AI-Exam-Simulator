@@ .. @@
 export interface User {
-  id: number;
+  id: string;
   name: string;
   age: number;
   phone: string;
   email: string;
   role: 'user' | 'admin';
  subscription_tier: 'free' | 'paid';
  subscription_end_date: string | null;
 }
 
+export interface AttemptData {
+  id: string;
+  userId: string;
+  examType: string;
+  startedAt: string;
+  finishedAt?: string;
+  scorePct?: number;
+  passed?: boolean;
+  timeTotalSec?: number;
+  breakdownJson?: any;
+  tabLeaveCount: number;
+}
+
+export interface ResponseData {
+  id: string;
+  attemptId: string;
+  questionId: string;
+  selectedIndex?: number;
+  correct: boolean;
+  timeSpentSec?: number;
+  flagged: boolean;
+  skipped: boolean;
+  confidence?: number;
+}
+