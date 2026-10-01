import { supabase } from "@/integrations/supabase/client";

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

function parseBooking(value: unknown): Booking {
  if (!value || typeof value !== "object") {
    throw new Error("Resposta inválida do sistema de agendamento.");
  }

  const data = value as Record<string, unknown>;
  const id = typeof data["id"] === "string" ? data["id"] : "";
  const cancellationToken =
    typeof data["cancellationToken"] === "string"
      ? data["cancellationToken"]
      : typeof data["cancellation_token"] === "string"
        ? data["cancellation_token"]
        : "";

  if (!id || !cancellationToken) {
    throw new Error("O Supabase não retornou os dados completos do agendamento.");
  }

  return {
    name: String(data["name"] ?? ""),
    phone: String(data["phone"] ?? ""),
    car: String(data["car"] ?? ""),
    notes: String(data["notes"] ?? ""),
    service: String(data["service"] ?? ""),
    bookingDate: String(data["bookingDate"] ?? data["booking_date"] ?? ""),
    bookingTime: String(data["bookingTime"] ?? data["booking_time"] ?? ""),
    id,
    cancellationToken,
  };
}

export async function getBookedSlots(date: string): Promise<string[]> {
  const { data, error } = await supabase.rpc("get_booked_slots", {
    p_date: date,
  });

  if (error) throw new Error(error.message);
  return Array.isArray(data) ? data.map(String) : [];
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  const { data, error } = await supabase.rpc("create_booking", {
    p_name: input.name,
    p_phone: input.phone,
    p_car: input.car,
    p_notes: input.notes ?? "",
    p_service: input.service,
    p_date: input.bookingDate,
    p_time: input.bookingTime,
  });

  if (error) throw new Error(error.message);
  return parseBooking(data);
}

export async function cancelBooking(token: string): Promise<void> {
  const { error } = await supabase.rpc("cancel_booking", {
    p_token: token,
  });

  if (error) throw new Error(error.message);
}
