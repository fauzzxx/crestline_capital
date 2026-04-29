"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function submitContactMessage(formData: {
  name: string;
  email: string;
  message: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const ip = await getClientIp();
  const rl = checkRateLimit(`contact:${ip}`, { maxAttempts: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return {
      success: false,
      error: `Too many messages. Try again in ${Math.ceil(rl.retryAfterSec / 60)} min.`,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("contact_messages").insert({
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
    message: formData.message.trim(),
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
