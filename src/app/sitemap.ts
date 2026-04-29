import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://crestlinecapital.in";
  const staticPages = [
    "",
    "/membership",
    "/contact",
    "/terms",
    "/privacy",
    "/disclaimer",
    "/membership-agreement",
    "/login",
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));

  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const { data: projects } = await supabase
      .from("projects")
      .select("id, updated_at")
      .in("status", ["open", "unlocked", "coming_soon"]);
    projectPages = (projects ?? []).map((p) => ({
      url: `${base}/projects/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    }));
  } catch {
    // If supabase is unavailable at build time, ship static pages only.
  }
  return [...staticPages, ...projectPages];
}
