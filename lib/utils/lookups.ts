import lookups from '@/lib/constants/lookups.json'

export function getOptions(key: string) {
  return (lookups as Record<string, Array<{ value?: string; code?: string; label: string }>>)[key] || []
}

export function getLabel(key: string, value: string | null | undefined) {
  if (value == null || value === '') return null
  const options = getOptions(key)
  const found = options.find((o) => o.value === value || o.code === value)
  return found?.label || value
}
