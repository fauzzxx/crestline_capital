"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendMembershipApproved } from '@/lib/email';
import { sendWhatsAppMembershipApproved } from '@/lib/notifications';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Forbidden');
  return { supabase, userId: user.id };
}

export async function approveMembershipRequest(requestId: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const { supabase, userId: adminId } = await requireAdmin();
    const { data: req } = await supabase
      .from('membership_requests')
      .select('phone, email, full_name')
      .eq('id', requestId)
      .single();
    if (!req) return { success: false, error: 'Request not found' };

    const { error: updateReq } = await supabase
      .from('membership_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);
    if (updateReq) return { success: false, error: updateReq.message };

    await supabase
      .from('profiles')
      .update({ membership_status: 'approved', updated_at: new Date().toISOString() })
      .eq('phone', req.phone);

    const { data: profileByPhone } = await supabase.from('profiles').select('id').eq('phone', req.phone).single();
    if (profileByPhone?.id) {
      await supabase.from('admin_notes').insert({
        user_id: profileByPhone.id,
        note: `Membership approved by admin (request ${requestId}).`,
      });
    }

    await sendMembershipApproved(req.email);
    sendWhatsAppMembershipApproved(req.phone).catch(() => {});

    revalidatePath('/admin/members');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unauthorized' };
  }
}

export async function rejectMembershipRequest(requestId: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { data: req } = await supabase
      .from('membership_requests')
      .select('phone')
      .eq('id', requestId)
      .single();
    await supabase.from('membership_requests').update({ status: 'rejected' }).eq('id', requestId);
    if (req?.phone) {
      await supabase.from('profiles').update({ membership_status: 'rejected', updated_at: new Date().toISOString() }).eq('phone', req.phone);
    }
    revalidatePath('/admin/members');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unauthorized' };
  }
}

export async function addAdminNote(userId: string, note: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('admin_notes').insert({ user_id: userId, note });
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/members');
  return { success: true };
}

export async function deleteContactMessage(id: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    revalidatePath('/admin/contact-messages');
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unauthorized' };
  }
}

// Builder Management
export async function createBuilder(data: {
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  past_performance: string | null;
  trust_score: number;
}) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('builders').insert(data);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/builders');
  return { success: true };
}

export async function updateBuilder(id: string, data: Partial<{
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  past_performance: string | null;
  trust_score: number;
}>) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('builders').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/builders');
  return { success: true };
}

export async function deleteBuilder(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('builders').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/builders');
  return { success: true };
}

export async function createProject(data: {
  project_name: string;
  builder_name: string;
  builder_id?: string | null;
  builder_logo?: string | null;
  thumbnail_url?: string | null;
  location: string;
  base_price: number;
  discount_percentage: number;
  discount_tiers?: import('@/types/database').DiscountTier[];
  unit_configs?: import('@/types/database').UnitConfig[];
  google_map_url?: string | null;
  brochure_pdf?: string | null;
  project_video?: string | null;
  commission_percentage?: number;
  minimum_members_required: number;
  deal_deadline: string | null;
  description: string | null;
  additional_info?: string | null;
  status: 'open' | 'unlocked' | 'closed' | 'coming_soon';
}) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('projects').insert({
    ...data,
    current_members_joined: 0,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/projects');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateProject(
  id: string,
  data: Partial<{
    project_name: string;
    builder_name: string;
    builder_id: string | null;
    location: string;
    base_price: number;
    discount_percentage: number;
    discount_tiers: import('@/types/database').DiscountTier[];
    unit_configs: import('@/types/database').UnitConfig[];
    google_map_url: string | null;
    builder_logo: string | null;
    brochure_pdf: string | null;
    project_video: string | null;
    thumbnail_url: string | null;
    commission_percentage: number;
    minimum_members_required: number;
    deal_deadline: string | null;
    description: string | null;
    additional_info: string | null;
    status: 'open' | 'unlocked' | 'closed' | 'coming_soon';
  }>
) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('projects').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/projects');
  revalidatePath('/dashboard');
  revalidatePath(`/projects/${id}`);
  return { success: true };
}

export async function deleteProject(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/projects');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function addProjectMedia(projectId: string, mediaType: 'image' | 'video' | 'youtube', mediaUrl: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('project_media').insert({ project_id: projectId, media_type: mediaType, media_url: mediaUrl });
  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

const BUCKET = 'project-media';
const THUMBNAILS_PREFIX = 'thumbnails';

export async function uploadProjectThumbnail(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const file = formData.get('file') as File | null;
    if (!file?.size) return { success: false, error: 'No file provided' };
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!file.type || !allowed.includes(file.type)) {
      return { success: false, error: 'Please upload a JPEG, PNG, WebP or GIF image' };
    }

    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = createServiceRoleClient();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${THUMBNAILS_PREFIX}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) return { success: false, error: error.message };

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { success: true, url: urlData.publicUrl };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Upload failed' };
  }
}

export async function uploadProjectMediaFile(
  projectId: string,
  mediaType: 'image' | 'video',
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const file = formData.get('file') as File | null;
    if (!file?.size) return { success: false, error: 'No file provided' };

    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const supabase = createServiceRoleClient();

    const ext = file.name.split('.').pop()?.toLowerCase() || (mediaType === 'image' ? 'jpg' : 'mp4');
    const path = `${projectId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4'),
      upsert: false,
    });

    if (error) return { success: false, error: error.message };

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { success: true, url: urlData.publicUrl };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Upload failed' };
  }
}

export async function removeProjectMedia(mediaId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('project_media').delete().eq('id', mediaId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function removePoolMember(poolMemberId: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('pool_members').delete().eq('id', poolMemberId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/projects');
  revalidatePath('/admin/pools');
  return { success: true };
}

export async function updatePoolMemberStatus(poolMemberId: string, commitment_status: 'interested' | 'confirmed' | 'dropped') {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('pool_members').update({ commitment_status }).eq('id', poolMemberId);
  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/projects');
  revalidatePath('/admin/pools');
  return { success: true };
}
