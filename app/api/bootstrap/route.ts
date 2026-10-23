import { createClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/utils/api'
import lookups from '@/lib/constants/lookups.json'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return jsonError('Authentication required', 401, 'UNAUTHENTICATED')
    }

    const [profileRes, eventsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('events').select('id, title, status, start_at, total_budget, currency').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
    ])

    const counts = {
      events_total: eventsRes.data?.length || 0,
      events_active: eventsRes.data?.filter(e => e.status !== 'archived').length || 0,
    }

    return Response.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        profile: profileRes.data || null,
        events: eventsRes.data || [],
        counts,
        lookups,
        permissions: {
          can_create_event: true,
          can_edit_event: true,
          can_delete_event: true,
        },
        version: '1.0.0',
      }
    })
  } catch (error) {
    return jsonError('Failed to load bootstrap data', 500, 'BOOTSTRAP_ERROR')
  }
}
