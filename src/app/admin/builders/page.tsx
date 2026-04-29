import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BuildersTable } from "./BuildersTable";
import { BuilderForm } from "./BuilderForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Builder } from "@/types/database";

export default async function AdminBuildersPage() {
  const supabase = await createClient();

  const [buildersRes, projectsRes] = await Promise.all([
    supabase.from("builders").select("*").order("name"),
    supabase
      .from("projects")
      .select(
        "id, project_name, builder_name, builder_id, location, status, discount_percentage, current_members_joined, minimum_members_required",
      ),
  ]);

  const builders = (buildersRes.data ?? []) as Builder[];
  const allProjects = projectsRes.data ?? [];

  const fillRateByBuilder = new Map<string, number>();
  const projectsByBuilder = new Map<string, typeof allProjects>();
  allProjects.forEach((p) => {
    const key = p.builder_id ?? "";
    if (!key) return;
    if (!projectsByBuilder.has(key)) projectsByBuilder.set(key, []);
    projectsByBuilder.get(key)!.push(p);
  });
  projectsByBuilder.forEach((projs, builderId) => {
    if (projs.length === 0) return;
    const avg =
      projs.reduce(
        (acc, p) =>
          acc +
          (p.minimum_members_required > 0
            ? (p.current_members_joined / p.minimum_members_required) * 100
            : 0),
        0,
      ) / projs.length;
    fillRateByBuilder.set(builderId, avg);
  });

  const enrichedBuilders = builders.map((b) => ({
    ...b,
    project_count: projectsByBuilder.get(b.id)?.length ?? 0,
    avg_fill_rate_pct: fillRateByBuilder.get(b.id) ?? 0,
  }));

  return (
    <div className="section-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Builder Management</h1>
          <p className="text-cream-muted text-sm mt-1">
            Manage builder profiles, trust scores, and stats shown to members.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gold-gradient-bg text-accent-foreground">
              <Plus className="w-4 h-4 mr-1" /> New Builder
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-surface-elevated border-border">
            <DialogHeader>
              <DialogTitle>Create Builder</DialogTitle>
            </DialogHeader>
            <BuilderForm />
          </DialogContent>
        </Dialog>
      </div>

      {enrichedBuilders.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-border">
          <p className="text-cream-muted">No builders yet.</p>
          <Link href="/admin/projects/new" className="inline-block mt-4 text-gold hover:underline">
            Create Project
          </Link>
        </div>
      ) : (
        <BuildersTable builders={enrichedBuilders} />
      )}
    </div>
  );
}
