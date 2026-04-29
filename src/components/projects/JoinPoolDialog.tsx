"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JoinPoolDialogProps {
  trigger: React.ReactNode;
  isComingSoon?: boolean;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}

export function JoinPoolDialog({ trigger, isComingSoon, onConfirm, loading }: JoinPoolDialogProps) {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleConfirm = async () => {
    if (!accepted) return;
    await onConfirm();
    setOpen(false);
    setAccepted(false);
  };

  const ctaLabel = isComingSoon ? "Confirm & Express Interest" : "Confirm & Join Pool";

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setAccepted(false); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-surface-elevated border-border text-foreground max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gold">
            {isComingSoon ? "Express Interest" : "Join Capital Pool"}
          </DialogTitle>
          <DialogDescription className="text-cream-muted">
            By joining, you commit to participate in good faith in this structured Capital Pool.
            Pool details, builder negotiations, and discount tiers are confidential to the member network.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <ul className="list-disc list-inside text-cream-muted space-y-1">
            <li>Crestline Capital is a structured bulk-buying network — not a financial advisor.</li>
            <li>Final discount depends on pool size at deal closure.</li>
            <li>Confidentiality: do not share pool terms outside the member network.</li>
          </ul>
          <Link
            href="/membership-agreement"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline text-xs"
          >
            Read the full Terms &amp; Confidentiality Agreement →
          </Link>
          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <Checkbox
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
              aria-label="Accept the agreement"
              className="mt-0.5"
            />
            <span className="text-sm text-foreground">
              I have read and agree to the Terms &amp; Confidentiality Agreement.
            </span>
          </label>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!accepted || loading}
            onClick={handleConfirm}
            className="gold-gradient-bg text-accent-foreground"
          >
            {loading ? "Processing..." : ctaLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
