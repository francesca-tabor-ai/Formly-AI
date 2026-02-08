
import { validateApiKey, createApiResponse, createApiError } from './middleware';
import { getSemanticAnalysisForProject, getAlignmentScores } from '../../services/supabaseService';
import { computeSectorSpecializedInsights } from '../../services/scoringService';

export const POST = async (req: Request) => {
  const apiKey = req.headers.get('x-api-key') || '';
  const { authorized, error } = await validateApiKey(apiKey);
  if (!authorized) return createApiError(error || 'Unauthorized', 401);

  try {
    const { formId, sectorName } = await req.json();

    if (!formId || !sectorName) {
      return createApiError('formId and sectorName are required for specialized scoring.');
    }

    // 1. Fetch raw data
    const [semanticData, alignmentData] = await Promise.all([
      getSemanticAnalysisForProject(formId),
      getAlignmentScores(formId)
    ]);

    // 2. Map semanticData to expected SemanticScore type
    const rawScores = semanticData.map(d => ({
      score_type: d.score_type,
      score_value: d.score_value
    })) as any;

    // 3. Compute specialized insights
    const insights = await computeSectorSpecializedInsights(
      sectorName,
      rawScores,
      alignmentData
    );

    return createApiResponse({
      success: true,
      formId,
      sector: sectorName,
      specializedInsights: insights,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return createApiError(err.message, 500);
  }
};
