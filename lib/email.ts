// Email via Resend. Until the church connects Resend (API key + verified
// sender as server secrets), delivery is PREVIEW-ONLY: the email is composed
// and logged, marked Preview, and nothing is sent. The caller always gets a
// preview text back so the flow can be tested honestly.
export type EmailResult = { ok: boolean; preview: boolean; previewText: string };

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL;
}

export async function sendEmail(to: string, subject: string, text: string, html?: string): Promise<EmailResult> {
  const previewText = `To: ${to}\nSubject: ${subject}\n\n${text}`;
  if (!emailConfigured()) {
    return { ok: true, preview: true, previewText };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [to],
        subject,
        text,
        html: html ?? `<p>${text.replace(/\n/g, "<br>")}</p>`,
      }),
    });
    if (!res.ok) return { ok: false, preview: false, previewText };
    return { ok: true, preview: false, previewText };
  } catch {
    return { ok: false, preview: false, previewText };
  }
}

export function reminderEmailBody(kind: string, title: string, when: string, zoomUrl: string, manageUrl: string): string {
  return [
    `Reminder: ${title}`,
    ``,
    `${kind} — ${when}.`,
    zoomUrl.startsWith("[") ? "Zoom link: [Zoom link — the church has not supplied it yet]" : `Join on Zoom: ${zoomUrl}`,
    ``,
    `Manage or stop these reminders: ${manageUrl}`,
    `You are receiving this because you asked for a reminder. Unsubscribe any time from the link above.`,
  ].join("\n");
}
