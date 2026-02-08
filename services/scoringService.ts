
import { SectorModel, SemanticScore, AlignmentScore } from '../types';
import { getSectorModelByName } from './supabaseService';

export interface SpecializedInsight {
  metric: string;
  score: number;
  benchmark_delta: number;
  interpretation: string;
}

/**
 * APPLIES SECTOR-SPECIFIC SCORING LOGIC
 * This engine takes raw semantic scores and transforms them using 
 * the weights and thresholds defined in a Sector Model.
 */
export const computeSectorSpecializedInsights = async (
  sectorName: string,
  rawScores: SemanticScore[],
  alignmentScores: AlignmentScore[]
): Promise<SpecializedInsight[]> => {
  const model = await getSectorModelByName(sectorName);
  if (!model) throw new Error(`Sector model for '${sectorName}' not found.`);

  const config = model.config as any;
  const weights = config.weights || {};
  const benchmarks = config.benchmarks || {};

  // Aggregate raw scores by type
  const aggregated: Record<string, number[]> = {};
  rawScores.forEach(s => {
    if (!aggregated[s.score_type]) aggregated[s.score_type] = [];
    aggregated[s.score_type].push(s.score_value);
  });

  const finalInsights: SpecializedInsight[] = [];

  // 1. Process standard metrics with sector weights
  Object.keys(aggregated).forEach(type => {
    const avg = aggregated[type].reduce((a, b) => a + b, 0) / aggregated[type].length;
    const weight = weights[type] || 1.0;
    const score = avg * weight * 100;
    
    const industryAvg = benchmarks[type] || 50;
    const delta = score - industryAvg;

    finalInsights.push({
      metric: type.charAt(0).toUpperCase() + type.slice(1),
      score: Math.round(score),
      benchmark_delta: Math.round(delta),
      interpretation: getInterpretation(type, score, delta, sectorName)
    });
  });

  return finalInsights;
};

const getInterpretation = (type: string, score: number, delta: number, sector: string): string => {
  if (delta > 15) return `High performing ${type} relative to ${sector} standards.`;
  if (delta < -15) return `Critical drift detected in ${type} compared to ${sector} benchmarks.`;
  return `Stable ${type} within the expected ${sector} range.`;
};
