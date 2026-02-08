
import { validateApiKey, createApiResponse, createApiError } from './middleware';
import { createForm, getForms } from '../../services/supabaseService';
import { generateQuestionsFromGoal } from '../../services/geminiService';

export const GET = async (req: Request) => {
  const apiKey = req.headers.get('x-api-key') || '';
  const { authorized, orgId, error } = await validateApiKey(apiKey);
  if (!authorized) return createApiError(error || 'Unauthorized', 401);

  try {
    const forms = await getForms(); // Org filtering happens inside service via RLS
    return createApiResponse({ success: true, data: forms });
  } catch (err: any) {
    return createApiError(err.message, 500);
  }
};

export const POST = async (req: Request) => {
  const apiKey = req.headers.get('x-api-key') || '';
  const { authorized, orgId, error } = await validateApiKey(apiKey);
  if (!authorized) return createApiError(error || 'Unauthorized', 401);

  try {
    const body = await req.json();
    const { title, goal, autoGenerate = false } = body;

    if (!title || !goal) return createApiError('Title and Goal are required.');

    let questions = body.questions || [];
    
    if (autoGenerate && questions.length === 0) {
      questions = await generateQuestionsFromGoal(goal);
    }

    const newForm = await createForm(
      { organization_id: orgId!, title, goal, status: 'active' },
      questions
    );

    return createApiResponse({ success: true, data: newForm }, 201);
  } catch (err: any) {
    return createApiError(err.message, 500);
  }
};
