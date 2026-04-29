"use server";

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { trackEvent } from '@/lib/analytics';
import { sendPoolJoinedEmail } from '@/lib/email';
import { sendWhatsAppPoolJoined } from '@/lib/notifications';

async function getRequestIp(): Promise<string> {
  try {
    const h = await headers();
    return (
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      h.get('x-real-ip')?.trim() ||
      'unknown'
    );
  } catch {
    return 'unknown';
  }
}

export async function joinPool(
  projectId: string,
  options?: { agreementAccepted?: boolean }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  if (!options?.agreementAccepted) {
    return {
      success: false,
      error: 'You must accept the Terms & Confidentiality Agreement to join.',
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_status')
    .eq('id', user.id)
    .single();

  if (profile?.membership_status !== 'approved') {
    return { success: false, error: 'Only approved members can join pools' };
  }

  const ip = await getRequestIp();
  const { error } = await supabase.from('pool_members').insert({
    user_id: user.id,
    project_id: projectId,
    commitment_status: 'interested',
    agreement_accepted: true,
    agreement_accepted_at: new Date().toISOString(),
    agreement_ip: ip,
  });

  if (error) {
    if (error.code === '23505') return { success: false, error: 'Already in this pool' };
    return { success: false, error: error.message };
  }

  trackEvent(user.id, 'pool_joined', { project_id: projectId }).catch(() => {});

  // Best-effort notifications — never block pool join on these.
  try {
    const [{ data: project }, { data: profile }] = await Promise.all([
      supabase.from('projects').select('project_name').eq('id', projectId).single(),
      supabase.from('profiles').select('phone').eq('id', user.id).single(),
    ]);
    const projectName = project?.project_name ?? 'Capital Pool';
    if (user.email) sendPoolJoinedEmail(user.email, projectName).catch(() => {});
    if (profile?.phone) sendWhatsAppPoolJoined(profile.phone, projectName).catch(() => {});
  } catch {
    // ignore notification errors
  }

  revalidatePath('/dashboard');
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
