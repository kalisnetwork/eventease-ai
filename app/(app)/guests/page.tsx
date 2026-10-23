import Link from 'next/link'
import { Users, UserCheck, UserX, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { loadLookups, labelOf } from '@/lib/data/lookups'
import { getEventOptions } from '@/lib/data/events'
import { summarizeGuests } from '@/lib/calculations/summary'
import {
  DeleteButton,
  GuestDialog,
  GuestRsvp,
} from '@/components/records/dialogs'

type GuestRow = {
  id: string
  event_id: string
  name: string
  email: string | null
  phone: string | null
  guest_group: string | null
  invitation_status: string
  rsvp_status: string
  plus_ones: number | null
  notes: string | null
  events: { id: string; title: string } | null
}

export default async function GuestsPage() {
  const supabase = await createClient()

  const [lookups, eventOptions, result] = await Promise.all([
    loadLookups(supabase),
    getEventOptions(supabase),
    supabase
      .from('guests')
      .select(
        'id, event_id, name, email, phone, guest_group, invitation_status, rsvp_status, plus_ones, notes, events (id, title)'
      )
      .order('name', { ascending: true }),
  ])

  const guests = (result.data ?? []) as unknown as GuestRow[]
  const summary = summarizeGuests(guests)

  const stats = [
    {
      label: 'Invited',
      value: String(summary.total),
      icon: Users,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Confirmed',
      value: String(summary.confirmed),
      icon: UserCheck,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Awaiting RSVP',
      value: String(summary.pending),
      icon: Clock,
      tone: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Declined',
      value: String(summary.declined),
      icon: UserX,
      tone: 'bg-slate-100 text-slate-600',
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Guests</h1>
          <p className="mt-1 text-sm text-slate-600">
            Guest list, RSVP status, plus ones, and headcount across events.
          </p>
        </div>
        {eventOptions.length > 0 && (
          <GuestDialog lookups={lookups} events={eventOptions} label="Add guest" />
        )}
      </div>

      {result.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Guests could not be loaded. Please refresh and try again.
        </div>
      ) : eventOptions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Users className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-sm font-medium text-slate-900">Create an event first</h2>
          <p className="mt-1 text-sm text-slate-500">
            Guests belong to an event. Create one to start building your guest list.
          </p>
          <Link
            href="/events/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create event
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${stat.tone}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-slate-600">
            Confirmed headcount including plus ones:{' '}
            <span className="font-semibold text-slate-900">{summary.confirmedAttendees}</span>
          </p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Guest list</h2>
            </div>
            <div className="p-6">
              {guests.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
                  <p className="text-sm text-slate-600">No guests added yet.</p>
                  <div className="mt-3 flex justify-center">
                    <GuestDialog
                      lookups={lookups}
                      events={eventOptions}
                      label="Add the first guest"
                    />
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="pb-2 pr-4 font-medium">Guest</th>
                        <th className="pb-2 pr-4 font-medium">Event</th>
                        <th className="pb-2 pr-4 font-medium">Group</th>
                        <th className="pb-2 pr-4 font-medium">Invitation</th>
                        <th className="pb-2 pr-4 font-medium">RSVP</th>
                        <th className="pb-2 pr-4 text-right font-medium">Plus ones</th>
                        <th className="pb-2 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {guests.map((guest) => (
                        <tr key={guest.id}>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-slate-900">{guest.name}</p>
                            {(guest.email || guest.phone) && (
                              <p className="text-xs text-slate-500">
                                {guest.email ?? guest.phone}
                              </p>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {guest.events ? (
                              <Link
                                href={`/events/${guest.events.id}`}
                                className="hover:text-blue-700"
                              >
                                {guest.events.title}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">{guest.guest_group ?? '—'}</td>
                          <td className="py-3 pr-4 text-slate-600">
                            {labelOf(lookups, 'invitation_status', guest.invitation_status)}
                          </td>
                          <td className="py-3 pr-4">
                            <GuestRsvp
                              id={guest.id}
                              value={guest.rsvp_status}
                              options={lookups.rsvp_status ?? []}
                            />
                          </td>
                          <td className="py-3 pr-4 text-right text-slate-600">
                            {guest.plus_ones ?? 0}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <GuestDialog
                                lookups={lookups}
                                events={eventOptions}
                                guest={guest}
                                label="Edit guest"
                                variant="icon"
                                icon="pencil"
                              />
                              <DeleteButton kind="guest" id={guest.id} name={guest.name} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
