import type { SupabaseClient } from '@supabase/supabase-js'

export type EventOption = { value: string; label: string }

export async function getEventOptions(supabase: SupabaseClient): Promise<EventOption[]> {
  const { data } = await supabase
    .from('events')
    .select('id, title')
    .order('created_at', { ascending: false })

  return (data ?? []).map((event) => ({ value: event.id, label: event.title }))
}
