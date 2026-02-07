'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export default function NewFormPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')

    // Get current user's org
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('organisation_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      setError('User organisation not found')
      setLoading(false)
      return
    }

    const { data: form, error: createError } = await supabase
      .from('forms')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        organisation_id: userData.organisation_id,
        created_by: user.id,
        status: 'draft',
      })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/forms/${form.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Form</h1>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium">Form Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              id="name"
              label="Form Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q1 Customer Satisfaction Survey"
            />
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-3 py-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for your form"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" loading={loading}>
                Create Form
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
