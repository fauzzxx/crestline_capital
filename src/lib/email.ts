import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ??
  process.env.EMAIL_FROM ??
  "Crestline Capital <onboarding@resend.dev>";
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? process.env.EMAIL_TO ?? "admin@crestlinecapital.in";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function brandShell(title: string, body: string): string {
  return `
    <div style="background:#0a0a0a;color:#f5e9d4;font-family:Georgia,serif;padding:32px 16px;">
      <div style="max-width:560px;margin:0 auto;background:#121212;border:1px solid #2a2a2a;border-radius:14px;overflow:hidden;">
        <div style="padding:20px 24px;border-bottom:1px solid #2a2a2a;background:linear-gradient(90deg,#1a0a0e,#0a0a0a);">
          <span style="background:linear-gradient(90deg,#a07a2e,#d4af3a,#e8c75a);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:700;letter-spacing:0.05em;">CRESTLINE CAPITAL</span>
        </div>
        <div style="padding:28px 24px;">
          <h1 style="font-size:20px;color:#d4af3a;margin:0 0 14px 0;font-family:Georgia,serif;">${escapeHtml(title)}</h1>
          <div style="color:#d8c8a8;line-height:1.6;font-size:14px;font-family:Arial,sans-serif;">
            ${body}
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid #2a2a2a;color:#8a7a55;font-size:11px;">
          Crestline Capital — Structured Bulk Real Estate Buying Network. Hyderabad, India.
        </div>
      </div>
    </div>
  `;
}

async function send(opts: { to: string | string[]; subject: string; html: string }) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", opts.to);
    return { success: true } as const;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
    });
    if (error) return { success: false, error: error.message } as const;
    return { success: true } as const;
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown email error",
    } as const;
  }
}

export async function sendAdminNewMembershipNotification(data: {
  name: string;
  phone: string;
  email: string;
  budget_range: string | null;
  preferred_locations: string[] | null;
  buying_timeline: string | null;
}) {
  return send({
    to: ADMIN_EMAIL,
    subject: "New Crestline Capital Membership Request",
    html: brandShell(
      "New Membership Request",
      `
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Budget Range:</strong> ${escapeHtml(data.budget_range ?? "—")}</p>
        <p><strong>Preferred Locations:</strong> ${escapeHtml((data.preferred_locations ?? []).join(", ") || "—")}</p>
        <p><strong>Buying Timeline:</strong> ${escapeHtml(data.buying_timeline ?? "—")}</p>
      `,
    ),
  });
}

// Backwards-compatible alias used by existing code paths.
export const sendAdminMembershipNotification = sendAdminNewMembershipNotification;

export async function sendMembershipReceivedEmail(toEmail: string, name: string) {
  return send({
    to: toEmail,
    subject: "We've received your Crestline Capital application",
    html: brandShell(
      "Application received",
      `
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thanks for applying to the Crestline Capital private buyer network. Our team reviews each application personally.</p>
        <p>You'll hear back via email and WhatsApp within 24–48 hours.</p>
      `,
    ),
  });
}

export async function sendMembershipApproved(toEmail: string) {
  return send({
    to: toEmail,
    subject: "Your Crestline Capital Membership Has Been Approved",
    html: brandShell(
      "Membership approved",
      `
        <p>Welcome to the Crestline Capital private buyer network.</p>
        <p>You can now view curated opportunities and join structured Capital Pools.</p>
        <p style="margin-top:18px;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://crestlinecapital.in"}/login"
             style="background:linear-gradient(90deg,#a07a2e,#d4af3a);color:#0a0a0a;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">
            Log in to your dashboard
          </a>
        </p>
      `,
    ),
  });
}

export const sendMembershipApprovedEmail = sendMembershipApproved;

export async function sendPoolJoinedEmail(toEmail: string, projectName: string) {
  return send({
    to: toEmail,
    subject: `You've joined the ${projectName} Capital Pool`,
    html: brandShell(
      `You're in the ${escapeHtml(projectName)} Capital Pool`,
      `
        <p>Your participation has been recorded. You'll be notified when the pool unlocks the next discount tier or as the deal progresses.</p>
      `,
    ),
  });
}

export async function sendPaymentMilestoneStatusEmail(
  toEmail: string,
  data: { milestone_label: string; status: string; amount: number; project_name?: string | null },
) {
  return send({
    to: toEmail,
    subject: `Payment milestone update: ${data.milestone_label}`,
    html: brandShell(
      "Milestone update",
      `
        <p><strong>Milestone:</strong> ${escapeHtml(data.milestone_label)}</p>
        ${data.project_name ? `<p><strong>Project:</strong> ${escapeHtml(data.project_name)}</p>` : ""}
        <p><strong>Amount:</strong> ₹${Number(data.amount).toLocaleString()}</p>
        <p><strong>Status:</strong> <span style="text-transform:capitalize;color:#d4af3a;">${escapeHtml(data.status)}</span></p>
      `,
    ),
  });
}
