"use server";

export type WaitlistState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Stores a waitlist signup in Supabase via the PostgREST endpoint (no SDK).
 * Requires env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Approval is manual — flip `status` to 'approved' in the Supabase table editor.
 */
export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { ok: false, message: "The waitlist isn't configured yet — check back soon." };
  }

  try {
    const res = await fetch(`${url}/rest/v1/waitlist`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    if (res.status === 409) {
      return { ok: true, message: "You're already on the list — sit tight." };
    }
    if (!res.ok) {
      return { ok: false, message: "Something went wrong. Please try again." };
    }
    return { ok: true, message: "You're on the list. We'll email you when you're approved." };
  } catch {
    return { ok: false, message: "Network error. Please try again." };
  }
}
