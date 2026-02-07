import type { Question, Segment, Response } from '@/types/database'

interface WeightedResponse {
  responseId: string
  rawValue: number
  questionWeight: number
  segmentWeight: number
  weightedValue: number
}

export function calculateWeightedScore(
  responses: Response[],
  questions: Question[],
  segments: Segment[],
  respondentSegmentMap: Record<string, string | null>
): {
  weightedResponses: WeightedResponse[]
  overallScore: number
  totalWeight: number
} {
  const questionMap = new Map(questions.map((q) => [q.id, q]))
  const segmentMap = new Map(segments.map((s) => [s.id, s]))

  const weightedResponses: WeightedResponse[] = []
  let totalWeightedValue = 0
  let totalWeight = 0

  for (const response of responses) {
    if (response.numeric_value === null) continue

    const question = questionMap.get(response.question_id)
    if (!question) continue

    const segmentId = respondentSegmentMap[response.respondent_id]
    const segment = segmentId ? segmentMap.get(segmentId) : null

    const questionWeight = question.default_weight
    const segmentWeight = segment?.weight ?? 1.0
    const weightedValue =
      response.numeric_value * questionWeight * segmentWeight

    weightedResponses.push({
      responseId: response.id,
      rawValue: response.numeric_value,
      questionWeight,
      segmentWeight,
      weightedValue,
    })

    totalWeightedValue += weightedValue
    totalWeight += questionWeight * segmentWeight
  }

  const overallScore = totalWeight > 0 ? totalWeightedValue / totalWeight : 0

  return { weightedResponses, overallScore, totalWeight }
}

export function detectOutliers(
  values: number[],
  threshold = 2
): { mean: number; stdDev: number; outlierIndices: number[] } {
  if (values.length < 3) {
    return { mean: 0, stdDev: 0, outlierIndices: [] }
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length
  const stdDev = Math.sqrt(variance)

  const outlierIndices: number[] = []
  values.forEach((val, idx) => {
    if (Math.abs(val - mean) > threshold * stdDev) {
      outlierIndices.push(idx)
    }
  })

  return { mean, stdDev, outlierIndices }
}
