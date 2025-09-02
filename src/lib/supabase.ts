import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          age: number;
          phone: string;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          age: number;
          phone: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          age?: number;
          phone?: string;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          stem: string;
          options: string[];
          correct_index: number;
          explanation: string;
          domain: string;
          subtopic: string;
          difficulty: number;
          tags: string[];
          refs: string[];
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          stem: string;
          options: string[];
          correct_index: number;
          explanation: string;
          domain: string;
          subtopic: string;
          difficulty: number;
          tags?: string[];
          refs?: string[];
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          stem?: string;
          options?: string[];
          correct_index?: number;
          explanation?: string;
          domain?: string;
          subtopic?: string;
          difficulty?: number;
          tags?: string[];
          refs?: string[];
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      attempts: {
        Row: {
          id: string;
          user_id: string;
          exam_type: string;
          started_at: string;
          finished_at: string | null;
          score_pct: number | null;
          passed: boolean | null;
          time_total_sec: number | null;
          breakdown_json: any | null;
          tab_leave_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_type: string;
          started_at?: string;
          finished_at?: string | null;
          score_pct?: number | null;
          passed?: boolean | null;
          time_total_sec?: number | null;
          breakdown_json?: any | null;
          tab_leave_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exam_type?: string;
          started_at?: string;
          finished_at?: string | null;
          score_pct?: number | null;
          passed?: boolean | null;
          time_total_sec?: number | null;
          breakdown_json?: any | null;
          tab_leave_count?: number;
          created_at?: string;
        };
      };
      responses: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          selected_index: number | null;
          correct: boolean;
          time_spent_sec: number | null;
          flagged: boolean;
          skipped: boolean;
          confidence: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          selected_index?: number | null;
          correct: boolean;
          time_spent_sec?: number | null;
          flagged?: boolean;
          skipped?: boolean;
          confidence?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          selected_index?: number | null;
          correct?: boolean;
          time_spent_sec?: number | null;
          flagged?: boolean;
          skipped?: boolean;
          confidence?: number | null;
          created_at?: string;
        };
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          attempt_id: string;
          payload_json: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          attempt_id: string;
          payload_json: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          attempt_id?: string;
          payload_json?: any;
          created_at?: string;
        };
      };
    };
  };
};