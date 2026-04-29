"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteBuilder } from "@/app/actions/admin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ShieldCheck } from "lucide-react";
import type { Builder } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BuilderForm } from "./BuilderForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EnrichedBuilder = Builder & {
  project_count: number;
  avg_fill_rate_pct: number;
};

interface BuildersTableProps {
  builders: EnrichedBuilder[];
}

type SortKey =
  | "name"
  | "trust_score"
  | "past_projects_count"
  | "total_units_delivered"
  | "avg_fill_rate_pct";

function trustBadgeClass(score: number | null | undefined) {
  if (typeof score !== "number") return "bg-surface-elevated border-border text-cream-muted";
  if (score >= 80) return "bg-green-500/15 border-green-500/40 text-green-400";
  if (score >= 60) return "bg-gold/15 border-gold/40 text-gold";
  return "bg-surface-elevated border-border text-cream-muted";
}

export function BuildersTable({ builders }: BuildersTableProps) {
  const router = useRouter();
  const [editingBuilder, setEditingBuilder] = useState<Builder | null>(null);
  const [open, setOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("trust_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const arr = [...builders];
    arr.sort((a, b) => {
      const va = (a[sortKey] ?? 0) as number | string;
      const vb = (b[sortKey] ?? 0) as number | string;
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      const na = Number(va) || 0;
      const nb = Number(vb) || 0;
      return sortDir === "asc" ? na - nb : nb - na;
    });
    return arr;
  }, [builders, sortKey, sortDir]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this builder? Projects linked to this builder will not be deleted.")) return;
    const result = await deleteBuilder(id);
    if (result.success) {
      toast.success("Builder deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const renderSortHeader = (label: string, k: SortKey) => {
    const Icon = sortKey === k ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 hover:text-gold"
      >
        {label}
        <Icon className="w-3 h-3" />
      </button>
    );
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead>{renderSortHeader("Builder", "name")}</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-center">{renderSortHeader("Trust", "trust_score")}</TableHead>
            <TableHead className="text-right">{renderSortHeader("Projects", "past_projects_count")}</TableHead>
            <TableHead className="text-right">{renderSortHeader("Units", "total_units_delivered")}</TableHead>
            <TableHead className="text-right">{renderSortHeader("Avg Pool Fill", "avg_fill_rate_pct")}</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((builder) => (
            <TableRow key={builder.id} className="border-border">
              <TableCell className="font-medium">{builder.name}</TableCell>
              <TableCell className="text-cream-muted text-sm">
                {builder.contact_person && <div>{builder.contact_person}</div>}
                {builder.phone && <div className="text-xs opacity-70">{builder.phone}</div>}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${trustBadgeClass(builder.trust_score)}`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {typeof builder.trust_score === "number" ? `${builder.trust_score}/100` : "—"}
                </span>
              </TableCell>
              <TableCell className="text-right">{builder.past_projects_count ?? 0}</TableCell>
              <TableCell className="text-right">{(builder.total_units_delivered ?? 0).toLocaleString()}</TableCell>
              <TableCell className="text-right text-gold font-medium">
                {Math.round(builder.avg_fill_rate_pct)}%
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Dialog
                    open={open && editingBuilder?.id === builder.id}
                    onOpenChange={(val) => {
                      setOpen(val);
                      if (!val) setEditingBuilder(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-gold"
                        onClick={() => {
                          setEditingBuilder(builder);
                          setOpen(true);
                        }}
                        aria-label={`Edit ${builder.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-surface-elevated border-border max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Builder</DialogTitle>
                      </DialogHeader>
                      <BuilderForm
                        builder={builder}
                        onSuccess={() => {
                          setOpen(false);
                          setEditingBuilder(null);
                          router.refresh();
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(builder.id)}
                    aria-label={`Delete ${builder.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
