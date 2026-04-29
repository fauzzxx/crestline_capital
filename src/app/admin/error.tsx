"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error]", error);
  }, [error]);

  return (
    <div className="section-container pt-24 pb-20 text-center">
      <h1 className="text-2xl font-heading font-bold mb-3">Admin error</h1>
      <p className="text-cream-muted max-w-md mx-auto mb-6">
        Something failed while loading this admin view. Try again or report this if it persists.
      </p>
      <div className="flex justify-center gap-3">
        <Button onClick={reset} className="gold-gradient-bg text-accent-foreground">
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">Admin home</Link>
        </Button>
      </div>
    </div>
  );
}
