"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[project error]", error);
  }, [error]);

  return (
    <div className="section-container pt-24 pb-20 text-center">
      <h1 className="text-2xl font-heading font-bold mb-3">This opportunity couldn&apos;t load</h1>
      <p className="text-cream-muted max-w-md mx-auto mb-6">
        It may have been closed or moved. Try refreshing, or browse other active capital pools.
      </p>
      <div className="flex justify-center gap-3">
        <Button onClick={reset} className="gold-gradient-bg text-accent-foreground">
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
