-- Server-side AI quota check.
-- Callable by an authenticated user, but always attributes usage to auth.uid().
-- The table itself has RLS with no policies, so direct access is impossible.

create or replace function public.consume_ai_quota(
  max_requests integer default 10,
  window_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  bucket_start timestamptz;
  used integer;
begin
  if current_user_id is null then
    return false;
  end if;

  if max_requests < 1 or window_seconds < 1 then
    raise exception 'invalid quota parameters';
  end if;

  bucket_start := to_timestamp(
    floor(extract(epoch from now()) / window_seconds) * window_seconds
  );

  insert into public.ai_rate_limits (user_id, window_start, request_count)
  values (current_user_id, bucket_start, 1)
  on conflict (user_id, window_start) do update
    set request_count = public.ai_rate_limits.request_count + 1
  returning request_count into used;

  return used <= max_requests;
end;
$$;

revoke all on function public.consume_ai_quota(integer, integer) from public;
grant execute on function public.consume_ai_quota(integer, integer) to authenticated;
