import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.EMAIL_FROM ?? "Crestline Capital <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.EMAIL_TO ?? "admin@crestlinecapital.in";

export async function sendAdminMembershipNotification(data: {
  name: string;
  phone: string;
  email: string;
  budget_range: string | null;
  preferred_locations: string[] | null;
  buying_timeline: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: true };
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: "New Crestline Capital Membership Request",
      html: `
        <h2>New Membership Request</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        <p><strong>Budget Range:</strong> ${escapeHtml(data.budget_range ?? "—")}</p>
        <p><strong>Preferred Locations:</strong> ${escapeHtml((data.preferred_locations ?? []).join(", ") || "—")}</p>
        <p><strong>Buying Timeline:</strong> ${escapeHtml(data.buying_timeline ?? "—")}</p>
      `,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function sendMembershipApproved(toEmail: string): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: true };
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: "Your Crestline Capital Membership Has Been Approved",
      html: `
        <h2>Membership Approved</h2>
        <p>Your membership request has been approved.</p>
        <p>You can now access curated opportunities and participate in capital pools.</p>
        <p>Log in at your platform URL to get started.</p>
      `,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
