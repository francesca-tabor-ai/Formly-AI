
import { validateApiKey, createApiResponse, createApiError } from './middleware';
import { apiRunSimulation } from '../../services/api';

export const POST = async (req: Request) => {
  const apiKey = req.headers.get('x-api-key') || '';
  const { authorized, orgId, error } = await validateApiKey(apiKey);
  if (!authorized) return createApiError(error || 'Unauthorized', 401);

  try {
    const body = await req.json();
    const { formId, scenarioId, variables, weights } = body;

    if (!formId || !scenarioId) return createApiError('formId and scenarioId are required.');

    const result = await apiRunSimulation({
      formId,
      orgId: orgId!,
      scenarioId,
      variables: variables || {},
      weights: weights || {}
    });

    if (result.success) {
      return createApiResponse({ success: true, simulation: result.data });
    } else {
      return createApiError(result.error || 'Simulation failed.', 500);
    }
  } catch (err: any) {
    return createApiError(err.message, 500);
  }
};
