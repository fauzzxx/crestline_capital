"use client";

import { useRouter } from "next/navigation";
import { removePoolMember, updatePoolMemberStatus } from "@/app/actions/admin";
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

interface PoolMemberRow {
  id: string;
  commitment_status: string;
  joined_at: string;
  project: { project_name: string; status: string } | null;
  user_id: string;
}

interface PoolsTableProps {
  poolMembers: PoolMemberRow[];
  profileMap: Map<string, { full_name: string | null; phone: string | null }>;
}

export function PoolsTable({ poolMembers, profileMap }: PoolsTableProps) {
  const router = useRouter();
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

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
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
            return (
              <TableRow key={pm.id} className="border-border">
                <TableCell>
                  <div>
                    <p className="font-medium">{profile?.full_name ?? "—"}</p>
                    <p className="text-sm text-cream-muted">{profile?.phone ?? pm.user_id.slice(0, 8)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {pm.project ? (
                    <>
                      <p className="font-medium">{pm.project.project_name}</p>
                      <Badge variant="secondary" className="text-xs capitalize">{pm.project.status}</Badge>
                    </>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  <Select
                    value={pm.commitment_status}
                    onValueChange={(v) => handleStatusChange(pm.id, v as "interested" | "confirmed" | "dropped")}
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
