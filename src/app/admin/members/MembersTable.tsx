"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveMembershipRequest, rejectMembershipRequest, addAdminNote } from "@/app/actions/admin";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const BUDGET_OPTIONS = ["₹50L - ₹1Cr", "₹1Cr - ₹2Cr", "₹2Cr - ₹3Cr", "₹3Cr+"];
const LOCATION_OPTIONS = ["Gachibowli", "Kokapet", "Narsingi", "Financial District", "Tellapur", "Kollur", "Other"];
const PURPOSE_OPTIONS = ["Investment", "End Use", "Both"];

interface MembersTableProps {
  requests: MembershipRequest[];
  profiles: Profile[];
  searchParams?: { status?: string; budget?: string; location?: string; purpose?: string };
}

export function MembersTable({ requests, profiles, searchParams = {} }: MembersTableProps) {
  const router = useRouter();
  const [noteUserId, setNoteUserId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const status = searchParams.status ?? "all";
  const budget = searchParams.budget ?? "";
  const location = searchParams.location ?? "";
  const purpose = searchParams.purpose ?? "";

  const updateParams = (updates: { status?: string; budget?: string; location?: string; purpose?: string }) => {
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

  const filtered = requests;

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

  const handleAddNote = async (userId: string) => {
    if (!noteText.trim()) return;
    const result = await addAdminNote(userId, noteText.trim());
    if (result.success) {
      toast.success("Note added");
      setNoteUserId(null);
      setNoteText("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const getProfileByPhone = (phone: string) =>
    profiles.find((p) => p.phone === phone || (p.phone && phone.includes(p.phone)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <span className="text-sm text-cream-muted">Status:</span>
        <Select value={status} onValueChange={(v) => updateParams({ status: v })}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-cream-muted ml-2">Budget:</span>
        <Select
          value={budget || "all"}
          onValueChange={(v) => updateParams({ budget: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All budgets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {BUDGET_OPTIONS.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-cream-muted">Location:</span>
        <Select
          value={location || "all"}
          onValueChange={(v) => updateParams({ location: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {LOCATION_OPTIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-cream-muted">Purpose:</span>
        <Select
          value={purpose || "all"}
          onValueChange={(v) => updateParams({ purpose: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {PURPOSE_OPTIONS.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
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
              const profile = getProfileByPhone(r.phone);
              return (
                <TableRow key={r.id} className="border-border">
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
                    {r.status === "pending" && (
                      <div className="flex gap-2 justify-end">
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
                      </div>
                    )}
                    {profile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setNoteUserId(noteUserId === profile.id ? null : profile.id)}
                      >
                        Add note
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <p className="text-cream-muted text-center py-8">No membership requests match the filter.</p>
      )}

      {noteUserId && (
        <div className="glass-card p-4 rounded-xl flex gap-2">
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Admin note..."
            className="flex-1 px-3 py-2 rounded-lg bg-surface-elevated border border-border text-foreground"
          />
          <Button size="sm" onClick={() => handleAddNote(noteUserId)}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setNoteUserId(null)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
