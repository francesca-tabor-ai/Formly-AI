'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import type { Form, Question } from '@/types/database'

export default function RespondPage() {
  const { formId } = useParams<{ formId: string }>()
  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<
    Record<string, { numericValue?: number; textValue?: string }>
  >({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const loadForm = useCallback(async () => {
    const [formRes, questionsRes] = await Promise.all([
      supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('status', 'published')
        .single(),
      supabase
        .from('questions')
        .select('*')
        .eq('form_id', formId)
        .order('order_index'),
    ])

    setForm(formRes.data)
    setQuestions(questionsRes.data ?? [])
    setLoading(false)
  }, [formId, supabase])

  useEffect(() => {
    loadForm()
  }, [loadForm])

  const setAnswer = (
    questionId: string,
    value: { numericValue?: number; textValue?: string }
  ) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')

    try {
      // Create anonymous respondent
      const { data: respondent, error: respError } = await supabase
        .from('respondents')
        .insert({ form_id: formId })
        .select()
        .single()

      if (respError || !respondent) {
        throw new Error(respError?.message || 'Failed to create respondent')
      }

      const answerArray = Object.entries(answers).map(
        ([questionId, value]) => ({
          questionId,
          numericValue: value.numericValue,
          textValue: value.textValue,
        })
      )

      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          respondentId: respondent.id,
          answers: answerArray,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading form...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Form not found</h1>
          <p className="mt-2 text-gray-600">
            This form may not exist or is no longer accepting responses.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold text-gray-900">
            Response submitted
          </h1>
          <p className="mt-2 text-gray-600">
            Thank you for completing this form.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{form.name}</h1>
          {form.description && (
            <p className="mt-2 text-gray-600">{form.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id}>
              <CardHeader>
                <h3 className="font-medium text-gray-900">
                  <span className="text-gray-400 mr-2">{idx + 1}.</span>
                  {q.text}
                </h3>
              </CardHeader>
              <CardContent>
                {q.type === 'likert' && (
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          setAnswer(q.id, { numericValue: val })
                        }
                        className={`w-12 h-12 rounded-lg border-2 font-medium transition-colors ${
                          answers[q.id]?.numericValue === val
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                    <div className="flex items-center ml-2 text-xs text-gray-400">
                      <span>1 = Strongly Disagree</span>
                      <span className="mx-2">|</span>
                      <span>5 = Strongly Agree</span>
                    </div>
                  </div>
                )}

                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2">
                    {(q.options as string[]).map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setAnswer(q.id, { numericValue: i + 1, textValue: opt })
                        }
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                          answers[q.id]?.textValue === opt
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'short_text' && (
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Type your answer..."
                    value={answers[q.id]?.textValue || ''}
                    onChange={(e) =>
                      setAnswer(q.id, { textValue: e.target.value })
                    }
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={handleSubmit}
            loading={submitting}
            size="lg"
            disabled={questions.length === 0}
          >
            Submit Response
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Powered by Formly AI
        </p>
      </div>
    </div>
  )
}
