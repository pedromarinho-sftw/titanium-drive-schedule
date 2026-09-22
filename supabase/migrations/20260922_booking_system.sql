-- Titanium: agendamento multiusuário, cancelamento e disponibilidade
-- Execute este SQL no Supabase SQL Editor conectado ao projeto do site.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  car text not null,
  notes text default '',
  service text not null,
  booking_date date not null,
  booking_time time not null,
  cancellation_token uuid not null unique default gen_random_uuid(),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create unique index if not exists bookings_one_active_slot
on public.bookings (booking_date, booking_time)
where status = 'confirmed';

alter table public.bookings enable row level security;

revoke all on public.bookings from anon, authenticated;

create or replace function public.get_booked_slots(p_date date)
returns table(booking_time text)
language sql
security definer
set search_path = public
as $$
  select to_char(b.booking_time, 'HH24:MI')
  from public.bookings b
  where b.booking_date = p_date
    and b.status = 'confirmed'
  order by b.booking_time;
$$;

create or replace function public.create_booking(
  p_name text,
  p_phone text,
  p_car text,
  p_notes text,
  p_service text,
  p_date date,
  p_time time
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  new_booking public.bookings;
begin
  if p_date < current_date then
    raise exception 'Não é possível agendar para uma data passada.';
  end if;

  if extract(isodow from p_date) = 7 then
    raise exception 'A Titanium não atende aos domingos.';
  end if;

  if p_time < time '08:00' or p_time > time '18:00' then
    raise exception 'Horário fora do período de atendimento.';
  end if;

  insert into public.bookings (name, phone, car, notes, service, booking_date, booking_time)
  values (trim(p_name), trim(p_phone), trim(p_car), coalesce(trim(p_notes), ''), trim(p_service), p_date, p_time)
  returning * into new_booking;

  return json_build_object(
    'id', new_booking.id,
    'name', new_booking.name,
    'phone', new_booking.phone,
    'car', new_booking.car,
    'notes', new_booking.notes,
    'service', new_booking.service,
    'bookingDate', new_booking.booking_date,
    'bookingTime', to_char(new_booking.booking_time, 'HH24:MI'),
    'cancellationToken', new_booking.cancellation_token
  );
exception
  when unique_violation then
    raise exception 'Este horário acabou de ser reservado por outra pessoa. Escolha outro horário.';
end;
$$;

create or replace function public.cancel_booking(p_token uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  current_booking public.bookings;
  appointment_at timestamp;
begin
  select * into current_booking
  from public.bookings
  where cancellation_token = p_token
    and status = 'confirmed'
  for update;

  if not found then
    raise exception 'Agendamento não encontrado ou já cancelado.';
  end if;

  appointment_at := current_booking.booking_date + current_booking.booking_time;

  if appointment_at - now() < interval '1 hour' then
    raise exception 'O cancelamento só pode ser feito com pelo menos 1 hora de antecedência.';
  end if;

  update public.bookings
  set status = 'cancelled', cancelled_at = now()
  where id = current_booking.id;

  return json_build_object('success', true);
end;
$$;

grant execute on function public.get_booked_slots(date) to anon, authenticated;
grant execute on function public.create_booking(text,text,text,text,text,date,time) to anon, authenticated;
grant execute on function public.cancel_booking(uuid) to anon, authenticated;
