import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { formId, respondentId, answers } = await request.json()

    if (!formId || !respondentId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'formId, respondentId, and answers array are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify form is published
    const { data: form } = await supabase
      .from('forms')
      .select('id, status')
      .eq('id', formId)
      .single()

    if (!form || form.status !== 'published') {
      return NextResponse.json(
        { error: 'Form is not accepting responses' },
        { status: 400 }
      )
    }

    const responses = answers.map(
      (a: { questionId: string; numericValue?: number; textValue?: string }) => ({
        form_id: formId,
        question_id: a.questionId,
        respondent_id: respondentId,
        numeric_value: a.numericValue ?? null,
        text_value: a.textValue ?? null,
      })
    )

    const { error: insertError } = await supabase
      .from('responses')
      .insert(responses)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: responses.length })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
