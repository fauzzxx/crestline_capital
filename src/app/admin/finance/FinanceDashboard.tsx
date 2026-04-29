"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, TrendingUp, AlertTriangle, Banknote } from "lucide-react";
import {
  createBuilderPayout,
  createPaymentMilestone,
  updateBuilderPayoutStatus,
  updatePaymentMilestoneStatus,
} from "./actions";

interface Milestone {
  id: string;
  pool_member_id: string | null;
  project_id: string | null;
  milestone_label: string;
  amount: number;
  due_date: string | null;
  paid_at: string | null;
  status: "pending" | "paid" | "overdue" | "waived";
  created_at: string;
}
interface Payout {
  id: string;
  builder_id: string | null;
  project_id: string | null;
  amount: number;
  paid_at: string | null;
  status: "pending" | "paid" | "partial";
  notes: string | null;
  created_at: string;
}

interface Props {
  kpis: {
    totalCommission: number;
    revenueThisMonth: number;
    builderPayoutsPending: number;
    milestonesOverdue: number;
  };
  revenueRows: Array<{
    id: string;
    name: string;
    builder: string;
    confirmed: number;
    commission: number;
    revenue: number;
  }>;
  milestones: Milestone[];
  payouts: Payout[];
  projects: Array<{ id: string; name: string; builder_id: string | null }>;
  builders: Array<{ id: string; name: string }>;
}

function formatCurrency(n: number): string {
  return `₹${Math.round(n).toLocaleString()}`;
}

