"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveMembershipRequest,
  rejectMembershipRequest,
  updateMemberNotes,
  addAdminNote,
} from "@/app/actions/admin";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
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
import type { MembershipRequest, Profile } from "@/types/database";
import {
  BUDGET_RANGES,
  BUYING_PURPOSES,
  HYDERABAD_LOCATIONS,
} from "@/lib/constants";

interface MembersTableProps {
  requests: MembershipRequest[];
  profiles?: Profile[];
  searchParams?: { status?: string; budget?: string; location?: string; purpose?: string };
}

export function MembersTable({ requests, profiles = [], searchParams = {} }: MembersTableProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [quickNoteUserId, setQuickNoteUserId] = useState<string | null>(null);
  const [quickNoteText, setQuickNoteText] = useState("");

  const profileByPhone = (phone: string) =>
    profiles.find((p) => p.phone === phone || (p.phone && phone.includes(p.phone)));

  const status = searchParams.status ?? "all";
  const budget = searchParams.budget ?? "";
  const location = searchParams.location ?? "";
  const purpose = searchParams.purpose ?? "";

  const updateParams = (updates: {
    status?: string;
    budget?: string;
    location?: string;
    purpose?: string;
  }) => {
    const next = {
      status: updates.status !== undefined ? updates.status : status,
      budget: updates.budget !== undefined ? updates.budget : budget,
      location: updates.location !== undefined ? updates.location : location,
      purpose: updates.purpose !== undefined ? updates.purpose : purpose,
    };
    const p = new URLSearchParams();
    if (next.status && next.status !== "all") p.set("status", next.status);
    if (next.budget) p.set("budget", next.budget);
    if (next.location) p.set("location", next.location);
    if (next.purpose) p.set("purpose", next.purpose);
    router.push(`/admin/members${p.toString() ? `?${p.toString()}` : ""}`);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }, [requests, search]);

  const handleApprove = async (requestId: string) => {
    const result = await approveMembershipRequest(requestId);
    if (result.success) {
      toast.success("Request approved");
      router.refresh();
    } else {
      toast.error("error" in result ? String(result.error) : "Failed to approve");
    }
  };

  const handleReject = async (requestId: string) => {
    const result = await rejectMembershipRequest(requestId);
    if (result.success) {
      toast.success("Request rejected");
      router.refresh();
    } else {
      toast.error("error" in result ? String(result.error) : "Failed to reject");
    }
  };

  const handleSaveNotes = async (requestId: string) => {
    setSavingId(requestId);
    const result = await updateMemberNotes(requestId, noteDrafts[requestId] ?? "");
    setSavingId(null);
    if (result.success) {
      toast.success("Notes saved");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const toggleExpand = (r: MembershipRequest) => {
    if (expandedId === r.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(r.id);
    setNoteDrafts((prev) => ({ ...prev, [r.id]: prev[r.id] ?? r.admin_notes ?? "" }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted" />
          <Input
            placeholder="Search name, phone, or email"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => updateParams({ status: v })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={budget || "all"}
          onValueChange={(v) => updateParams({ budget: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All budgets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All budgets</SelectItem>
            {BUDGET_RANGES.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={location || "all"}
          onValueChange={(v) => updateParams({ location: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {HYDERABAD_LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="inline-flex rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => updateParams({ purpose: "" })}
            className={`px-3 py-1.5 text-xs ${purpose === "" ? "bg-gold/20 text-gold" : "text-cream-muted hover:text-foreground"}`}
          >
            All
          </button>
          {BUYING_PURPOSES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => updateParams({ purpose: p })}
              className={`px-3 py-1.5 text-xs border-l border-border ${purpose === p ? "bg-gold/20 text-gold" : "text-cream-muted hover:text-foreground"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="w-8"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => {
              const isExpanded = expandedId === r.id;
              return (
                <Fragment key={r.id}>
                  <TableRow className="border-border">
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => toggleExpand(r)}
                        className="text-cream-muted hover:text-gold"
                        aria-label={isExpanded ? "Collapse notes" : "Open notes"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{r.full_name}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.budget_range ?? "—"}</TableCell>
                    <TableCell>{r.buying_purpose ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.status === "approved"
                            ? "default"
                            : r.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end items-center">
                        {r.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="gold-gradient-bg text-accent-foreground"
                              onClick={() => handleApprove(r.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(r.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {(() => {
                          const p = profileByPhone(r.phone);
                          if (!p) return null;
                          return (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setQuickNoteUserId(quickNoteUserId === p.id ? null : p.id);
                                setQuickNoteText("");
                              }}
                            >
                              Add note
                            </Button>
                          );
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="border-border bg-surface-elevated/30">
                      <TableCell colSpan={8} className="py-4">
                        <div className="space-y-2 max-w-3xl">
                          <label className="text-[10px] text-cream-muted uppercase tracking-wider block">
                            Admin Notes
                          </label>
                          <Textarea
                            rows={3}
                            value={noteDrafts[r.id] ?? ""}
                            onChange={(e) =>
                              setNoteDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))
                            }
                            placeholder="Internal notes about this applicant (visible to admins only)."
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleSaveNotes(r.id)}
                              disabled={savingId === r.id}
                              className="gold-gradient-bg text-accent-foreground"
                            >
                              {savingId === r.id ? "Saving..." : "Save Notes"}
                            </Button>
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
      </div>

      {filtered.length === 0 && (
        <p className="text-cream-muted text-center py-8">
          No membership requests match the filter.
        </p>
      )}

      {quickNoteUserId && (
        <div className="glass-card p-4 rounded-xl flex gap-2">
          <Input
            value={quickNoteText}
            onChange={(e) => setQuickNoteText(e.target.value)}
            placeholder="Quick note (added to user history)..."
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={async () => {
              if (!quickNoteText.trim()) return;
              const result = await addAdminNote(quickNoteUserId, quickNoteText.trim());
              if (result.success) {
                toast.success("Note added");
                setQuickNoteUserId(null);
                setQuickNoteText("");
                router.refresh();
              } else {
                toast.error(result.error);
              }
            }}
          >
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setQuickNoteUserId(null)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
