'use client'

import { useRouter } from 'next/navigation'
import { DynamicForm, type Field } from '@/components/ui/dynamic-form'
import { saveEvent } from '@/lib/actions'
import type { LookupMap } from '@/components/records/dialogs'

export function EventCreateForm({ lookups }: { lookups: LookupMap }) {
  const router = useRouter()

  const fields: Field[] = [
    {
      name: 'title',
      label: 'Event title',
      required: true,
      placeholder: 'e.g. Riya and Arjun wedding',
      full: true,
    },
    {
      name: 'event_type',
      label: 'Event type',
      type: 'select',
      required: true,
      options: lookups.event_type ?? [],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: lookups.event_status ?? [],
      defaultValue: 'draft',
    },
    {
      name: 'attendees',
      label: 'Expected attendees',
      type: 'number',
      required: true,
      min: 1,
      max: 100000,
      defaultValue: 1,
    },
    {
      name: 'total_budget',
      label: 'Total budget',
      type: 'number',
      required: true,
      min: 0,
      step: '0.01',
      defaultValue: 0,
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      required: true,
      options: lookups.currency ?? [],
      defaultValue: 'INR',
    },
    {
      name: 'location',
      label: 'Location',
      placeholder: 'Venue or city',
    },
    {
      name: 'start_at',
      label: 'Starts',
      type: 'datetime-local',
    },
    {
      name: 'end_at',
      label: 'Ends',
      type: 'datetime-local',
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Goals, theme, constraints, must-haves…',
      full: true,
    },
  ]

  return (
    <DynamicForm
      fields={fields}
      action={saveEvent}
      submitLabel="Create event"
      onCancel={() => router.push('/events')}
      onSuccess={(result) => {
        if (result.id) {
          router.push(`/events/${result.id}`)
        } else {
          router.push('/events')
        }
        router.refresh()
      }}
    />
  )
}
