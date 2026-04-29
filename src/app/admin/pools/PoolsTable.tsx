"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import {
  removePoolMember,
  updatePoolMemberStatus,
  updatePoolMemberProgress,
} from "@/app/actions/admin";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PoolMemberRow {
  id: string;
  commitment_status: string;
  joined_at: string;
  payment_stage: string | null;
  documentation_status: string | null;
  builder_meeting_at: string | null;
  member_notes: string | null;
  project: { project_name: string; status: string } | null;
  user_id: string;
}

interface PoolsTableProps {
  poolMembers: PoolMemberRow[];
  profileMap: Map<string, { full_name: string | null; phone: string | null }>;
}

export function PoolsTable({ poolMembers, profileMap }: PoolsTableProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        payment_stage: string;
        documentation_status: string;
        builder_meeting_at: string;
        member_notes: string;
      }
    >
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this member from the pool?")) return;
    const result = await removePoolMember(id);
    if (result.success) {
      toast.success("Member removed");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleStatusChange = async (id: string, status: "interested" | "confirmed" | "dropped") => {
    const result = await updatePoolMemberStatus(id, status);
    if (result.success) {
      toast.success("Status updated");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const startEditing = (pm: PoolMemberRow) => {
    if (expandedId === pm.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(pm.id);
    setDrafts((prev) => ({
      ...prev,
      [pm.id]: {
        payment_stage: pm.payment_stage ?? "not_started",
        documentation_status: pm.documentation_status ?? "not_started",
        builder_meeting_at: pm.builder_meeting_at
          ? new Date(pm.builder_meeting_at).toISOString().slice(0, 16)
          : "",
        member_notes: pm.member_notes ?? "",
      },
    }));
  };

  const saveProgress = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    const result = await updatePoolMemberProgress(id, {
      payment_stage: draft.payment_stage as "not_started" | "token_paid" | "partial" | "completed",
      documentation_status: draft.documentation_status as
        | "not_started"
        | "in_progress"
        | "submitted"
        | "verified",
      builder_meeting_at: draft.builder_meeting_at
        ? new Date(draft.builder_meeting_at).toISOString()
        : null,
      member_notes: draft.member_notes.trim() || null,
    });
    setSavingId(null);
    if (result.success) {
      toast.success("Progress saved");
      setExpandedId(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="w-8"></TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {poolMembers.map((pm) => {
            const profile = profileMap.get(pm.user_id);
            const isExpanded = expandedId === pm.id;
            const draft = drafts[pm.id];
            return (
              <Fragment key={pm.id}>
                <TableRow className="border-border">
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => startEditing(pm)}
                      className="text-cream-muted hover:text-gold"
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{profile?.full_name ?? "—"}</p>
                      <p className="text-sm text-cream-muted">
                        {profile?.phone ?? pm.user_id.slice(0, 8)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {pm.project ? (
                      <>
                        <p className="font-medium">{pm.project.project_name}</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {pm.project.status}
                        </Badge>
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={pm.commitment_status}
                      onValueChange={(v) =>
                        handleStatusChange(pm.id, v as "interested" | "confirmed" | "dropped")
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-cream-muted">
                    {new Date(pm.joined_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="destructive" onClick={() => handleRemove(pm.id)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
                {isExpanded && draft && (
                  <TableRow className="border-border bg-surface-elevated/30">
                    <TableCell colSpan={6} className="py-4">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[10px] text-cream-muted uppercase mb-1 block">
                            Payment Stage
                          </label>
                          <Select
                            value={draft.payment_stage}
                            onValueChange={(v) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [pm.id]: { ...prev[pm.id], payment_stage: v },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">Not Started</SelectItem>
                              <SelectItem value="token_paid">Token Paid</SelectItem>
                              <SelectItem value="partial">Partial</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] text-cream-muted uppercase mb-1 block">
                            Documentation
                          </label>
                          <Select
                            value={draft.documentation_status}
                            onValueChange={(v) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [pm.id]: { ...prev[pm.id], documentation_status: v },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_started">Not Started</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="verified">Verified</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-[10px] text-cream-muted uppercase mb-1 block">
                            Builder Meeting
                          </label>
                          <Input
                            type="datetime-local"
                            value={draft.builder_meeting_at}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [pm.id]: { ...prev[pm.id], builder_meeting_at: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                          <Button
                            type="button"
                            onClick={() => saveProgress(pm.id)}
                            disabled={savingId === pm.id}
                            className="gold-gradient-bg text-accent-foreground w-full"
                          >
                            {savingId === pm.id ? "Saving..." : "Save Progress"}
                          </Button>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-4">
                          <label className="text-[10px] text-cream-muted uppercase mb-1 block">
                            Member Notes (admin only)
                          </label>
                          <Textarea
                            value={draft.member_notes}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [pm.id]: { ...prev[pm.id], member_notes: e.target.value },
                              }))
                            }
                            rows={3}
                            placeholder="Internal notes about this member's progress."
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
      {poolMembers.length === 0 && (
        <p className="text-cream-muted text-center py-8">No pool participants yet.</p>
      )}
    </div>
  );
}
