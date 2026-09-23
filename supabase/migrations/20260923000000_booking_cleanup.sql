-- Titanium booking schema cleanup
-- Reconciles databases that may have received the earlier duplicate migration.

create extension if not exists pgcrypto;

-- Normalize rows created by the superseded schema.
update public.bookings
set status = 'confirmed'
where status = 'active';

-- Remove the superseded active-slot index if it exists.
drop index if exists public.bookings_unique_active_slot;

-- Remove the superseded overloaded RPC signature so PostgREST cannot select
-- between text/time variants for the same logical operation.
drop function if exists public.create_booking(text, text, text, text, text, date, text);

-- Keep direct table access closed; booking operations go through RPC.
revoke all on public.bookings from public, anon, authenticated;

-- Ensure the canonical status model is enforced.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.bookings'::regclass
      and conname = 'bookings_status_check'
  ) then
    alter table public.bookings
      add constraint bookings_status_check
      check (status in ('confirmed', 'cancelled'));
  end if;
end
$$;

-- Recreate the canonical unique rule defensively.
create unique index if not exists bookings_one_active_slot
on public.bookings (booking_date, booking_time)
where status = 'confirmed';
