// Database types for QuizCraft Simple

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  share_link: string | null;
  created_at: string;
  is_public: boolean;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  correct_answer: string;
  options: string[]; // Array of answer options
}

// Database response types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      quizzes: {
        Row: Quiz;
        Insert: Omit<Quiz, 'id' | 'created_at'>;
        Update: Partial<Omit<Quiz, 'id' | 'created_at'>>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id'>;
        Update: Partial<Omit<Question, 'id'>>;
      };
    };
  };
}

// Form types for creating/updating
export interface CreateQuizData {
  title: string;
  is_public?: boolean;
}

export interface CreateQuestionData {
  question_text: string;
  correct_answer: string;
  options: string[];
}

export interface UpdateQuizData {
  title?: string;
  is_public?: boolean;
}

export interface UpdateQuestionData {
  question_text?: string;
  correct_answer?: string;
  options?: string[];
}

