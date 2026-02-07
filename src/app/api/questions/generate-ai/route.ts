import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { prompt, count = 5, formId } = await request.json()

    if (!prompt || !formId) {
      return NextResponse.json(
        { error: 'prompt and formId are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    const supabase = await createClient()

    // Verify the user has access to this form
    const { data: form } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .single()

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Get existing question count for order_index
    const { count: existingCount } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('form_id', formId)

    const startIndex = existingCount ?? 0

    const systemPrompt = `You are a form question generator. Generate exactly ${count} questions based on the user's description.

Return a JSON array of question objects. Each object must have:
- "text": the question text
- "type": one of "likert", "multiple_choice", or "short_text"
- "category": a short category label
- "default_weight": a number between 0.5 and 2.0 indicating importance
- "options": for multiple_choice, an array of 3-5 option strings; null for other types

Mix question types appropriately. Use likert for rating/agreement questions, multiple_choice for categorical questions, and short_text for open-ended questions. Respond ONLY with the JSON array, no other text.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errData = await response.json()
      return NextResponse.json(
        { error: errData.error?.message || 'AI generation failed' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    let parsed = JSON.parse(content)
    // Handle wrapped response like { "questions": [...] }
    if (parsed.questions && Array.isArray(parsed.questions)) {
      parsed = parsed.questions
    }
    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { error: 'Invalid AI response format' },
        { status: 500 }
      )
    }

    const validTypes = ['likert', 'multiple_choice', 'short_text']
    const questions = parsed
      .filter(
        (q: { text?: string; type?: string }) =>
          q.text && validTypes.includes(q.type || '')
      )
      .map((q: { text: string; type: string; category?: string; default_weight?: number; options?: string[] }, idx: number) => ({
        form_id: formId,
        text: q.text,
        type: q.type,
        category: q.category || null,
        default_weight: q.default_weight ?? 1,
        options: q.type === 'multiple_choice' ? q.options : null,
        order_index: startIndex + idx,
      }))

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'AI did not generate valid questions' },
        { status: 500 }
      )
    }

    const { error: insertError } = await supabase
      .from('questions')
      .insert(questions)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ count: questions.length, questions })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
