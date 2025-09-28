import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common operations
export const supabaseHelpers = {
  // User operations
  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createUser(email: string) {
    const { data, error } = await supabase
      .from('users')
      .insert({ email })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Quiz operations
  async getQuizzes(userId?: string) {
    let query = supabase.from('quizzes').select('*');
    
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('is_public', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getQuiz(quizId: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createQuiz(userId: string, title: string, isPublic = false) {
    const shareLink = Math.random().toString(36).substring(2, 15);
    
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        user_id: userId,
        title,
        share_link: shareLink,
        is_public: isPublic
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateQuiz(quizId: string, updates: { title?: string; is_public?: boolean }) {
    const { data, error } = await supabase
      .from('quizzes')
      .update(updates)
      .eq('id', quizId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteQuiz(quizId: string) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);
    
    if (error) throw error;
  },

  // Question operations
  async getQuestions(quizId: string) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createQuestion(quizId: string, questionText: string, correctAnswer: string, options: string[]) {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        quiz_id: quizId,
        question_text: questionText,
        correct_answer: correctAnswer,
        options
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateQuestion(questionId: string, updates: { question_text?: string; correct_answer?: string; options?: string[] }) {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', questionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteQuestion(questionId: string) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);
    
    if (error) throw error;
  }
};
