-- mahamud.xyz contact storage
-- Run this file once in the Supabase SQL editor.
-- This minimal schema intentionally contains no admin/CMS tables or media bucket.

create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  sender_email text not null,
  phone text not null default '',
  subject text not null default 'Portfolio enquiry',
  message text not null,
  is_read boolean not null default false,
  is_replied boolean not null default false,
  is_archived boolean not null default false,
  ip_hash text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_messages_inbox_index
  on public.contact_messages (is_archived, is_read, created_at desc);

create table if not exists public.rate_limits (
  bucket_key text primary key,
  attempts integer not null default 0,
  window_started_at timestamptz not null default now()
);

create or replace function public.check_rate_limit(
  p_bucket_key text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.rate_limits%rowtype;
begin
  if p_bucket_key is null or length(p_bucket_key) > 160
    or p_limit < 1 or p_limit > 1000
    or p_window_seconds < 1 or p_window_seconds > 604800 then
    return false;
  end if;

  insert into public.rate_limits (bucket_key, attempts, window_started_at)
  values (p_bucket_key, 1, now())
  on conflict (bucket_key) do update
    set attempts = case
      when public.rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then 1
      else public.rate_limits.attempts + 1
    end,
    window_started_at = case
      when public.rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then now()
      else public.rate_limits.window_started_at
    end
  returning * into current_row;

  return current_row.attempts <= p_limit;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contact_messages_updated_at on public.contact_messages;
create trigger contact_messages_updated_at before update on public.contact_messages
for each row execute function public.set_updated_at();

alter table public.contact_messages enable row level security;
alter table public.rate_limits enable row level security;

-- No public RLS policies are intentional. Only the server-side service-role key may access these tables.
revoke all on table public.contact_messages from public, anon, authenticated;
revoke all on table public.rate_limits from public, anon, authenticated;
revoke execute on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
