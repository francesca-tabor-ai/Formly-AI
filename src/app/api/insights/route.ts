import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateWeightedScore, detectOutliers } from '@/lib/weights'
import type { Question, Segment, Respondent, Response } from '@/types/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')
    const format = searchParams.get('format') || 'json'

    if (!formId) {
      return NextResponse.json(
        { error: 'formId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const [questionsRes, segmentsRes, respondentsRes, responsesRes] =
      await Promise.all([
        supabase.from('questions').select('*').eq('form_id', formId),
        supabase.from('segments').select('*').eq('form_id', formId),
        supabase.from('respondents').select('*').eq('form_id', formId),
        supabase.from('responses').select('*').eq('form_id', formId),
      ])

    const questions: Question[] = questionsRes.data ?? []
    const segments: Segment[] = segmentsRes.data ?? []
    const respondents: Respondent[] = respondentsRes.data ?? []
    const responses: Response[] = responsesRes.data ?? []

    if (format === 'csv') {
      // Build CSV of raw responses
      const questionMap = new Map(questions.map((q) => [q.id, q]))
      const respondentMap = new Map(respondents.map((r) => [r.id, r]))
      const segmentMap = new Map(segments.map((s) => [s.id, s]))

      const headers = [
        'response_id',
        'respondent_email',
        'segment',
        'question',
        'question_type',
        'category',
        'numeric_value',
        'text_value',
        'question_weight',
        'segment_weight',
        'created_at',
      ]

      const rows = responses.map((r) => {
        const q = questionMap.get(r.question_id)
        const resp = respondentMap.get(r.respondent_id)
        const seg = resp?.segment_id
          ? segmentMap.get(resp.segment_id)
          : null

        return [
          r.id,
          resp?.email || 'anonymous',
          seg?.name || '',
          q?.text || '',
          q?.type || '',
          q?.category || '',
          r.numeric_value ?? '',
          r.text_value ?? '',
          q?.default_weight ?? 1,
          seg?.weight ?? 1,
          r.created_at,
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      })

      const csv = [headers.join(','), ...rows].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=formly-responses-${formId}.csv`,
        },
      })
    }

    // JSON summary report
    const respondentSegmentMap: Record<string, string | null> = {}
    respondents.forEach((r) => {
      respondentSegmentMap[r.id] = r.segment_id
    })

    const { overallScore } = calculateWeightedScore(
      responses,
      questions,
      segments,
      respondentSegmentMap
    )

    const questionInsights = questions.map((q) => {
      const qResponses = responses.filter((r) => r.question_id === q.id)
      const numericValues = qResponses
        .filter((r) => r.numeric_value !== null)
        .map((r) => r.numeric_value!)

      let averageScore: number | null = null
      let weightedAverage: number | null = null
      let outlierCount = 0

      if (numericValues.length > 0) {
        averageScore =
          numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        weightedAverage = averageScore * q.default_weight
        const { outlierIndices } = detectOutliers(numericValues)
        outlierCount = outlierIndices.length
      }

      return {
        question_id: q.id,
        question_text: q.text,
        question_type: q.type,
        category: q.category,
        average_score: averageScore,
        weighted_average: weightedAverage,
        response_count: qResponses.length,
        outlier_count: outlierCount,
      }
    })

    const segmentInsights = segments.map((s) => {
      const segRespondentIds = respondents
        .filter((r) => r.segment_id === s.id)
        .map((r) => r.id)
      const segResponses = responses.filter(
        (r) =>
          segRespondentIds.includes(r.respondent_id) &&
          r.numeric_value !== null
      )
      const numericValues = segResponses.map((r) => r.numeric_value!)
      const avg =
        numericValues.length > 0
          ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
          : 0

      return {
        segment_id: s.id,
        segment_name: s.name,
        segment_weight: s.weight,
        average_score: avg,
        weighted_average: avg * s.weight,
        response_count: segResponses.length,
      }
    })

    const uniqueRespondents = new Set(responses.map((r) => r.respondent_id))

    const report = {
      form_id: formId,
      generated_at: new Date().toISOString(),
      summary: {
        total_responses: responses.length,
        total_respondents: uniqueRespondents.size,
        overall_weighted_score: overallScore,
        question_count: questions.length,
        segment_count: segments.length,
      },
      questions: questionInsights,
      segments: segmentInsights,
    }

    return new NextResponse(JSON.stringify(report, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename=formly-insights-${formId}.json`,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
