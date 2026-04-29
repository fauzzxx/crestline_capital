import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project, DiscountTier } from "@/types/database";
import Link from "next/link";

function effectiveDiscountPct(project: Project): number {
  const tiers: DiscountTier[] = (project.discount_tiers ?? []).slice();
  if (tiers.length === 0) return Number(project.discount_percentage) || 0;
  const reached = tiers
    .filter((t) => project.current_members_joined >= t.min_units)
    .sort((a, b) => b.discount_percentage - a.discount_percentage);
  if (reached.length > 0) return Number(reached[0].discount_percentage);
  return Number(project.discount_percentage) || 0;
}

export async function BulkDiscountComparison() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .in("status", ["open", "unlocked"])
    .order("created_at", { ascending: false });

  const rows = (projects ?? []) as Project[];

  return (
    <section
      id="bulk-comparison"
      className="glass-card p-6 rounded-xl border border-border scroll-mt-24"
    >
      <div className="mb-4">
        <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
          <span className="gold-gradient-text">Bulk Discount Comparison</span>
        </h2>
        <p className="text-sm text-cream-muted mt-1">
          Compare list vs pool prices across active capital pools.
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="text-cream-muted text-center py-8 italic">
          No active capital pools to compare yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Project</TableHead>
                <TableHead>Builder</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">List Price</TableHead>
                <TableHead className="text-right">Pool Price</TableHead>
                <TableHead className="text-right">You Save</TableHead>
                <TableHead>Pool</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => {
                const list = Number(p.base_price) || 0;
                const pct = effectiveDiscountPct(p);
                const pool = list * (1 - pct / 100);
                const save = list - pool;
                return (
                  <TableRow key={p.id} className="border-border">
                    <TableCell className="font-medium">
                      <Link href={`/projects/${p.id}`} className="hover:text-gold">
                        {p.project_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-cream-muted">{p.builder_name}</TableCell>
                    <TableCell className="text-cream-muted">{p.location}</TableCell>
                    <TableCell className="text-right">
                      ₹{list.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-gold font-medium">
                      ₹{Math.round(pool).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-semibold">₹{Math.round(save).toLocaleString()}</div>
                      <div className="text-xs text-gold">{pct}%</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gold/30 text-gold">
                        {p.current_members_joined}/{p.minimum_members_required}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
