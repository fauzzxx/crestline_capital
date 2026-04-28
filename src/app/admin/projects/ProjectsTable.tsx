"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/app/actions/admin";
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
import type { Project } from "@/types/database";

interface ProjectsTableProps {
  projects: Project[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const router = useRouter();
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete project "${name}"? This will remove all pool members and media.`)) return;
    const result = await deleteProject(id);
    if (result.success) {
      toast.success("Project deleted");
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
            <TableHead>Project</TableHead>
            <TableHead>Builder</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Pool</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((p) => (
            <TableRow key={p.id} className="border-border">
              <TableCell className="font-medium">{p.project_name}</TableCell>
              <TableCell>{p.builder_name}</TableCell>
              <TableCell>{p.location}</TableCell>
              <TableCell>₹{Number(p.base_price).toLocaleString()}</TableCell>
              <TableCell>{p.discount_percentage}%</TableCell>
              <TableCell>{p.current_members_joined} / {p.minimum_members_required}</TableCell>
              <TableCell>
                <Badge variant={p.status === "unlocked" ? "default" : "secondary"} className="capitalize">
                  {p.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/projects/${p.id}`}>
                  <Button size="sm" variant="ghost">Edit</Button>
                </Link>
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-2"
                  onClick={() => handleDelete(p.id, p.project_name)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {projects.length === 0 && (
        <p className="text-cream-muted text-center py-8">No projects yet.</p>
      )}
    </div>
  );
}
