import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home as HomeIcon, MessagesSquare } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        <p className="text-[10px] tracking-[0.4em] text-gold mb-3">CRESTLINE CAPITAL</p>
        <h1 className="text-7xl font-heading font-bold gold-gradient-text mb-3">404</h1>
        <p className="text-xl text-foreground mb-2">This page isn&apos;t in the network</p>
        <p className="text-sm text-cream-muted mb-8">
          The opportunity you&apos;re looking for may have moved or closed. Try one of these:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="gold-gradient-bg text-accent-foreground">
            <Link href="/">
              <HomeIcon className="w-4 h-4 mr-2" /> Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <Compass className="w-4 h-4 mr-2" /> Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/contact">
              <MessagesSquare className="w-4 h-4 mr-2" /> Contact
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
