CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  car text NOT NULL,
  notes text NOT NULL DEFAULT '',
  service text NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status text NOT NULL DEFAULT 'active',
  cancellation_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);

CREATE UNIQUE INDEX bookings_unique_active_slot
  ON public.bookings (booking_date, booking_time)
  WHERE status = 'active';

CREATE INDEX bookings_date_idx ON public.bookings (booking_date);

GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_booked_slots(p_date date)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(to_char(booking_time, 'HH24:MI') ORDER BY booking_time), ARRAY[]::text[])
  FROM public.bookings
  WHERE booking_date = p_date AND status = 'active';
$$;

CREATE OR REPLACE FUNCTION public.create_booking(
  p_name text,
  p_phone text,
  p_car text,
  p_notes text,
  p_service text,
  p_date date,
  p_time text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.bookings;
BEGIN
  IF length(btrim(p_name)) < 2 OR length(btrim(p_phone)) < 8 OR length(btrim(p_car)) < 1 OR length(btrim(p_service)) < 1 THEN
    RAISE EXCEPTION 'Dados do agendamento incompletos.';
  END IF;

  IF (p_date + p_time::time) < (now() AT TIME ZONE 'America/Sao_Paulo') THEN
    RAISE EXCEPTION 'Este horário já passou. Escolha outra data ou horário.';
  END IF;

  BEGIN
    INSERT INTO public.bookings (name, phone, car, notes, service, booking_date, booking_time)
    VALUES (btrim(p_name), btrim(p_phone), btrim(p_car), COALESCE(p_notes, ''), p_service, p_date, p_time::time)
    RETURNING * INTO v_row;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'Este horário acabou de ficar indisponível. Escolha outro horário.';
  END;

  RETURN json_build_object(
    'id', v_row.id,
    'cancellationToken', v_row.cancellation_token,
    'bookingDate', to_char(v_row.booking_date, 'YYYY-MM-DD'),
    'bookingTime', to_char(v_row.booking_time, 'HH24:MI')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_booking(p_token uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.bookings;
BEGIN
  SELECT * INTO v_row FROM public.bookings
  WHERE cancellation_token = p_token AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Agendamento não encontrado ou já cancelado.';
  END IF;

  IF (v_row.booking_date + v_row.booking_time) - interval '1 hour' < (now() AT TIME ZONE 'America/Sao_Paulo') THEN
    RAISE EXCEPTION 'O cancelamento deve ser feito com pelo menos 1 hora de antecedência. Fale conosco pelo WhatsApp.';
  END IF;

  UPDATE public.bookings
  SET status = 'cancelled', cancelled_at = now()
  WHERE id = v_row.id;

  RETURN json_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.get_booked_slots(date) FROM public;
REVOKE ALL ON FUNCTION public.create_booking(text, text, text, text, text, date, text) FROM public;
REVOKE ALL ON FUNCTION public.cancel_booking(uuid) FROM public;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_booking(text, text, text, text, text, date, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO anon, authenticated, service_role;