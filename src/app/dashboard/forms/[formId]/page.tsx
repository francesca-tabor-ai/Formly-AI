'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  FileText,
  ListChecks,
  Users,
  UserCheck,
  BarChart3,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import type { Form, FormStatus } from '@/types/database'

const statusVariant: Record<string, 'default' | 'success' | 'warning'> = {
  draft: 'default',
  published: 'success',
  closed: 'warning',
}

export default function FormDetailPage() {
  const { formId } = useParams<{ formId: string }>()
  const router = useRouter()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [segmentCount, setSegmentCount] = useState(0)
  const [respondentCount, setRespondentCount] = useState(0)
  const [responseCount, setResponseCount] = useState(0)
  
  // Only create client in browser to avoid SSR issues
  const supabase = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createClient()
    }
    return null
  }, [])

  const loadForm = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single()
    setForm(data)
    setLoading(false)
  }, [formId, supabase])

  const loadCounts = useCallback(async () => {
    if (!supabase) return
    const [questions, segments, respondents, responses] = await Promise.all([
      supabase
        .from('questions')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId),
      supabase
        .from('segments')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId),
      supabase
        .from('respondents')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId),
      supabase
        .from('responses')
        .select('id', { count: 'exact', head: true })
        .eq('form_id', formId),
    ])
    setQuestionCount(questions.count ?? 0)
    setSegmentCount(segments.count ?? 0)
    setRespondentCount(respondents.count ?? 0)
    setResponseCount(responses.count ?? 0)
  }, [formId, supabase])

  useEffect(() => {
    loadForm()
    loadCounts()
  }, [loadForm, loadCounts])

  const updateStatus = async (status: FormStatus) => {
    if (!supabase) return
    await supabase.from('forms').update({ status }).eq('id', formId)
    loadForm()
  }

  const copyLink = () => {
    const url = `${window.location.origin}/respond/${formId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const deleteForm = async () => {
    if (!confirm('Are you sure you want to delete this form?') || !supabase) return
    await supabase.from('forms').delete().eq('id', formId)
    router.push('/dashboard')
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>
  }

  if (!form) {
    return <div className="text-center py-12 text-gray-500">Form not found</div>
  }

  const tabs = [
    {
      name: 'Questions',
      href: `/dashboard/forms/${formId}/questions`,
      icon: ListChecks,
      count: questionCount,
    },
    {
      name: 'Segments',
      href: `/dashboard/forms/${formId}/segments`,
      icon: Users,
      count: segmentCount,
    },
    {
      name: 'Respondents',
      href: `/dashboard/forms/${formId}/respondents`,
      icon: UserCheck,
      count: respondentCount,
    },
    {
      name: 'Insights',
      href: `/dashboard/forms/${formId}/insights`,
      icon: BarChart3,
      count: responseCount,
      label: 'responses',
    },
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{form.name}</h1>
            <Badge variant={statusVariant[form.status]}>{form.status}</Badge>
          </div>
          {form.description && (
            <p className="mt-1 text-gray-600">{form.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {form.status === 'draft' && (
            <Button onClick={() => updateStatus('published')} size="sm">
              Publish
            </Button>
          )}
          {form.status === 'published' && (
            <Button
              onClick={() => updateStatus('closed')}
              variant="secondary"
              size="sm"
            >
              Close Form
            </Button>
          )}
          {form.status === 'closed' && (
            <Button
              onClick={() => updateStatus('draft')}
              variant="secondary"
              size="sm"
            >
              Reopen as Draft
            </Button>
          )}
          <Button onClick={deleteForm} variant="danger" size="sm">
            Delete
          </Button>
        </div>
      </div>

      {form.status === 'published' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Share link:{' '}
              <code className="bg-green-100 px-1 rounded">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}/respond/${formId}`
                  : `/respond/${formId}`}
              </code>
            </span>
          </div>
          <Button onClick={copyLink} variant="ghost" size="sm">
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {tabs.map((tab) => (
          <Link key={tab.name} href={tab.href}>
            <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
              <CardContent className="py-6 text-center">
                <tab.icon className="h-8 w-8 text-indigo-500 mx-auto" />
                <h3 className="mt-2 font-medium text-gray-900">{tab.name}</h3>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {tab.count}
                </p>
                <p className="text-xs text-gray-500">
                  {tab.label ?? tab.name.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Card>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>
                Created {new Date(form.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
