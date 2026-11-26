import { connection } from "next/server";
import { aiConfigured, supabaseConfigured } from "@/server/guard";

export async function GET() {
  await connection();
  return Response.json(
    {
      ai: aiConfigured(),
      supabase: supabaseConfigured(),
      accessCode: !supabaseConfigured() && !!process.env.VEEV_ACCESS_CODE,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
