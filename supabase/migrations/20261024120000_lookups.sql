-- EventEase AI — database-driven lookups
-- All select options and display labels come from this table.
-- Reference data is public read-only; only migrations/service role may write.

create table public.lookups (
  type text not null check (char_length(btrim(type)) between 1 and 60),
  value text not null check (char_length(btrim(value)) between 1 and 60),
  label text not null check (char_length(btrim(label)) between 1 and 120),
  sort_order integer not null default 0,
  primary key (type, value)
);

alter table public.lookups enable row level security;

create policy lookups_read_all on public.lookups
  for select to anon, authenticated using (true);

revoke insert, update, delete on public.lookups from anon, authenticated;
grant select on public.lookups to anon, authenticated;

insert into public.lookups (type, value, label, sort_order) values
  ('currency', 'INR', 'Indian Rupee (₹)', 10),
  ('currency', 'USD', 'US Dollar ($)', 20),
  ('currency', 'EUR', 'Euro (€)', 30),
  ('currency', 'GBP', 'British Pound (£)', 40),

  ('event_type', 'birthday', 'Birthday', 10),
  ('event_type', 'wedding', 'Wedding', 20),
  ('event_type', 'corporate', 'Corporate Event', 30),
  ('event_type', 'conference', 'Conference', 40),
  ('event_type', 'anniversary', 'Anniversary', 50),
  ('event_type', 'party', 'Party', 60),
  ('event_type', 'other', 'Other', 70),

  ('event_status', 'draft', 'Draft', 10),
  ('event_status', 'planning', 'Planning', 20),
  ('event_status', 'confirmed', 'Confirmed', 30),
  ('event_status', 'completed', 'Completed', 40),
  ('event_status', 'archived', 'Archived', 50),

  ('task_status', 'todo', 'To do', 10),
  ('task_status', 'in_progress', 'In progress', 20),
  ('task_status', 'done', 'Done', 30),
  ('task_status', 'cancelled', 'Cancelled', 40),

  ('task_priority', 'low', 'Low', 10),
  ('task_priority', 'medium', 'Medium', 20),
  ('task_priority', 'high', 'High', 30),

  ('expense_category', 'venue', 'Venue', 10),
  ('expense_category', 'catering', 'Catering', 20),
  ('expense_category', 'decoration', 'Decoration', 30),
  ('expense_category', 'photography', 'Photography', 40),
  ('expense_category', 'entertainment', 'Entertainment', 50),
  ('expense_category', 'transportation', 'Transportation', 60),
  ('expense_category', 'other', 'Other', 70),

  ('vendor_category', 'venue', 'Venue', 10),
  ('vendor_category', 'catering', 'Catering', 20),
  ('vendor_category', 'decoration', 'Decoration', 30),
  ('vendor_category', 'photography', 'Photography', 40),
  ('vendor_category', 'entertainment', 'Entertainment', 50),
  ('vendor_category', 'transportation', 'Transportation', 60),
  ('vendor_category', 'other', 'Other', 70),

  ('vendor_availability', 'unknown', 'Unknown', 10),
  ('vendor_availability', 'available', 'Available', 20),
  ('vendor_availability', 'unavailable', 'Unavailable', 30),

  ('vendor_quotation_status', 'requested', 'Requested', 10),
  ('vendor_quotation_status', 'received', 'Received', 20),
  ('vendor_quotation_status', 'shortlisted', 'Shortlisted', 30),
  ('vendor_quotation_status', 'rejected', 'Rejected', 40),
  ('vendor_quotation_status', 'booked', 'Booked', 50),

  ('invitation_status', 'not_sent', 'Not sent', 10),
  ('invitation_status', 'marked_sent', 'Marked as sent', 20),

  ('rsvp_status', 'pending', 'Pending', 10),
  ('rsvp_status', 'confirmed', 'Confirmed', 20),
  ('rsvp_status', 'declined', 'Declined', 30),
  ('rsvp_status', 'maybe', 'Maybe', 40);
