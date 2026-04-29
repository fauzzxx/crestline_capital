import { createClient } from "@/lib/supabase/server";
import { PoolsTable } from "./PoolsTable";

export default async function AdminPoolsPage() {
  const supabase = await createClient();

  const { data: poolMembers } = await supabase
    .from("pool_members")
    .select(
      "id, commitment_status, joined_at, payment_stage, documentation_status, builder_meeting_at, member_notes, project:projects(project_name, status), user_id"
    )
    .order("joined_at", { ascending: false });

  const { data: profiles } = await supabase.from("profiles").select("id, full_name, phone");

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="section-container">
      <h1 className="text-2xl font-heading font-bold mb-6">Pool Management</h1>
      <PoolsTable
        poolMembers={(poolMembers ?? []) as unknown as Array<{
          id: string;
          commitment_status: string;
          joined_at: string;
          payment_stage: string | null;
          documentation_status: string | null;
          builder_meeting_at: string | null;
          member_notes: string | null;
          project: { project_name: string; status: string } | null;
          user_id: string;
        }>}
        profileMap={profileMap as Map<string, { full_name: string | null; phone: string | null }>}
      />
    </div>
  );
}
