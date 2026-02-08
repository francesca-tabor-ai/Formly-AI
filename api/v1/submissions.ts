
import { validateApiKey, createApiResponse, createApiError } from './middleware';
import { addConversationMessage, createConversation } from '../../services/supabaseService';
import { generateAdaptiveProbe, getSemanticEmbedding } from '../../services/geminiService';

export const POST = async (req: Request) => {
  const apiKey = req.headers.get('x-api-key') || '';
  const { authorized, orgId, error } = await validateApiKey(apiKey);
  if (!authorized) return createApiError(error || 'Unauthorized', 401);

  try {
    const { formId, respondentId, content, currentQuestion, history = [] } = await req.json();

    if (!formId || !content) return createApiError('formId and content are required.');

    // 1. Ensure conversation exists or create one
    const conv = await createConversation({ form_id: formId, respondent_id: respondentId || 'anonymous' });

    // 2. Process submission
    const embedding = await getSemanticEmbedding(content);
    const userMsg = await addConversationMessage({
      conversation_id: conv.id,
      role: 'user',
      content,
      embedding
    });

    // 3. Generate adaptive follow-up
    const adaptiveResponse = await generateAdaptiveProbe(
      "Goal extraction for external API submission", 
      history, 
      currentQuestion || ""
    );

    return createApiResponse({
      success: true,
      messageId: userMsg.id,
      adaptiveFollowUp: adaptiveResponse
    });
  } catch (err: any) {
    return createApiError(err.message, 500);
  }
};
