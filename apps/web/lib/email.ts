/**
 * Email sending via Resend (https://resend.com). No SDK — just the REST API.
 * Everything degrades gracefully: when EMAIL_PROVIDER_API_KEY isn't a real key
 * (e.g. local dev), isEmailConfigured() is false and callers skip email +
 * verification gating, so the app works without Resend provisioned.
 */

export function isEmailConfigured(): boolean {
  const k = process.env.EMAIL_PROVIDER_API_KEY;
  return !!k && k.length > 20 && !k.toLowerCase().includes("replace");
}

/**
 * The public base URL for building links, derived from the ACTUAL request host
 * (Render forwards the real host via x-forwarded-*). This avoids env-misconfig
 * bugs where links pointed at the internal port (localhost:10000).
 */
export function requestBaseUrl(req: Request): string {
  const h = req.headers;
  const host = (h.get("x-forwarded-host") || h.get("host") || "").split(",")[0].trim();
  if (host) {
    const proto =
      h.get("x-forwarded-proto")?.split(",")[0].trim() ||
      (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  const from = process.env.EMAIL_FROM || "PrintArtZ <no-reply@printartz.co.in>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EMAIL_PROVIDER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendVerificationEmail(to: string, token: string, baseUrl: string): Promise<boolean> {
  const link = `${baseUrl.replace(/\/$/, "")}/verify?token=${encodeURIComponent(token)}`;
  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;margin:0 0 8px">Verify your email</h1>
      <p style="color:#444;font-size:15px;line-height:1.5">
        Welcome to PrintArtZ! Please confirm your email address to start creating.
      </p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#7c3aed;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block">
          Verify my email
        </a>
      </p>
      <p style="color:#888;font-size:13px">Or paste this link into your browser:<br>${link}</p>
      <p style="color:#aaa;font-size:12px;margin-top:24px">This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
    </div>`;
  return sendEmail(to, "Verify your PrintArtZ email", html);
}
