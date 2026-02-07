'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  Sparkles,
  Upload,
  ArrowLeft,
  GripVertical,
} from 'lucide-react'
import type { Question, QuestionType } from '@/types/database'

const questionTypeOptions = [
  { value: 'likert', label: 'Likert Scale (1-5)' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_text', label: 'Short Text' },
]

const typeLabel: Record<QuestionType, string> = {
  likert: 'Likert 1-5',
  multiple_choice: 'Multiple Choice',
  short_text: 'Short Text',
}

export default function QuestionsPage() {
  const { formId } = useParams<{ formId: string }>()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showCSV, setShowCSV] = useState(false)
  
  // Only create client in browser to avoid SSR issues
  const supabase = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createClient()
    }
    return null
  }, [])

  // Add question form state
  const [newText, setNewText] = useState('')
  const [newType, setNewType] = useState<QuestionType>('likert')
  const [newCategory, setNewCategory] = useState('')
  const [newWeight, setNewWeight] = useState('1')
  const [newOptions, setNewOptions] = useState('')
  const [saving, setSaving] = useState(false)

  // AI generation state
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiCount, setAiCount] = useState('5')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvError, setCsvError] = useState('')

  const loadQuestions = useCallback(async () => {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', formId)
      .order('order_index')
    setQuestions(data ?? [])
    setLoading(false)
  }, [formId, supabase])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const addQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newText.trim() || !supabase) return
    setSaving(true)

    const options =
      newType === 'multiple_choice' && newOptions.trim()
        ? newOptions.split(',').map((o) => o.trim())
        : null

    await supabase.from('questions').insert({
      form_id: formId,
      text: newText.trim(),
      type: newType,
      category: newCategory.trim() || null,
      default_weight: parseFloat(newWeight) || 1,
      options,
      order_index: questions.length,
    })

    setNewText('')
    setNewType('likert')
    setNewCategory('')
    setNewWeight('1')
    setNewOptions('')
    setSaving(false)
    setShowAdd(false)
    loadQuestions()
  }

  const deleteQuestion = async (id: string) => {
    if (!supabase) return
    await supabase.from('questions').delete().eq('id', id)
    loadQuestions()
  }

  const generateAI = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setAiError('')

    try {
      const res = await fetch('/api/questions/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          count: parseInt(aiCount),
          formId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate questions')
      }

      setAiPrompt('')
      setShowAI(false)
      loadQuestions()
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Generation failed')
    }
    setAiLoading(false)
  }

  const importCSV = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile) return
    setCsvLoading(true)
    setCsvError('')

    try {
      const formData = new FormData()
      formData.append('file', csvFile)
      formData.append('formId', formId)

      const res = await fetch('/api/questions/import-csv', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to import CSV')
      }

      setCsvFile(null)
      setShowCSV(false)
      loadQuestions()
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : 'Import failed')
    }
    setCsvLoading(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <p className="text-sm text-gray-600">
            Manage questions for this form
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCSV(true)} variant="secondary" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setShowAI(true)} variant="secondary" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={() => setShowAdd(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No questions yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Add questions manually, generate with AI, or import a CSV.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <Card key={q.id}>
              <CardContent className="flex items-start gap-3">
                <div className="text-gray-400 mt-1">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm text-gray-400 mr-2">
                        {idx + 1}.
                      </span>
                      <span className="font-medium text-gray-900">
                        {q.text}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge>{typeLabel[q.type]}</Badge>
                    {q.category && <Badge variant="default">{q.category}</Badge>}
                    <Badge variant="default">Weight: {q.default_weight}</Badge>
                  </div>
                  {q.options && q.type === 'multiple_choice' && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(q.options as string[]).map((opt, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Question Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Question">
        <form onSubmit={addQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text
            </label>
            <textarea
              rows={2}
              className="block w-full rounded-md border px-3 py-2 text-sm"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              required
            />
          </div>
          <Select
            id="type"
            label="Question Type"
            options={questionTypeOptions}
            value={newType}
            onChange={(e) => setNewType(e.target.value as QuestionType)}
          />
          {newType === 'multiple_choice' && (
            <Input
              id="options"
              label="Options (comma-separated)"
              value={newOptions}
              onChange={(e) => setNewOptions(e.target.value)}
              placeholder="Option A, Option B, Option C"
            />
          )}
          <Input
            id="category"
            label="Category (optional)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Input
            id="weight"
            label="Default Weight"
            type="number"
            step="0.1"
            min="0"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>
              Add Question
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Generate Modal */}
      <Modal
        open={showAI}
        onClose={() => setShowAI(false)}
        title="AI Question Generation"
      >
        <form onSubmit={generateAI} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe what questions you need
            </label>
            <textarea
              rows={3}
              className="block w-full rounded-md border px-3 py-2 text-sm"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Generate questions for a customer satisfaction survey about our SaaS product"
              required
            />
          </div>
          <Input
            id="count"
            label="Number of questions"
            type="number"
            min="1"
            max="20"
            value={aiCount}
            onChange={(e) => setAiCount(e.target.value)}
          />
          {aiError && <p className="text-sm text-red-600">{aiError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={aiLoading}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAI(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        open={showCSV}
        onClose={() => setShowCSV(false)}
        title="Import Questions from CSV"
      >
        <form onSubmit={importCSV} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Upload a CSV with columns: <code>text</code>, <code>type</code>{' '}
              (likert, multiple_choice, short_text), <code>category</code>{' '}
              (optional), <code>weight</code> (optional)
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          {csvError && <p className="text-sm text-red-600">{csvError}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={csvLoading} disabled={!csvFile}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCSV(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
