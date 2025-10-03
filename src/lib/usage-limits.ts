import { supabaseHelpers } from './supabase';

export const USAGE_LIMITS = {
  FREE_NOTES: 10,
  PRO_NOTES: Infinity,
} as const;

export interface UsageLimitResult {
  canCreate: boolean;
  currentCount: number;
  limit: number;
  plan: 'free' | 'pro';
}

/**
 * Check notes usage limit for a user
 */
export async function checkNotesUsageLimit(userId: string): Promise<UsageLimitResult> {
  const userPlan = await supabaseHelpers.getUserWithPlan(userId);
  const currentCount = await supabaseHelpers.getNotesCount(userId);
  
  const limit = userPlan.subscription_plan === 'pro' ? USAGE_LIMITS.PRO_NOTES : USAGE_LIMITS.FREE_NOTES;
  const canCreate = currentCount < limit;
  
  return {
    canCreate,
    currentCount,
    limit,
    plan: userPlan.subscription_plan as 'free' | 'pro'
  };
}

/**
 * Validate if user can create a new note
 */
export async function validateNoteCreation(userId: string): Promise<{ 
  isValid: boolean; 
  error?: string; 
  message?: string;
  usageInfo?: UsageLimitResult;
}> {
  const usageInfo = await checkNotesUsageLimit(userId);
  
  if (!usageInfo.canCreate) {
    return {
      isValid: false,
      error: 'Note limit reached. Upgrade to Pro for unlimited notes.',
      message: `You have reached your limit of ${usageInfo.limit} notes. Current plan: ${usageInfo.plan === 'pro' ? 'Pro' : 'Free'}`,
      usageInfo
    };
  }
  
  return {
    isValid: true,
    usageInfo
  };
}
