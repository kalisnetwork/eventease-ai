'use client'

import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { ActionResult } from '@/lib/actions'

export type FieldOption = { value: string; label: string }

export type Field = {
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'date' | 'datetime-local' | 'select'
  required?: boolean
  options?: FieldOption[]
  placeholder?: string
  defaultValue?: string | number | null
  help?: string
  min?: number
  max?: number
  step?: string
  full?: boolean
}

type DynamicFormProps = {
  fields: Field[]
  action: (values: Record<string, string>) => Promise<ActionResult>
  submitLabel?: string
  onSuccess?: (result: Extract<ActionResult, { ok: true }>) => void
  onCancel?: () => void
  columns?: 1 | 2
}

const inputClass =
  'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

export function DynamicForm({
  fields,
  action,
  submitLabel = 'Save',
  onSuccess,
  onCancel,
  columns = 2,
}: DynamicFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.defaultValue === null || field.defaultValue === undefined
          ? ''
          : String(field.defaultValue),
      ])
    )
  )
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const setValue = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const missing: Record<string, string[]> = {}
    for (const field of fields) {
      if (field.required && !values[field.name]?.trim()) {
        missing[field.name] = [`${field.label} is required`]
      }
    }
    if (Object.keys(missing).length > 0) {
      setFieldErrors(missing)
      setError('Please complete the required fields.')
      return
    }

    setSubmitting(true)
    try {
      const result = await action(values)
      if (!result.ok) {
        setError(result.error)
        setFieldErrors(result.fieldErrors ?? {})
        return
      }
      onSuccess?.(result)
    } catch {
      setError('The request could not be completed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className={columns === 2 ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}>
        {fields.map((field) => {
          const fieldError = fieldErrors[field.name]?.[0]
          return (
            <div key={field.name} className={field.full || columns === 1 ? 'sm:col-span-2' : ''}>
              <label htmlFor={field.name} className="block text-sm font-medium text-slate-700">
                {field.label}
                {field.required && <span className="ml-0.5 text-red-500">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={values[field.name] ?? ''}
                  onChange={(event) => setValue(field.name, event.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className={inputClass}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={values[field.name] ?? ''}
                  onChange={(event) => setValue(field.name, event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type ?? 'text'}
                  value={values[field.name] ?? ''}
                  onChange={(event) => setValue(field.name, event.target.value)}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  className={inputClass}
                />
              )}

              {field.help && !fieldError && (
                <p className="mt-1 text-xs text-slate-500">{field.help}</p>
              )}
              {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
