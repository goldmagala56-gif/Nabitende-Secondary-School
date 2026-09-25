// supabase/functions/dispatch-notification/index.ts
//
// Triggered by a Database Webhook on public.notifications (INSERT).
// Fans a notification out to whichever channels it lists:
//   - in_app  -> nothing to do here, the client subscribes via Realtime
//   - push    -> Firebase Cloud Messaging (FCM), using push_tokens table
//   - sms     -> Africa's Talking SMS API, using guardian_phone / phone_number
//   - email   -> stubbed, wire up Resend/Postmark if/when needed
//
// Env vars required (set via `supabase secrets set`):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (auto-provided in Edge Functions)
//   FCM_SERVER_KEY        -> Firebase Cloud Messaging legacy server key
//   AT_API_KEY             -> Africa's Talking API key
//   AT_USERNAME             -> Africa's Talking username
//   AT_SENDER_ID (optional) -> registered SMS sender ID

import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ---------------------------------------------------------------------
// FCM v1 auth — uses the Firebase service account JSON (modern method,
// replaces the old single "server key" string which is being retired).
// Set the whole JSON file's contents as one secret:
//   supabase secrets set FCM_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
// ---------------------------------------------------------------------
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getFcmAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const raw = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON")!;
  const sa = JSON.parse(raw);

  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const unsigned = `${encode(header)}.${encode(claims)}`;

  // Import the PEM private key for signing
  const pem = sa.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsigned)
  );

  const encodedSig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsigned}.${encodedSig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`FCM token exchange failed: ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

type NotificationRow = {
  id: string;
  recipient_id: string | null;
  student_id: string | null;
  title: string;
  body: string;
  category: string;
  channels: string[];
  data: Record<string, unknown> | null;
};

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    // Database Webhooks send { type, table, record, old_record }
    const record: NotificationRow = payload.record;

    if (!record) {
      return new Response("No record in payload", { status: 400 });
    }

    const results: { channel: string; status: string; error?: string }[] = [];

    for (const channel of record.channels) {
      try {
        if (channel === "in_app") {
          // Nothing to send — client reads it via Realtime Postgres Changes
          // subscribed to notifications where recipient_id = auth.uid()
          results.push({ channel, status: "delivered" });
          continue;
        }

        if (channel === "push") {
          const sent = await sendPush(record);
          results.push({ channel, status: sent ? "sent" : "failed" });
          continue;
        }

        if (channel === "sms") {
          const sent = await sendSms(record);
          results.push({ channel, status: sent ? "sent" : "failed" });
          continue;
        }

        if (channel === "email") {
          results.push({ channel, status: "failed", error: "email not implemented yet" });
          continue;
        }

        results.push({ channel, status: "failed", error: "unknown channel" });
      } catch (err) {
        results.push({ channel, status: "failed", error: String(err) });
      }
    }

    // Log every attempt
    await supabase.from("notification_delivery_log").insert(
      results.map((r) => ({
        notification_id: record.id,
        channel: r.channel,
        status: r.status,
        error_message: r.error ?? null,
      }))
    );

    // Update overall notification status
    const overallStatus = results.some((r) => r.status === "sent" || r.status === "delivered")
      ? "sent"
      : "failed";

    await supabase
      .from("notifications")
      .update({ status: overallStatus, sent_at: new Date().toISOString() })
      .eq("id", record.id);

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("dispatch-notification error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// ---------------------------------------------------------------------
// PUSH via Firebase Cloud Messaging
// ---------------------------------------------------------------------
async function sendPush(record: NotificationRow): Promise<boolean> {
  if (!record.recipient_id) return false;

  const { data: tokens, error } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("profile_id", record.recipient_id);

  if (error || !tokens || tokens.length === 0) return false;

  const accessToken = await getFcmAccessToken();
  const raw = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON")!;
  const projectId = JSON.parse(raw).project_id;

  let anySuccess = false;

  for (const { token } of tokens) {
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title: record.title,
              body: record.body,
            },
            data: Object.fromEntries(
              Object.entries(record.data ?? {}).map(([k, v]) => [k, String(v)])
            ),
          },
        }),
      }
    );
    if (res.ok) anySuccess = true;
  }

  return anySuccess;
}

// ---------------------------------------------------------------------
// SMS via Africa's Talking
// ---------------------------------------------------------------------
async function sendSms(record: NotificationRow): Promise<boolean> {
  // Resolve a phone number: prefer the recipient's own profile phone,
  // fall back to the linked student's guardian_phone (for guardians
  // without an app account at all).
  let phone: string | null = null;

  if (record.recipient_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", record.recipient_id)
      .single();
    phone = profile?.phone ?? null;
  }

  if (!phone && record.student_id) {
    const { data: student } = await supabase
      .from("students")
      .select("guardian_phone")
      .eq("id", record.student_id)
      .single();
    phone = student?.guardian_phone ?? null;
  }

  if (!phone) return false;

  const apiKey = Deno.env.get("AT_API_KEY")!;
  const username = Deno.env.get("AT_USERNAME")!;
  const senderId = Deno.env.get("AT_SENDER_ID"); // optional

  const form = new URLSearchParams({
    username,
    to: phone,
    message: `${record.title}: ${record.body}`,
  });
  if (senderId) form.set("from", senderId);

  const res = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: {
      apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: form.toString(),
  });

  return res.ok;
}