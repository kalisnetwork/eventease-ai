-- EventEase AI — initial schema
-- Ownership root: public.events.user_id -> auth.users.id
-- Children are authorised through their parent event via public.owns_event().
-- No seed/fake business data is created here.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth user)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (full_name is null or char_length(full_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile automatically on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  event_type text not null default 'other' check (char_length(btrim(event_type)) between 1 and 60),
  description text check (description is null or char_length(description) <= 4000),
  location text check (location is null or char_length(location) <= 200),
  start_at timestamptz,
  end_at timestamptz,
  attendees integer not null default 1 check (attendees > 0 and attendees <= 100000),
  total_budget numeric(12, 2) not null default 0 check (total_budget >= 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'draft'
    check (status in ('draft', 'planning', 'confirmed', 'completed', 'archived')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_date_order check (end_at is null or start_at is null or end_at >= start_at),
  constraint events_archived_consistency check (
    (status = 'archived' and archived_at is not null)
    or (status <> 'archived')
  )
);

create index events_user_status_idx on public.events (user_id, status);
create index events_user_start_idx on public.events (user_id, start_at);

alter table public.events enable row level security;

create policy events_select_own on public.events
  for select using (user_id = auth.uid());
create policy events_insert_own on public.events
  for insert with check (user_id = auth.uid());
create policy events_update_own on public.events
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy events_delete_own on public.events
  for delete using (user_id = auth.uid());

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- Returns true only when the current authenticated user owns the event.
-- SECURITY DEFINER avoids recursive RLS lookups on public.events.
create or replace function public.owns_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.events e
    where e.id = target_event_id
      and e.user_id = auth.uid()
  );
$$;

revoke all on function public.owns_event(uuid) from public;
grant execute on function public.owns_event(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text check (description is null or char_length(description) <= 2000),
  due_at timestamptz,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done', 'cancelled')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  category text check (category is null or char_length(category) <= 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_event_status_idx on public.tasks (event_id, status);
create index tasks_event_due_idx on public.tasks (event_id, due_at);

alter table public.tasks enable row level security;

create policy tasks_select_own on public.tasks
  for select using (public.owns_event(event_id));
create policy tasks_insert_own on public.tasks
  for insert with check (public.owns_event(event_id));
create policy tasks_update_own on public.tasks
  for update using (public.owns_event(event_id)) with check (public.owns_event(event_id));
create policy tasks_delete_own on public.tasks
  for delete using (public.owns_event(event_id));

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Expenses (planned and actual are separate amounts)
-- ---------------------------------------------------------------------------

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  category text not null
    check (category in ('venue', 'catering', 'decoration', 'photography', 'entertainment', 'transportation', 'other')),
  label text not null check (char_length(btrim(label)) between 1 and 160),
  planned_amount numeric(12, 2) not null default 0 check (planned_amount >= 0),
  actual_amount numeric(12, 2) not null default 0 check (actual_amount >= 0),
  incurred_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_event_idx on public.expenses (event_id);
create index expenses_event_category_idx on public.expenses (event_id, category);

alter table public.expenses enable row level security;

create policy expenses_select_own on public.expenses
  for select using (public.owns_event(event_id));
create policy expenses_insert_own on public.expenses
  for insert with check (public.owns_event(event_id));
create policy expenses_update_own on public.expenses
  for update using (public.owns_event(event_id)) with check (public.owns_event(event_id));
create policy expenses_delete_own on public.expenses
  for delete using (public.owns_event(event_id));

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Vendors (user-managed directory, not a marketplace)
-- ---------------------------------------------------------------------------

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  category text not null
    check (category in ('venue', 'catering', 'decoration', 'photography', 'entertainment', 'transportation', 'other')),
  location text check (location is null or char_length(location) <= 200),
  quoted_price numeric(12, 2) check (quoted_price is null or quoted_price >= 0),
  availability text not null default 'unknown'
    check (availability in ('unknown', 'available', 'unavailable')),
  contact text check (contact is null or char_length(contact) <= 300),
  notes text check (notes is null or char_length(notes) <= 2000),
  quotation_status text not null default 'requested'
    check (quotation_status in ('requested', 'received', 'shortlisted', 'rejected', 'booked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vendors_event_idx on public.vendors (event_id);
create index vendors_event_category_idx on public.vendors (event_id, category);

alter table public.vendors enable row level security;

create policy vendors_select_own on public.vendors
  for select using (public.owns_event(event_id));
create policy vendors_insert_own on public.vendors
  for insert with check (public.owns_event(event_id));
create policy vendors_update_own on public.vendors
  for update using (public.owns_event(event_id)) with check (public.owns_event(event_id));
create policy vendors_delete_own on public.vendors
  for delete using (public.owns_event(event_id));

create trigger vendors_set_updated_at
  before update on public.vendors
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Guests
-- ---------------------------------------------------------------------------

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 160),
  email text check (email is null or (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  phone text check (phone is null or char_length(phone) <= 40),
  guest_group text check (guest_group is null or char_length(guest_group) <= 60),
  -- "marked_sent" is deliberate: no email/SMS is actually delivered.
  invitation_status text not null default 'not_sent'
    check (invitation_status in ('not_sent', 'marked_sent')),
  rsvp_status text not null default 'pending'
    check (rsvp_status in ('pending', 'confirmed', 'declined', 'maybe')),
  plus_ones integer not null default 0 check (plus_ones between 0 and 20),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guests_event_idx on public.guests (event_id);
create index guests_event_rsvp_idx on public.guests (event_id, rsvp_status);

alter table public.guests enable row level security;

create policy guests_select_own on public.guests
  for select using (public.owns_event(event_id));
create policy guests_insert_own on public.guests
  for insert with check (public.owns_event(event_id));
create policy guests_update_own on public.guests
  for update using (public.owns_event(event_id)) with check (public.owns_event(event_id));
create policy guests_delete_own on public.guests
  for delete using (public.owns_event(event_id));

create trigger guests_set_updated_at
  before update on public.guests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Notifications (computed from real data, stored for read state)
-- ---------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event_id uuid references public.events (id) on delete cascade,
  type text not null
    check (type in ('task_due', 'task_overdue', 'budget_overrun', 'event_updated', 'rsvp_pending')),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  body text check (body is null or char_length(body) <= 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_read_idx on public.notifications (user_id, read_at);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy notifications_select_own on public.notifications
  for select using (user_id = auth.uid());
create policy notifications_insert_own on public.notifications
  for insert with check (user_id = auth.uid());
create policy notifications_update_own on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_delete_own on public.notifications
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- AI conversation history (optional feature; bounded retention in app)
-- ---------------------------------------------------------------------------

create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 8000),
  created_at timestamptz not null default now()
);

create index ai_messages_event_created_idx on public.ai_messages (event_id, created_at);

alter table public.ai_messages enable row level security;

create policy ai_messages_select_own on public.ai_messages
  for select using (user_id = auth.uid() and public.owns_event(event_id));
create policy ai_messages_insert_own on public.ai_messages
  for insert with check (user_id = auth.uid() and public.owns_event(event_id));
create policy ai_messages_delete_own on public.ai_messages
  for delete using (user_id = auth.uid() and public.owns_event(event_id));

-- ---------------------------------------------------------------------------
-- AI rate limits — server (service role) only, intentionally no policies.
-- ---------------------------------------------------------------------------

create table public.ai_rate_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (user_id, window_start)
);

alter table public.ai_rate_limits enable row level security;

revoke all on public.ai_rate_limits from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.events, public.tasks,
  public.expenses, public.vendors, public.guests, public.notifications, public.ai_messages
  to authenticated;

revoke all on public.profiles, public.events, public.tasks, public.expenses,
  public.vendors, public.guests, public.notifications, public.ai_messages
  from anon;
