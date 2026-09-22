const SUPABASE_URL = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined;

export type BookingInput = {
  name: string;
  phone: string;
  car: string;
  notes?: string;
  service: string;
  bookingDate: string;
  bookingTime: string;
};

export type Booking = BookingInput & {
  id: string;
  cancellationToken: string;
};

function assertConfig() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Sistema de agendamento ainda não configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
}

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  assertConfig();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw) as { message?: string; hint?: string; details?: string };
      message = parsed.message || parsed.details || parsed.hint || raw;
    } catch {
      /* resposta não-JSON */
    }
    throw new Error(message || "Não foi possível concluir a operação.");
  }

  return response.json() as Promise<T>;
}

export async function getBookedSlots(date: string): Promise<string[]> {
  return rpc<string[]>("get_booked_slots", { p_date: date });
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  return rpc<Booking>("create_booking", {
    p_name: input.name,
    p_phone: input.phone,
    p_car: input.car,
    p_notes: input.notes ?? "",
    p_service: input.service,
    p_date: input.bookingDate,
    p_time: input.bookingTime,
  });
}

export async function cancelBooking(token: string): Promise<void> {
  await rpc("cancel_booking", { p_token: token });
}
