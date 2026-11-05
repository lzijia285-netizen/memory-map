import { createClient } from "https://esm.sh/@supabase/supabase-js@2.117.2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const publishableKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
    if (!Object.values(publishableKeys).includes(request.headers.get("apikey"))) return reply({ error: "Unauthorized" }, 401);
    const { email, password, inviteCode, displayName } = await request.json();
    if (!email || !password || !inviteCode || !displayName || password.length < 8) return reply({ error: "Invalid registration details" }, 400);
    const bytes = new TextEncoder().encode(String(inviteCode).trim().toUpperCase());
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map((byte) => byte.toString(16).padStart(2, "0")).join("");
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, secretKeys.default, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: created, error: createError } = await admin.auth.admin.createUser({ email: String(email).toLowerCase(), password, email_confirm: true, user_metadata: { display_name: String(displayName).trim() } });
    if (createError || !created.user) return reply({ error: "Unable to create this account" }, 400);
    const { data: consumed, error: consumeError } = await admin.rpc("consume_invite", { p_code_hash: hash, p_user_id: created.user.id, p_email: email, p_display_name: displayName });
    if (consumeError || !consumed) {
      await admin.auth.admin.deleteUser(created.user.id);
      return reply({ error: "Invitation code is invalid, expired or already used" }, 403);
    }
    return reply({ ok: true });
  } catch {
    return reply({ error: "Unable to complete registration" }, 400);
  }
});
