import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crestlinecapital.in";

const ogTitle = "Crestline Capital | Structured Bulk Real Estate Buying Network";
const ogDescription =
  "Join Crestline Capital's private buyer network and unlock builder-level pricing through structured capital pools.";

export const metadata: Metadata = {
  title: ogTitle,
  description: ogDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    url: siteUrl,
    siteName: "Crestline Capital",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground font-body antialiased">
        <TooltipProvider>
          {children}
          <Toaster />
          <Sonner />
        </TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
