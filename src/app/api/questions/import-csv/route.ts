import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Papa from 'papaparse'

interface CSVRow {
  text?: string
  type?: string
  category?: string
  weight?: string
  options?: string
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const formId = formData.get('formId') as string | null

    if (!file || !formId) {
      return NextResponse.json(
        { error: 'file and formId are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify form access
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

    const text = await file.text()
    const { data: rows, errors } = Papa.parse<CSVRow>(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (errors.length > 0) {
      return NextResponse.json(
        { error: `CSV parse error: ${errors[0].message}` },
        { status: 400 }
      )
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      )
    }

    const validTypes = ['likert', 'multiple_choice', 'short_text']

    const questions = rows
      .filter((row) => row.text?.trim())
      .map((row, idx) => {
        const type = validTypes.includes(row.type || '') ? row.type : 'likert'
        const options =
          type === 'multiple_choice' && row.options
            ? row.options.split('|').map((o) => o.trim())
            : null

        return {
          form_id: formId,
          text: row.text!.trim(),
          type,
          category: row.category?.trim() || null,
          default_weight: parseFloat(row.weight || '1') || 1,
          options,
          order_index: startIndex + idx,
        }
      })

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No valid questions found in CSV' },
        { status: 400 }
      )
    }

    const { error: insertError } = await supabase
      .from('questions')
      .insert(questions)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ count: questions.length })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
