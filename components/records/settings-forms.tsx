'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2 } from 'lucide-react'
import { DynamicForm, type Field } from '@/components/ui/dynamic-form'
import { saveProfile } from '@/lib/actions'
import { createClient } from '@/lib/supabase/client'

export function ProfileForm({ fullName }: { fullName: string }) {
  const router = useRouter()

  const fields: Field[] = [
    {
      name: 'full_name',
      label: 'Full name',
      required: true,
      defaultValue: fullName,
      full: true,
    },
  ]

  return (
    <DynamicForm
      fields={fields}
      columns={1}
      action={saveProfile}
      submitLabel="Save profile"
      onSuccess={() => router.refresh()}
    />
  )
}

export function PasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setStatus('saving')
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setStatus('idle')
      return
    }

    setPassword('')
    setConfirm('')
    setStatus('saved')
    router.refresh()
  }

  const inputClass =
    'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
          placeholder="Repeat the new password"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {status === 'saved' && (
        <p className="text-sm text-emerald-700">Your password has been updated.</p>
      )}

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {status === 'saving' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          {status === 'saving' ? 'Updating…' : 'Update password'}
        </button>
      </div>
    </form>
  )
}
