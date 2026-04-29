"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard error]", error);
  }, [error]);

  return (
    <div className="section-container pt-24 pb-20 text-center">
      <h1 className="text-2xl font-heading font-bold mb-3">Something went wrong</h1>
      <p className="text-cream-muted max-w-md mx-auto mb-6">
        We couldn&apos;t load your dashboard. Please try again, or return home if the issue persists.
      </p>
      <div className="flex justify-center gap-3">
        <Button onClick={reset} className="gold-gradient-bg text-accent-foreground">
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
