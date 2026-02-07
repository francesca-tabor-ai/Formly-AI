'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, AlertTriangle } from 'lucide-react'
import { calculateWeightedScore, detectOutliers } from '@/lib/weights'
import type {
  Question,
  Segment,
  Respondent,
  Response,
  InsightSummary,
  QuestionInsight,
  SegmentInsight,
} from '@/types/database'

export default function InsightsPage() {
  const { formId } = useParams<{ formId: string }>()
  const [insights, setInsights] = useState<InsightSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  
  // Only create client in browser to avoid SSR issues
  const supabase = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createClient()
    }
    return null
  }, [])

  const loadInsights = useCallback(async () => {
    if (!supabase) return
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

    // Per-question insights
    const questionInsights: QuestionInsight[] = questions.map((q) => {
      const qResponses = responses.filter((r) => r.question_id === q.id)
      const numericValues = qResponses
        .filter((r) => r.numeric_value !== null)
        .map((r) => r.numeric_value!)

      let averageScore: number | null = null
      let weightedAverage: number | null = null
      const outliers: string[] = []

      if (numericValues.length > 0) {
        averageScore =
          numericValues.reduce((a, b) => a + b, 0) / numericValues.length
        weightedAverage = averageScore * q.default_weight

        const { outlierIndices } = detectOutliers(numericValues)
        outlierIndices.forEach((idx) => {
          const resp = qResponses[idx]
          if (resp) outliers.push(resp.id)
        })
      }

      return {
        question_id: q.id,
        question_text: q.text,
        question_type: q.type,
        average_score: averageScore,
        weighted_average: weightedAverage,
        response_count: qResponses.length,
        outliers,
      }
    })

    // Per-segment insights
    const segmentInsights: SegmentInsight[] = segments.map((s) => {
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
        average_score: avg,
        weighted_average: avg * s.weight,
        response_count: segResponses.length,
      }
    })

    const uniqueRespondentIds = new Set(responses.map((r) => r.respondent_id))

    setInsights({
      form_id: formId,
      total_responses: responses.length,
      total_respondents: uniqueRespondentIds.size,
      overall_weighted_score: overallScore,
      questions: questionInsights,
      segments: segmentInsights,
    })
    setLoading(false)
  }, [formId, supabase])

  useEffect(() => {
    loadInsights()
  }, [loadInsights])

  const exportCSV = async () => {
    setExporting(true)
    const res = await fetch(`/api/insights?formId=${formId}&format=csv`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formly-responses-${formId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const exportJSON = async () => {
    setExporting(true)
    const res = await fetch(`/api/insights?formId=${formId}&format=json`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formly-insights-${formId}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>
  }

  if (!insights) {
    return <div className="text-center py-12 text-gray-500">No data</div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/forms/${formId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
          <p className="text-sm text-gray-600">
            Response analytics and weighted scores
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportCSV}
            variant="secondary"
            size="sm"
            loading={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={exportJSON}
            variant="secondary"
            size="sm"
            loading={exporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-gray-600">Total Responses</p>
            <p className="text-3xl font-bold text-gray-900">
              {insights.total_responses}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-gray-600">Respondents</p>
            <p className="text-3xl font-bold text-gray-900">
              {insights.total_respondents}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-gray-600">Overall Weighted Score</p>
            <p className="text-3xl font-bold text-indigo-600">
              {insights.overall_weighted_score.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-gray-600">Questions</p>
            <p className="text-3xl font-bold text-gray-900">
              {insights.questions.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Question Insights */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold">Scores by Question</h2>
        </CardHeader>
        <CardContent>
          {insights.questions.length === 0 ? (
            <p className="text-sm text-gray-500">No questions</p>
          ) : (
            <div className="space-y-4">
              {insights.questions.map((q) => (
                <div
                  key={q.question_id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {q.question_text}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge>{q.question_type}</Badge>
                      <span className="text-xs text-gray-500">
                        {q.response_count} responses
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {q.average_score !== null ? (
                      <>
                        <p className="text-lg font-bold text-gray-900">
                          {q.average_score.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          weighted: {q.weighted_average?.toFixed(2)}
                        </p>
                        {q.outliers.length > 0 && (
                          <div className="flex items-center gap-1 text-amber-600 mt-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">
                              {q.outliers.length} outlier
                              {q.outliers.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">N/A</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-Segment Insights */}
      {insights.segments.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Scores by Segment</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.segments.map((s) => (
                <div
                  key={s.segment_id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{s.segment_name}</p>
                    <span className="text-xs text-gray-500">
                      {s.response_count} responses
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {s.average_score.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      weighted: {s.weighted_average.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
