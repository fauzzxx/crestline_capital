"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteContactMessage } from "@/app/actions/admin";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface ContactMessagesClientProps {
  messages: ContactMessage[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export function ContactMessagesClient({
  messages,
  currentPage,
  totalPages,
  total,
}: ContactMessagesClientProps) {
  const router = useRouter();
  const [viewing, setViewing] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    setDeleting(id);
    const result = await deleteContactMessage(id);
    setDeleting(null);
    if (result.success) {
      toast.success("Message deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-cream-muted py-12">
                  No contact messages yet.
                </TableCell>
              </TableRow>
            ) : (
              messages.map((m) => (
                <TableRow key={m.id} className="border-border">
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="text-cream-muted">{m.email}</TableCell>
                  <TableCell className="text-cream-muted text-sm">
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gold hover:text-gold mr-2"
                      onClick={() => setViewing(m)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      disabled={deleting === m.id}
                      onClick={() => handleDelete(m.id)}
                    >
                      {deleting === m.id ? "Deleting..." : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-cream-muted">
            Page {currentPage} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={`/admin/contact-messages?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={`/admin/contact-messages?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="bg-surface-elevated border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gold">Contact Message</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <p><strong>Name:</strong> {viewing.name}</p>
              <p><strong>Email:</strong> {viewing.email}</p>
              <p><strong>Date:</strong> {new Date(viewing.created_at).toLocaleString()}</p>
              <div>
                <strong>Message:</strong>
                <p className="mt-2 text-cream-muted whitespace-pre-wrap">{viewing.message}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setViewing(null);
                  handleDelete(viewing.id);
                }}
                disabled={deleting === viewing.id}
              >
                Delete
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
