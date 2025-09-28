# QuizCraft Simple Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from the project settings
3. Copy `env.template` to `.env.local` and fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 3. Set up Database
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-setup.sql`
4. Run the SQL to create your tables

### 4. Start Development Server
```bash
npm run dev
```

## Database Tables

- **users**: Store user information (id, email, created_at)
- **quizzes**: Store quiz data (id, user_id, title, share_link, created_at, is_public)
- **questions**: Store quiz questions (id, quiz_id, question_text, correct_answer, options)

## Files Created

- `database-setup.sql` - SQL to create your database tables
- `src/types/database.ts` - TypeScript types for your database
- `src/lib/supabase.ts` - Supabase connection and helper functions
- `env.template` - Environment variables template

## Next Steps

You can now start building your quiz application using the helper functions in `src/lib/supabase.ts`!
