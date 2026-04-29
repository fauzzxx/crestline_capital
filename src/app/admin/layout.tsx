import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="section-container flex items-center justify-between h-16">
          <Link href="/admin" className="font-heading font-semibold text-foreground">
            Admin Panel
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin" className="text-cream-muted hover:text-gold">Dashboard</Link>
            <Link href="/admin/members" className="text-cream-muted hover:text-gold">Members</Link>
            <Link href="/admin/builders" className="text-cream-muted hover:text-gold">Builders</Link>
            <Link href="/admin/projects" className="text-cream-muted hover:text-gold">Projects</Link>
            <Link href="/admin/pools" className="text-cream-muted hover:text-gold">Pools</Link>
            <Link href="/admin/finance" className="text-cream-muted hover:text-gold">Finance</Link>
            <Link href="/admin/contact-messages" className="text-cream-muted hover:text-gold">Contact</Link>
            <Link href="/dashboard" className="text-cream-muted hover:text-gold">Member View</Link>
          </nav>
        </div>
      </header>
      <main className="pt-24 pb-16">{children}</main>
    </div>
  );
}
