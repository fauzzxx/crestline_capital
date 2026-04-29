"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  sendAdminMembershipNotification,
  sendMembershipReceivedEmail,
} from '@/lib/email';
import { sendWhatsAppMembershipReceived } from '@/lib/notifications';
import { trackEvent } from '@/lib/analytics';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function submitMembershipRequest(formData: {
  full_name: string;
  phone: string;
  email: string;
  budget_range: string;
  buying_purpose: string;
  preferred_locations: string[];
  buying_timeline: string;
  agreement_accepted: boolean;
}) {
  const ip = await getClientIp();
  const rl = checkRateLimit(`membership:${ip}`, { maxAttempts: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return {
      success: false,
      error: `Too many submissions. Try again in ${Math.ceil(rl.retryAfterSec / 60)} min.`,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from('membership_requests').insert({
    full_name: formData.full_name.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim().toLowerCase(),
    budget_range: formData.budget_range || null,
    buying_purpose: formData.buying_purpose || null,
    preferred_locations: formData.preferred_locations?.length ? formData.preferred_locations : null,
    buying_timeline: formData.buying_timeline || null,
    agreement_accepted: !!formData.agreement_accepted,
    status: 'pending',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  await trackEvent(null, 'membership_request_submitted', { source: 'form' });

  await sendAdminMembershipNotification({
    name: formData.full_name.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim().toLowerCase(),
    budget_range: formData.budget_range || null,
    preferred_locations: formData.preferred_locations?.length ? formData.preferred_locations : null,
    buying_timeline: formData.buying_timeline || null,
  });

  sendMembershipReceivedEmail(
    formData.email.trim().toLowerCase(),
    formData.full_name.trim(),
  ).catch(() => {});

  sendWhatsAppMembershipReceived({
    name: formData.full_name.trim(),
    phone: formData.phone.trim(),
  }).catch(() => {});

  revalidatePath('/membership');
  return { success: true };
}
