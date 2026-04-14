export interface UserProfile {
  id: string;
  tg_id: number;
  full_name: string;
  job_title: string;
  department: string;
  grade: number; // 1-5
  avatar_url?: string;
  created_at: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  category: 'routine' | 'prompting' | 'limitations' | 'legal' | 'roi' | 'change_management';
}

export interface AttestationResult {
  id: string;
  user_id: string;
  score: number;
  total_questions: number;
  grade_achieved: number;
  feedback: string;
  category_scores: Record<string, number>;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  plan: 'standard' | 'premium';
  created_at: string;
}
