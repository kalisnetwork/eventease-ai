import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your full name').max(120, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password is too long'),
})

export const eventSchema = z.object({
  title: z.string().trim().min(1, 'Enter an event title').max(120, 'Title is too long'),
  event_type: z.string().min(1, 'Select an event type'),
  description: z.string().trim().max(4000, 'Description is too long').optional().or(z.literal('')),
  location: z.string().trim().max(200, 'Location is too long').optional().or(z.literal('')),
  start_at: z.string().optional().or(z.literal('')),
  end_at: z.string().optional().or(z.literal('')),
  attendees: z.coerce.number().int('Enter a whole number').positive('Must be greater than 0').max(100000, 'Too many attendees'),
  total_budget: z.coerce.number().min(0, 'Budget cannot be negative').max(999999999, 'Budget is too large'),
  currency: z.string().length(3, 'Select a currency'),
  status: z.enum(['draft', 'planning', 'confirmed', 'completed', 'archived']),
})

export const taskSchema = z.object({
  title: z.string().trim().min(1, 'Enter a task title').max(200, 'Title is too long'),
  description: z.string().trim().max(2000, 'Description is too long').optional().or(z.literal('')),
  due_at: z.string().optional().or(z.literal('')),
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().max(60).optional().or(z.literal('')),
})

export const expenseSchema = z.object({
  label: z.string().trim().min(1, 'Enter a label').max(160, 'Label is too long'),
  category: z.enum(['venue', 'catering', 'decoration', 'photography', 'entertainment', 'transportation', 'other']),
  planned_amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  actual_amount: z.coerce.number().min(0, 'Amount cannot be negative'),
  incurred_on: z.string().optional().or(z.literal('')),
})

export const guestSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(160, 'Name is too long'),
  email: z.string().trim().email('Enter a valid email').max(254).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  guest_group: z.string().trim().max(60).optional().or(z.literal('')),
  invitation_status: z.enum(['not_sent', 'marked_sent']),
  rsvp_status: z.enum(['pending', 'confirmed', 'declined', 'maybe']),
  plus_ones: z.coerce.number().int().min(0).max(20),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
})

export const vendorSchema = z.object({
  name: z.string().trim().min(1, 'Enter a name').max(160, 'Name is too long'),
  category: z.enum(['venue', 'catering', 'decoration', 'photography', 'entertainment', 'transportation', 'other']),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  quoted_price: z.coerce.number().min(0, 'Price cannot be negative').optional().or(z.literal('')),
  availability: z.enum(['unknown', 'available', 'unavailable']),
  contact: z.string().trim().max(300).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  quotation_status: z.enum(['requested', 'received', 'shortlisted', 'rejected', 'booked']),
})
