import Link from 'next/link'
import { Store, BadgeCheck, FileText, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { loadLookups, labelOf } from '@/lib/data/lookups'
import { getEventOptions } from '@/lib/data/events'
import { formatMoney } from '@/lib/calculations/summary'
import { DeleteButton, VendorDialog } from '@/components/records/dialogs'

type VendorRow = {
  id: string
  event_id: string
  name: string
  category: string
  location: string | null
  quoted_price: number | string | null
  availability: string
  contact: string | null
  notes: string | null
  quotation_status: string
  events: { id: string; title: string; currency: string | null } | null
}

const statusStyles: Record<string, string> = {
  requested: 'bg-slate-100 text-slate-700',
  received: 'bg-blue-50 text-blue-700',
  shortlisted: 'bg-purple-50 text-purple-700',
  rejected: 'bg-red-50 text-red-700',
  booked: 'bg-emerald-50 text-emerald-700',
}

export default async function VendorsPage() {
  const supabase = await createClient()

  const [lookups, eventOptions, result] = await Promise.all([
    loadLookups(supabase),
    getEventOptions(supabase),
    supabase
      .from('vendors')
      .select(
        'id, event_id, name, category, location, quoted_price, availability, contact, notes, quotation_status, events (id, title, currency)'
      )
      .order('created_at', { ascending: false }),
  ])

  const vendors = (result.data ?? []) as unknown as VendorRow[]
  const currency = (vendors[0]?.events?.currency ?? 'INR') as string
  const quotedTotal = vendors.reduce(
    (sum, vendor) => sum + Number(vendor.quoted_price ?? 0),
    0
  )
  const booked = vendors.filter((vendor) => vendor.quotation_status === 'booked').length
  const shortlisted = vendors.filter(
    (vendor) => vendor.quotation_status === 'shortlisted'
  ).length

  const stats = [
    {
      label: 'Vendors',
      value: String(vendors.length),
      icon: Store,
      tone: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Shortlisted',
      value: String(shortlisted),
      icon: FileText,
      tone: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Booked',
      value: String(booked),
      icon: BadgeCheck,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Quoted value',
      value: formatMoney(quotedTotal, currency),
      icon: Wallet,
      tone: 'bg-slate-100 text-slate-600',
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Vendors</h1>
          <p className="mt-1 text-sm text-slate-600">
            Your own vendor directory with quotes and booking status.
          </p>
        </div>
        {eventOptions.length > 0 && (
          <VendorDialog lookups={lookups} events={eventOptions} label="Add vendor" />
        )}
      </div>

      {result.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Vendors could not be loaded. Please refresh and try again.
        </div>
      ) : eventOptions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Store className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 text-sm font-medium text-slate-900">Create an event first</h2>
          <p className="mt-1 text-sm text-slate-500">
            Vendors belong to an event. Create one to start your vendor list.
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
                    <p className="mt-2 text-xl font-semibold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-2 ${stat.tone}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Vendor directory</h2>
            </div>
            <div className="p-6">
              {vendors.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
                  <p className="text-sm text-slate-600">No vendors added yet.</p>
                  <div className="mt-3 flex justify-center">
                    <VendorDialog
                      lookups={lookups}
                      events={eventOptions}
                      label="Add the first vendor"
                    />
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="pb-2 pr-4 font-medium">Vendor</th>
                        <th className="pb-2 pr-4 font-medium">Event</th>
                        <th className="pb-2 pr-4 font-medium">Category</th>
                        <th className="pb-2 pr-4 text-right font-medium">Quote</th>
                        <th className="pb-2 pr-4 font-medium">Availability</th>
                        <th className="pb-2 pr-4 font-medium">Status</th>
                        <th className="pb-2 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vendors.map((vendor) => (
                        <tr key={vendor.id}>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-slate-900">{vendor.name}</p>
                            <p className="text-xs text-slate-500">
                              {vendor.contact ?? vendor.location ?? 'No contact details'}
                            </p>
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {vendor.events ? (
                              <Link
                                href={`/events/${vendor.events.id}`}
                                className="hover:text-blue-700"
                              >
                                {vendor.events.title}
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {labelOf(lookups, 'vendor_category', vendor.category)}
                          </td>
                          <td className="py-3 pr-4 text-right text-slate-700">
                            {vendor.quoted_price === null
                              ? '—'
                              : formatMoney(
                                  vendor.quoted_price,
                                  vendor.events?.currency ?? currency
                                )}
                          </td>
                          <td className="py-3 pr-4 text-slate-600">
                            {labelOf(lookups, 'vendor_availability', vendor.availability)}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                statusStyles[vendor.quotation_status] ??
                                statusStyles.requested
                              }`}
                            >
                              {labelOf(
                                lookups,
                                'vendor_quotation_status',
                                vendor.quotation_status
                              )}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-1">
                              <VendorDialog
                                lookups={lookups}
                                events={eventOptions}
                                vendor={vendor}
                                label="Edit vendor"
                                variant="icon"
                                icon="pencil"
                              />
                              <DeleteButton
                                kind="vendor"
                                id={vendor.id}
                                name={vendor.name}
                              />
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
