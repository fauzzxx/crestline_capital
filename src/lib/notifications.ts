/**
 * WhatsApp notifications via Twilio.
 *
 * If TWILIO_* env vars are missing, helpers no-op (with a single console.warn) so the
 * rest of the system keeps working in dev / preview environments.
 */
import twilio from "twilio";

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM;

const client = sid && token ? twilio(sid, token) : null;

function toWhatsApp(num: string): string {
  const trimmed = num.trim();
  if (trimmed.startsWith("whatsapp:")) return trimmed;
  if (trimmed.startsWith("+")) return `whatsapp:${trimmed}`;
  return `whatsapp:+${trimmed.replace(/\D/g, "")}`;
}

async function sendWhatsApp(to: string, body: string): Promise<{ success: boolean; error?: string }> {
  if (!client || !from) {
    console.warn("[whatsapp] TWILIO_* env vars not set — skipping send to", to);
    return { success: true };
  }
  try {
    await client.messages.create({
      from: toWhatsApp(from),
      to: toWhatsApp(to),
      body,
    });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "WhatsApp send failed",
    };
  }
}

export async function sendWhatsAppMembershipReceived(data: {
  name: string;
  phone: string;
}) {
  return sendWhatsApp(
    data.phone,
    `Hi ${data.name}, we've received your Crestline Capital membership application. Our team will review and get back to you within 24–48 hours.`,
  );
}

export async function sendWhatsAppMembershipApproved(phone: string) {
  return sendWhatsApp(
    phone,
    `Welcome to Crestline Capital. Your membership has been approved — you can now view curated opportunities and join structured Capital Pools. Log in: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://crestlinecapital.in"}/login`,
  );
}

export async function sendWhatsAppPoolJoined(phone: string, projectName: string) {
  return sendWhatsApp(
    phone,
    `You're in the ${projectName} Capital Pool. You'll be notified as the pool progresses and tier discounts unlock.`,
  );
}

export async function sendWhatsAppPaymentMilestoneUpdate(
  phone: string,
  data: { milestone_label: string; status: string; amount: number },
) {
  return sendWhatsApp(
    phone,
    `Crestline Capital — Milestone update: ${data.milestone_label} (${data.status}) ₹${Number(data.amount).toLocaleString()}.`,
  );
}
