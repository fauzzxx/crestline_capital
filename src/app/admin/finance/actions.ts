"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { sendPaymentMilestoneStatusEmail } from "@/lib/email";
import { sendWhatsAppPaymentMilestoneUpdate } from "@/lib/notifications";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return supabase;
}

export async function createPaymentMilestone(data: {
  pool_member_id?: string | null;
  project_id?: string | null;
  milestone_label: string;
  amount: number;
  due_date?: string | null;
  status?: "pending" | "paid" | "overdue" | "waived";
}) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("payment_milestones").insert({
      pool_member_id: data.pool_member_id ?? null,
      project_id: data.project_id ?? null,
      milestone_label: data.milestone_label,
      amount: data.amount,
      due_date: data.due_date ?? null,
      status: data.status ?? "pending",
    });
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/finance");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function updatePaymentMilestoneStatus(
  id: string,
  status: "pending" | "paid" | "overdue" | "waived",
) {
  try {
    const supabase = await requireAdmin();
    const updates: Record<string, unknown> = { status };
    if (status === "paid") updates.paid_at = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from("payment_milestones")
      .update(updates)
      .eq("id", id)
      .select("id, milestone_label, amount, project_id, pool_member_id, status")
      .single();
    if (error) return { success: false, error: error.message };

    // Notify the relevant member, if linked. Service-role lookup so we can read auth.users email.
    try {
      if (updated?.pool_member_id) {
        const admin = createServiceRoleClient();
        const [{ data: pm }, { data: project }] = await Promise.all([
          admin
            .from("pool_members")
            .select("user_id")
            .eq("id", updated.pool_member_id)
            .single(),
          updated.project_id
            ? admin.from("projects").select("project_name").eq("id", updated.project_id).single()
            : Promise.resolve({ data: null as { project_name?: string } | null }),
        ]);
        if (pm?.user_id) {
          const { data: profile } = await admin
            .from("profiles")
            .select("phone")
            .eq("id", pm.user_id)
            .single();
          const { data: userResp } = await admin.auth.admin.getUserById(pm.user_id);
          const email = userResp?.user?.email;
          const payload = {
            milestone_label: updated.milestone_label,
            status,
            amount: Number(updated.amount),
            project_name: project?.project_name ?? null,
          };
          if (email) sendPaymentMilestoneStatusEmail(email, payload).catch(() => {});
          if (profile?.phone)
            sendWhatsAppPaymentMilestoneUpdate(profile.phone, payload).catch(() => {});
        }
      }
    } catch {
      // best-effort notify — never block status update
    }

    revalidatePath("/admin/finance");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function createBuilderPayout(data: {
  builder_id: string;
  project_id: string;
  amount: number;
  status?: "pending" | "paid" | "partial";
  notes?: string | null;
}) {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("builder_payouts").insert({
      builder_id: data.builder_id,
      project_id: data.project_id,
      amount: data.amount,
      status: data.status ?? "pending",
      notes: data.notes ?? null,
    });
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/finance");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
}

export async function updateBuilderPayoutStatus(
  id: string,
  status: "pending" | "paid" | "partial",
) {
  try {
    const supabase = await requireAdmin();
    const updates: Record<string, unknown> = { status };
    if (status === "paid") updates.paid_at = new Date().toISOString();
    const { error } = await supabase.from("builder_payouts").update(updates).eq("id", id);
    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/finance");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unauthorized" };
  }
}
