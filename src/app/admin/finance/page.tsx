import { createClient } from "@/lib/supabase/server";
import { FinanceDashboard } from "./FinanceDashboard";
import type { Project, Builder } from "@/types/database";

export default async function AdminFinancePage() {
  const supabase = await createClient();

  const [projectsRes, buildersRes, poolMembersRes, milestonesRes, payoutsRes] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("builders").select("id, name").order("name"),
    supabase
      .from("pool_members")
      .select("id, project_id, commitment_status")
      .eq("commitment_status", "confirmed"),
    supabase.from("payment_milestones").select("*").order("due_date", { ascending: true }),
    supabase.from("builder_payouts").select("*").order("created_at", { ascending: false }),
  ]);

  const projects = (projectsRes.data ?? []) as Project[];
  const builders = (buildersRes.data ?? []) as Pick<Builder, "id" | "name">[];
  const confirmedByProject = new Map<string, number>();
  (poolMembersRes.data ?? []).forEach((pm) => {
    confirmedByProject.set(
      pm.project_id,
      (confirmedByProject.get(pm.project_id) ?? 0) + 1,
    );
  });

  // Revenue per project = base_price * commission_pct/100 * confirmed_members
  const revenueRows = projects.map((p) => {
    const confirmed = confirmedByProject.get(p.id) ?? 0;
    const commission = Number(p.commission_percentage ?? 0);
    const revenue = Number(p.base_price) * (commission / 100) * confirmed;
    return {
      id: p.id,
      name: p.project_name,
      builder: p.builder_name,
      confirmed,
      commission,
      revenue,
    };
  });

  const totalCommission = revenueRows.reduce((acc, r) => acc + r.revenue, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const milestones = (milestonesRes.data ?? []) as Array<{
    id: string;
    pool_member_id: string | null;
    project_id: string | null;
    milestone_label: string;
    amount: number;
    due_date: string | null;
    paid_at: string | null;
    status: "pending" | "paid" | "overdue" | "waived";
    created_at: string;
  }>;
  const payouts = (payoutsRes.data ?? []) as Array<{
    id: string;
    builder_id: string | null;
    project_id: string | null;
    amount: number;
    paid_at: string | null;
    status: "pending" | "paid" | "partial";
    notes: string | null;
    created_at: string;
  }>;

  const revenueThisMonth = milestones
    .filter((m) => m.status === "paid" && m.paid_at && new Date(m.paid_at) >= monthStart)
    .reduce((acc, m) => acc + Number(m.amount), 0);
  const builderPayoutsPending = payouts
    .filter((p) => p.status !== "paid")
    .reduce((acc, p) => acc + Number(p.amount), 0);
  const milestonesOverdue = milestones.filter((m) => {
    if (m.status === "paid" || m.status === "waived") return false;
    if (!m.due_date) return false;
    return new Date(m.due_date) < new Date();
  }).length;

  return (
    <div className="section-container">
      <h1 className="text-2xl font-heading font-bold mb-6">Finance</h1>
      <FinanceDashboard
        kpis={{
          totalCommission,
          revenueThisMonth,
          builderPayoutsPending,
          milestonesOverdue,
        }}
        revenueRows={revenueRows}
        milestones={milestones}
        payouts={payouts}
        projects={projects.map((p) => ({ id: p.id, name: p.project_name, builder_id: p.builder_id ?? null }))}
        builders={builders}
      />
    </div>
  );
}
