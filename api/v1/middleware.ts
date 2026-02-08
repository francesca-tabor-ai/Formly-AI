
import { supabase } from '../../supabaseClient';

export interface ApiRequestHeader {
  'x-api-key': string;
}

export const validateApiKey = async (apiKey: string): Promise<{ authorized: boolean; orgId?: string; error?: string }> => {
  if (!apiKey) return { authorized: false, error: 'API key is missing.' };

  // In a real implementation, we would hash the incoming key and compare with key_hash
  // For this architecture, we lookup by the hint or a mock hash comparison
  const { data, error } = await supabase
    .from('api_keys')
    .select('organization_id, id')
    .eq('key_hint', apiKey.substring(0, 10)) // Simple hint-based lookup for mock
    .maybeSingle();

  if (error || !data) {
    return { authorized: false, error: 'Invalid API key provided.' };
  }

  // Update last used timestamp
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  return { authorized: true, orgId: data.organization_id };
};

export const rateLimit = async (orgId: string): Promise<boolean> => {
  // Mock rate limiting logic: 1000 requests per hour per org
  return true; 
};

export const createApiResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const createApiError = (message: string, status: number = 400) => {
  return createApiResponse({ error: message, success: false }, status);
};
