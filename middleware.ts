import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect API routes that require authentication
  if (pathname.startsWith('/api/generate-quiz') || 
      pathname.startsWith('/api/upload') ||
      pathname.startsWith('/api/parse-pdf') ||
      pathname.startsWith('/api/notes')) {
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' }, 
          { status: 401 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' }, 
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/generate-quiz/:path*',
    '/api/upload/:path*',
    '/api/parse-pdf/:path*',
    '/api/notes/:path*',
  ],
};
