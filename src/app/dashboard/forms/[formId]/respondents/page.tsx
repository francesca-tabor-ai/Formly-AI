'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import type { Respondent, Segment } from '@/types/database'

export default function RespondentsPage() {
  const { formId } = useParams<{ formId: string }>()
  const [respondents, setRespondents] = useState<
    (Respondent & { segment_name?: string })[]
  >([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [segmentId, setSegmentId] = useState('')
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    const [respondentRes, segmentRes] = await Promise.all([
      supabase
        .from('respondents')
        .select('*, segments(name)')
        .eq('form_id', formId)
        .order('created_at', { ascending: false }),
      supabase
        .from('segments')
        .select('*')
        .eq('form_id', formId)
        .order('name'),
    ])

    const mapped = (respondentRes.data ?? []).map((r) => ({
      ...r,
      segment_name: (r.segments as { name: string } | null)?.name,
    }))
    setRespondents(mapped)
    setSegments(segmentRes.data ?? [])
    setLoading(false)
  }, [formId, supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const addRespondent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    await supabase.from('respondents').insert({
      form_id: formId,
      email: email.trim() || null,
      segment_id: segmentId || null,
    })

    setEmail('')
    setSegmentId('')
    setSaving(false)
    setShowAdd(false)
    loadData()
  }

  const deleteRespondent = async (id: string) => {
    await supabase.from('respondents').delete().eq('id', id)
    loadData()
  }

  const segmentOptions = [
    { value: '', label: 'No segment' },
    ...segments.map((s) => ({ value: s.id, label: s.name })),
  ]

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/forms/${formId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Respondents</h1>
          <p className="text-sm text-gray-600">
            Manage respondents and assign them to segments
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Respondent
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : respondents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No respondents yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Add respondents manually or they will be created when someone
              submits the form.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {respondents.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {r.email || 'Anonymous'}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    {r.segment_name && (
                      <Badge>{r.segment_name}</Badge>
                    )}
                    <span className="text-xs text-gray-400">
                      Added {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteRespondent(r.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Respondent"
      >
        <form onSubmit={addRespondent} className="space-y-4">
          <Input
            id="email"
            label="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="respondent@example.com"
          />
          <Select
            id="segment"
            label="Segment"
            options={segmentOptions}
            value={segmentId}
            onChange={(e) => setSegmentId(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>
              Add Respondent
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
    </div>
  )
}
