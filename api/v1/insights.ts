
import { validateApiKey, createApiResponse, createApiError } from './middleware';
import { getProjectInsights, getAlignmentScores, getDecisionConfidence } from '../../services/supabaseService';

export const GET = async (req: Request) => {
  const apiKey = req.headers.get('x-api-key') || '';
  const url = new URL(req.url);
  const formId = url.searchParams.get('formId');

  const { authorized, error } = await validateApiKey(apiKey);
  if (!authorized) return createApiError(error || 'Unauthorized', 401);

  if (!formId) return createApiError('formId parameter is required.');

  try {
    const [insights, alignment, confidence] = await Promise.all([
      getProjectInsights(formId),
      getAlignmentScores(formId),
      getDecisionConfidence(formId)
    ]);

    return createApiResponse({
      success: true,
      data: {
        insights,
        currentAlignment: alignment[0]?.score_value || 0,
        decisionConfidence: confidence?.confidence_score || 0,
        explanation: confidence?.explanation || ''
      }
    });
  } catch (err: any) {
    return createApiError(err.message, 500);
  }
};
