import type { SupabaseClient } from '@supabase/supabase-js'

export type LookupOption = { value: string; label: string }
export type LookupMap = Record<string, LookupOption[]>

export async function loadLookups(supabase: SupabaseClient): Promise<LookupMap> {
  const { data } = await supabase
    .from('lookups')
    .select('type, value, label, sort_order')
    .order('sort_order', { ascending: true })

  const map: LookupMap = {}
  for (const row of data ?? []) {
    if (!map[row.type]) map[row.type] = []
    map[row.type].push({ value: row.value, label: row.label })
  }
  return map
}

export function options(map: LookupMap, type: string): LookupOption[] {
  return map[type] ?? []
}

export function labelOf(
  map: LookupMap,
  type: string,
  value: string | null | undefined,
  fallback = '—'
): string {
  if (!value) return fallback
  return map[type]?.find((option) => option.value === value)?.label ?? value
}
