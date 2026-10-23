import { createClient } from '@/lib/supabase/server'
import { ProfileForm, PasswordForm } from '@/components/records/settings-forms'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id ?? '')
    .maybeSingle()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your profile details and account security.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Profile</h2>
            <p className="text-sm text-slate-500">This name appears throughout your workspace.</p>
          </div>
          <div className="p-6">
            <ProfileForm fullName={profile?.full_name ?? ''} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Account</h2>
            <p className="text-sm text-slate-500">Your sign-in email address.</p>
          </div>
          <div className="space-y-5 p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{user?.email ?? '—'}</p>
              <p className="mt-1 text-xs text-slate-500">
                Email changes are handled through account verification and are not available in
                the app yet.
              </p>
            </div>
            <div className="border-t border-slate-100 pt-5">
              <h3 className="text-sm font-semibold text-slate-900">Change password</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Choose a new password with at least 8 characters.
              </p>
              <div className="mt-4">
                <PasswordForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
