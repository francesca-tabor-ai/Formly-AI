'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, FileText } from 'lucide-react'
import type { Form } from '@/types/database'

const statusVariant: Record<string, 'default' | 'success' | 'warning'> = {
  draft: 'default',
  published: 'success',
  closed: 'warning',
}

export default function DashboardPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadForms() {
      const { data } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false })
      setForms(data ?? [])
      setLoading(false)
    }
    loadForms()
  }, [supabase])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage your forms and assessments
          </p>
        </div>
        <Link href="/dashboard/forms/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Form
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No forms yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Create your first form to get started.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/forms/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <Link key={form.id} href={`/dashboard/forms/${form.id}`}>
              <Card className="hover:border-indigo-300 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{form.name}</h3>
                    {form.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {form.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      Created{' '}
                      {new Date(form.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={statusVariant[form.status]}>
                    {form.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
