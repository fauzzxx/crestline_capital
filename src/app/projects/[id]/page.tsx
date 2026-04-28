import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProjectDetailClient } from "./ProjectDetailClient";
import { trackEvent } from "@/lib/analytics";
import type { Project } from "@/types/database";

async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as Project;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project | Crestline Capital" };
  const description =
    project.description?.slice(0, 160) || `Investment opportunity in ${project.location}.`;
  return {
    title: `${project.project_name} | Crestline Capital`,
    description,
    openGraph: {
      title: project.project_name,
      description,
      images: project.thumbnail_url ? [project.thumbnail_url] : [],
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const project = await getProject(id);
  if (!project) notFound();

  const { data: media } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", id)
    .order("created_at");

  const { data: { user } } = await supabase.auth.getUser();
  trackEvent(user?.id ?? null, "project_viewed", { project_id: id }).catch(() => {});

  let isMember = false;
  if (user) {
    const { data: pm } = await supabase
      .from("pool_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("project_id", id)
      .single();
    isMember = !!pm;
  }

  return (
    <div className="section-container">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-cream-muted hover:text-gold transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
      <ProjectDetailClient
        project={project}
        media={(media ?? []) as import("@/types/database").ProjectMedia[]}
        isMember={isMember}
      />
    </div>
  );
}