export function FinanceDashboard({
  kpis,
  revenueRows,
  milestones,
  payouts,
  projects,
  builders,
}: Props) {
  const router = useRouter();
  const [milestoneFilter, setMilestoneFilter] = useState<string>("all");

  const filteredMilestones =
    milestoneFilter === "all"
      ? milestones
      : milestones.filter((m) => m.status === milestoneFilter);

  return (
    <div className="space-y-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Wallet className="w-5 h-5 text-gold" />}
          label="Total Commission"
          value={formatCurrency(kpis.totalCommission)}
        />
        <KpiCard
          icon={<TrendingUp className="w-5 h-5 text-gold" />}
          label="Revenue This Month"
          value={formatCurrency(kpis.revenueThisMonth)}
        />
        <KpiCard
          icon={<Banknote className="w-5 h-5 text-gold" />}
          label="Builder Payouts Pending"
          value={formatCurrency(kpis.builderPayoutsPending)}
        />
        <KpiCard
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          label="Milestones Overdue"
          value={kpis.milestonesOverdue.toString()}
        />
      </div>

      <section>
        <h2 className="text-lg font-heading font-semibold mb-4">Revenue per Project</h2>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Project</TableHead>
                <TableHead>Builder</TableHead>
                <TableHead className="text-right">Confirmed</TableHead>
                <TableHead className="text-right">Commission %</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueRows.map((r) => (
                <TableRow key={r.id} className="border-border">
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-cream-muted">{r.builder}</TableCell>
                  <TableCell className="text-right">{r.confirmed}</TableCell>
                  <TableCell className="text-right">{r.commission}%</TableCell>
                  <TableCell className="text-right text-gold font-medium">
                    {formatCurrency(r.revenue)}
                  </TableCell>
                </TableRow>
              ))}
              {revenueRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-cream-muted py-8">
                    No projects yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold">Builder Payouts</h2>
          <NewPayoutDialog
            projects={projects}
            builders={builders}
            onCreated={() => router.refresh()}
          />
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Builder</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => {
                const builder = builders.find((b) => b.id === p.builder_id)?.name ?? "—";
                const project = projects.find((pr) => pr.id === p.project_id)?.name ?? "—";
                return (
                  <TableRow key={p.id} className="border-border">
                    <TableCell className="font-medium">{builder}</TableCell>
                    <TableCell className="text-cream-muted">{project}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(p.amount))}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === "paid" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-cream-muted text-sm">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={p.status}
                        onValueChange={async (v) => {
                          const result = await updateBuilderPayoutStatus(
                            p.id,
                            v as "pending" | "paid" | "partial",
                          );
                          if (result.success) {
                            toast.success("Payout updated");
                            router.refresh();
                          } else {
                            toast.error(result.error);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
              {payouts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-cream-muted py-8">
                    No payouts recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold">Payment Milestones</h2>
          <div className="flex items-center gap-3">
            <Select value={milestoneFilter} onValueChange={setMilestoneFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="waived">Waived</SelectItem>
              </SelectContent>
            </Select>
            <NewMilestoneDialog
              projects={projects}
              onCreated={() => router.refresh()}
            />
          </div>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>Label</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMilestones.map((m) => {
                const project = projects.find((p) => p.id === m.project_id)?.name ?? "—";
                return (
                  <TableRow key={m.id} className="border-border">
                    <TableCell className="font-medium">{m.milestone_label}</TableCell>
                    <TableCell className="text-cream-muted">{project}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(m.amount))}</TableCell>
                    <TableCell className="text-sm text-cream-muted">
                      {m.due_date ? new Date(m.due_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={m.status}
                        onValueChange={async (v) => {
                          const result = await updatePaymentMilestoneStatus(
                            m.id,
                            v as "pending" | "paid" | "overdue" | "waived",
                          );
                          if (result.success) {
                            toast.success("Milestone updated");
                            router.refresh();
                          } else {
                            toast.error(result.error);
                          }
                        }}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="waived">Waived</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredMilestones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-cream-muted py-8">
                    No milestones for this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-card p-5 rounded-xl border border-border">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[10px] text-cream-muted uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function NewMilestoneDialog({
  projects,
  onCreated,
}: {
  projects: Array<{ id: string; name: string }>;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    project_id: "",
    milestone_label: "",
    amount: "",
    due_date: "",
  });

  const handleSubmit = async () => {
    if (!form.milestone_label.trim() || !form.amount) return;
    setSubmitting(true);
    const result = await createPaymentMilestone({
      project_id: form.project_id || null,
      milestone_label: form.milestone_label.trim(),
      amount: Number(form.amount),
      due_date: form.due_date || null,
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Milestone added");
      setOpen(false);
      setForm({ project_id: "", milestone_label: "", amount: "", due_date: "" });
      onCreated();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">+ Add Milestone</Button>
      </DialogTrigger>
      <DialogContent className="bg-surface-elevated border-border">
        <DialogHeader>
          <DialogTitle>New Payment Milestone</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-cream-muted block mb-1">Project (optional)</label>
            <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Label</label>
            <Input
              value={form.milestone_label}
              onChange={(e) => setForm({ ...form, milestone_label: e.target.value })}
              placeholder="Token, 30% slab, possession, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-cream-muted block mb-1">Amount (₹)</label>
              <Input
                type="number"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-cream-muted block mb-1">Due Date</label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gold-gradient-bg text-accent-foreground"
          >
            {submitting ? "Saving..." : "Add Milestone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewPayoutDialog({
  projects,
  builders,
  onCreated,
}: {
  projects: Array<{ id: string; name: string; builder_id: string | null }>;
  builders: Array<{ id: string; name: string }>;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    builder_id: "",
    project_id: "",
    amount: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!form.builder_id || !form.project_id || !form.amount) return;
    setSubmitting(true);
    const result = await createBuilderPayout({
      builder_id: form.builder_id,
      project_id: form.project_id,
      amount: Number(form.amount),
      notes: form.notes.trim() || null,
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Payout added");
      setOpen(false);
      setForm({ builder_id: "", project_id: "", amount: "", notes: "" });
      onCreated();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">+ Add Payout</Button>
      </DialogTrigger>
      <DialogContent className="bg-surface-elevated border-border">
        <DialogHeader>
          <DialogTitle>New Builder Payout</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-cream-muted block mb-1">Builder</label>
            <Select value={form.builder_id} onValueChange={(v) => setForm({ ...form, builder_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select builder" /></SelectTrigger>
              <SelectContent>
                {builders.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Project</label>
            <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Amount (₹)</label>
            <Input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Notes</label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gold-gradient-bg text-accent-foreground"
          >
            {submitting ? "Saving..." : "Add Payout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
