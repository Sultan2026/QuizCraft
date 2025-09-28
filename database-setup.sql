-- QuizCraft Simple Database Setup
-- Run this SQL in your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    share_link VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT FALSE
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    options JSONB NOT NULL -- Array of answer options
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_share_link ON quizzes(share_link);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Quizzes policies
CREATE POLICY "Users can view own quizzes" ON quizzes
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view public quizzes" ON quizzes
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own quizzes" ON quizzes
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own quizzes" ON quizzes
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own quizzes" ON quizzes
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Questions policies
CREATE POLICY "Users can view questions of accessible quizzes" ON questions
    FOR SELECT USING (
        quiz_id IN (
            SELECT id FROM quizzes 
            WHERE user_id::text = auth.uid()::text OR is_public = true
        )
    );

CREATE POLICY "Users can create questions for own quizzes" ON questions
    FOR INSERT WITH CHECK (
        quiz_id IN (
            SELECT id FROM quizzes 
            WHERE user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update questions of own quizzes" ON questions
    FOR UPDATE USING (
        quiz_id IN (
            SELECT id FROM quizzes 
            WHERE user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete questions of own quizzes" ON questions
    FOR DELETE USING (
        quiz_id IN (
            SELECT id FROM quizzes 
            WHERE user_id::text = auth.uid()::text
        )
    );
