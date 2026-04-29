import { createClient } from "@/lib/supabase/server";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import Link from "next/link";
import { FadeIn } from "@/components/shared/FadeIn";
import { Briefcase, Sparkles, LayoutDashboard, Calculator, Bell, CheckCircle2, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatLabel, formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, activeRes, upcomingRes, myPoolsRes] = await Promise.all([
    supabase.from("profiles").select("membership_status").eq("id", user.id).single(),
    supabase
      .from("projects")
      .select("*")
      .in("status", ["open", "unlocked"])
      .order("created_at", { ascending: false }),
    supabase
      .from("projects")
      .select("*")
      .eq("status", "coming_soon")
      .order("created_at", { ascending: false }),
    supabase
      .from("pool_members")
      .select(
        "project_id, commitment_status, payment_stage, documentation_status, builder_meeting_at, project:projects(*)"
      )
      .eq("user_id", user.id),
  ]);

  const profile = profileRes.data;
  const activeProjects = (activeRes.data ?? []) as import("@/types/database").Project[];
  const upcomingProjects = (upcomingRes.data ?? []) as import("@/types/database").Project[];
  const myPools = (myPoolsRes.data ?? []) as unknown as import("@/types/database").PoolMemberWithProject[];
  const myProjectIds = new Set(myPools.map((p) => p.project_id));
  const unlockedPools = myPools.filter((pm) => pm.project?.status === "unlocked");

  return (
    <div className="section-container pb-20">
      <FadeIn className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">
              Member <span className="gold-gradient-text">Dashboard</span>
            </h1>
            <p className="text-cream-muted mt-1">
              Welcome back. Here are the latest structured opportunities.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-elevated/50 px-4 py-2 rounded-lg border border-border">
              <p className="text-[10px] text-cream-muted uppercase">Joined Pools</p>
              <p className="text-xl font-bold text-gold">{myPools.length}</p>
            </div>
            <div className="bg-surface-elevated/50 px-4 py-2 rounded-lg border border-border">
              <p className="text-[10px] text-cream-muted uppercase">Active Deals</p>
              <p className="text-xl font-bold text-gold">{activeProjects.length}</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Notifications / Activity Panel */}
      <FadeIn className="mb-12">
        <div className="glass-card p-6 rounded-xl border border-gold/10">
          <h2 className="text-sm font-heading font-semibold flex items-center gap-2 mb-4 text-gold">
            <Bell className="w-4 h-4" /> Notifications
          </h2>
          <ul className="space-y-2 text-sm">
            {profile?.membership_status === "approved" && (
              <li className="flex items-center gap-2 text-cream-muted">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span>Your membership is active. You can join Capital Pools and access curated opportunities.</span>
              </li>
            )}
            {activeProjects.length > 0 && (
              <li className="flex items-center gap-2 text-cream-muted">
                <Briefcase className="w-4 h-4 text-gold shrink-0" />
                <span>{activeProjects.length} active Capital Pool{activeProjects.length !== 1 ? "s" : ""} available.</span>
              </li>
            )}
            {upcomingProjects.length > 0 && (
              <li className="flex items-center gap-2 text-cream-muted">
                <Sparkles className="w-4 h-4 text-gold shrink-0" />
                <span>{upcomingProjects.length} upcoming opportunit{upcomingProjects.length !== 1 ? "ies" : "y"}—express interest to get notified.</span>
              </li>
            )}
            {unlockedPools.length > 0 && (
              <li className="flex items-center gap-2 text-cream-muted">
                <Unlock className="w-4 h-4 text-gold shrink-0" />
                <span>Pool unlocked: {unlockedPools.map((p) => p.project?.project_name).filter(Boolean).join(", ")}—discount tier active.</span>
              </li>
            )}
            {profile?.membership_status === "approved" && activeProjects.length === 0 && upcomingProjects.length === 0 && unlockedPools.length === 0 && (
              <li className="text-cream-muted">No new updates. New opportunities will appear here when added.</li>
            )}
          </ul>
        </div>
      </FadeIn>

      {/* Active Capital Pools */}
      <section className="mb-20" id="active-pools">
        <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-8">
          <Briefcase className="w-5 h-5 text-gold" />
          Active Capital Pools
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeProjects.map((project, i) => (
            <FadeIn key={project.id} delay={i * 0.05}>
              <ProjectCard
                project={project}
                isMember={myProjectIds.has(project.id)}
                isUnlocked={project.status === "unlocked"}
              />
            </FadeIn>
          ))}
        </div>
        {activeProjects.length === 0 && (
          <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-border/50">
            <p className="text-cream-muted italic">
              No active capital pools at the moment. Keep an eye on Upcoming Opportunities.
            </p>
          </div>
        )}
      </section>

      {/* Upcoming Opportunities */}
      <section className="mb-20" id="upcoming">
        <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-gold" />
          Upcoming Opportunities
        </h2>
        {upcomingProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-90">
            {upcomingProjects.map((project, i) => (
              <FadeIn key={project.id} delay={i * 0.05}>
                <ProjectCard
                  project={project}
                  isMember={myProjectIds.has(project.id)}
                  isUnlocked={false}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <div className="glass-card p-8 rounded-2xl border border-dashed border-gold/20 text-center">
              <p className="text-cream-muted mb-4">
                New curated opportunities are added regularly. Get notified when pre-launch pools open.
              </p>
              <Link
                href="/contact?subject=Expression%20of%20Interest"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gold-gradient-bg text-accent-foreground font-medium hover:opacity-90"
              >
                Expression of Interest
              </Link>
            </div>
          </FadeIn>
        )}
      </section>

      {/* Investment Tools */}
      <section className="mb-20">
        <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-6">
          <Calculator className="w-5 h-5 text-gold" />
          Investment Tools
        </h2>
        <FadeIn>
          <div className="glass-card p-6 rounded-xl border border-border flex flex-wrap gap-4">
            <Link
              href="/dashboard/tools"
              className="px-5 py-2.5 rounded-lg gold-border text-gold font-medium hover:gold-glow transition-all text-sm"
            >
              EMI Calculator
            </Link>
            <Link
              href="/dashboard/tools"
              className="px-5 py-2.5 rounded-lg gold-border text-gold font-medium hover:gold-glow transition-all text-sm"
            >
              Appreciation Projection
            </Link>
            <Link
              href="/dashboard/tools#bulk-comparison"
              className="px-5 py-2.5 rounded-lg gold-border text-gold font-medium hover:gold-glow transition-all text-sm"
            >
              Bulk Discount Comparison
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* My Pools */}
      <section>
        <h2 className="text-xl font-heading font-semibold flex items-center gap-2 mb-8" id="my-pools">
          <LayoutDashboard className="w-5 h-5 text-gold" />
          My Pools
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPools
            .filter((pm) => pm.project)
            .map((pm, i) => (
              <FadeIn key={pm.project_id} delay={i * 0.05}>
                <div className="glass-card p-6 rounded-xl border border-gold/10 hover:border-gold/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="outline" className="text-[10px] border-gold/20 text-gold uppercase">
                      {pm.project.status}
                    </Badge>
                    <span className="text-[10px] text-cream-muted bg-surface-elevated px-2 py-0.5 rounded">
                      Ref: {pm.project_id.slice(0, 8)}
                    </span>
                  </div>
                  <Link href={`/projects/${pm.project_id}`} className="block">
                    <h3 className="font-heading font-semibold text-foreground group-hover:text-gold transition-colors">
                      {pm.project.project_name}
                    </h3>
                  </Link>
                  <p className="text-xs text-cream-muted mt-2">
                    {pm.project.builder_name} • {pm.project.location}
                  </p>

                  <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-cream-muted uppercase">Deal Status</span>
                      <span className="text-gold font-medium capitalize">{pm.project.status === "unlocked" ? "In Progress" : pm.project.status}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-cream-muted uppercase">Your Commitment</span>
                      <span className="capitalize">{pm.commitment_status}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-cream-muted uppercase">Payment Stage</span>
                      <span className="text-foreground">{formatLabel(pm.payment_stage)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-cream-muted uppercase">Documentation</span>
                      <span className="text-foreground">{formatLabel(pm.documentation_status)}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-cream-muted uppercase">Builder Meeting</span>
                      <span className="text-foreground">{formatDateTime(pm.builder_meeting_at)}</span>
                    </div>
                    <Link
                      href={`/projects/${pm.project_id}`}
                      className="mt-3 block text-xs text-gold hover:underline flex items-center gap-1 group/link"
                    >
                      View full details <Sparkles className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
        </div>
        {myPools.length === 0 && (
          <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-border/50 bg-gold/[0.02]">
            <p className="text-cream-muted text-sm italic">
              You haven&apos;t joined any capital pools yet. Participate in an active pool to unlock bulk discounts.
            </p>
            <Link href="#active-pools" className="inline-block mt-4 text-sm text-gold hover:underline">
              Browse Active Capital Pools above
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
