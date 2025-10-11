// Test utility to verify authentication flow
// This can be used in browser console to test API calls

export const testAuthFlow = async () => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('❌ No active session found');
      return;
    }
    
    console.log('✅ Active session found:', {
      userId: session.user.id,
      email: session.user.email,
      tokenLength: session.access_token.length
    });
    
    // Test API call
    const response = await fetch('/api/generate-quiz?numQuestions=5&difficulty=easy', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: 'Test content for quiz generation' }),
    });
    
    console.log('📡 API Response:', {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Quiz generated successfully:', data);
    } else {
      const error = await response.text();
      console.error('❌ API Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Usage: testAuthFlow()
