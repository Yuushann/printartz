// Lightweight liveness endpoint used to keep the Render free-tier service warm.
// An external scheduler (e.g. UptimeRobot every 5 min) pings this to beat
// Render's 15-min idle spin-down. Deliberately does NO database or AI work so
// pings cost nothing (no Supabase/OpenAI usage).
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // never cache — each hit must reach the server

export function GET() {
  return Response.json({ ok: true, ts: new Date().toISOString() });
}
