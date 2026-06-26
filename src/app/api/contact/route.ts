import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseWriteClient } from "@/lib/supabase/admin";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(60).optional().or(z.literal("")),
  childAge: z.string().max(40).optional().or(z.literal("")),
  message: z.string().min(12).max(2000),
  company: z.string().max(80).optional().or(z.literal(""))
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Revisa los campos del formulario e inténtalo de nuevo." },
      { status: 400 }
    );
  }

  if (parsed.data.company) {
    return NextResponse.json({ message: "Mensaje recibido. Te contactaremos pronto." });
  }

  const supabase = createSupabaseWriteClient();

  if (!supabase) {
    return NextResponse.json({
      message:
        "Mensaje recibido en modo local. Configura Supabase para guardarlo en la bandeja administrativa.",
      stored: false
    });
  }

  const { error } = await supabase.from("contact_requests").insert({
    full_name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    child_age_range: parsed.data.childAge || null,
    message: parsed.data.message,
    source: "web"
  });

  if (error) {
    return NextResponse.json(
      { message: "No pudimos guardar tu mensaje. Inténtalo más tarde." },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Mensaje recibido. Te contactaremos pronto.", stored: true });
}
