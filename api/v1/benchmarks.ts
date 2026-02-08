
import { validateApiKey, createApiResponse, createApiError } from './middleware';
import { getBenchmarks } from '../../services/supabaseService';

export const GET = async (req: Request) => {
  const apiKey = req.headers.get('x-api-key') || '';
  const url = new URL(req.url);
  const sector = url.searchParams.get('sector');

  const { authorized, error } = await validateApiKey(apiKey);
  if (!authorized) return createApiError(error || 'Unauthorized', 401);

  try {
    const benchmarks = await getBenchmarks(sector || undefined);
    return createApiResponse({ success: true, data: benchmarks });
  } catch (err: any) {
    return createApiError(err.message, 500);
  }
};

export const POST = async (req: Request) => {
  const apiKey = req.headers.get('x-api-key') || '';
  const { authorized, orgId, error } = await validateApiKey(apiKey);
  if (!authorized) return createApiError(error || 'Unauthorized', 401);

  try {
    const { metrics, sector } = await req.json();
    
    if (!metrics || !sector) return createApiError('Metrics and sector are required.');

    // 1. Fetch current benchmarks for sector
    const currentBenchmarks = await getBenchmarks(sector);

    // 2. Map metrics to percentiles (Simplified mock comparison)
    const comparison = Object.keys(metrics).map(key => {
      const bench = currentBenchmarks.find(b => b.metric_name.toLowerCase() === key.toLowerCase());
      const value = metrics[key];
      const percentile = bench ? (value > bench.value ? 75 : 45) : 50;
      
      return {
        metric: key,
        value,
        industry_avg: bench?.value || 0,
        percentile
      };
    });

    return createApiResponse({
      success: true,
      orgId,
      sector,
      comparison,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return createApiError(err.message, 500);
  }
};
