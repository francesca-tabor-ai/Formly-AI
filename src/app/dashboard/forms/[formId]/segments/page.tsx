'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ArrowLeft, Pencil } from 'lucide-react'
import type { Segment } from '@/types/database'

export default function SegmentsPage() {
  const { formId } = useParams<{ formId: string }>()
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null)
  
  // Only create client in browser to avoid SSR issues
  const supabase = useMemo(() => {
    if (typeof window !== 'undefined') {
      return createClient()
    }
    return null
  }, [])

  const [name, setName] = useState('')
  const [weight, setWeight] = useState('1')
  const [saving, setSaving] = useState(false)

  const loadSegments = useCallback(async () => {
    if (!supabase) return
    const { data } = await supabase
      .from('segments')
      .select('*')
      .eq('form_id', formId)
      .order('created_at')
    setSegments(data ?? [])
    setLoading(false)
  }, [formId, supabase])

  useEffect(() => {
    loadSegments()
  }, [loadSegments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !supabase) return
    setSaving(true)

    if (editingSegment) {
      await supabase
        .from('segments')
        .update({ name: name.trim(), weight: parseFloat(weight) || 1 })
        .eq('id', editingSegment.id)
    } else {
      await supabase.from('segments').insert({
        form_id: formId,
        name: name.trim(),
        weight: parseFloat(weight) || 1,
      })
    }

    setName('')
    setWeight('1')
    setSaving(false)
    setShowAdd(false)
    setEditingSegment(null)
    loadSegments()
  }

  const startEdit = (segment: Segment) => {
    setEditingSegment(segment)
    setName(segment.name)
    setWeight(String(segment.weight))
    setShowAdd(true)
  }

  const deleteSegment = async (id: string) => {
    if (!confirm('Delete this segment?') || !supabase) return
    await supabase.from('segments').delete().eq('id', id)
    loadSegments()
  }

  const closeModal = () => {
    setShowAdd(false)
    setEditingSegment(null)
    setName('')
    setWeight('1')
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
          <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
          <p className="text-sm text-gray-600">
            Create audience segments for targeted questions
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Segment
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : segments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No segments yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Segments let you group respondents and assign targeted questions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {segments.map((segment) => (
            <Card key={segment.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{segment.name}</h3>
                  <Badge variant="default">Weight: {segment.weight}</Badge>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(segment)}
                    className="text-gray-400 hover:text-indigo-500"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteSegment(segment.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showAdd}
        onClose={closeModal}
        title={editingSegment ? 'Edit Segment' : 'Add Segment'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Segment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Managers, Customers, Partners"
            required
          />
          <Input
            id="weight"
            label="Segment Weight"
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>
              {editingSegment ? 'Update' : 'Add'} Segment
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
