"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Building2, Users, Timer } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./ProgressBar";
import { CountdownTimer } from "./CountdownTimer";
import { joinPool } from "@/app/actions/pool";
import { useState } from "react";
import { toast } from "sonner";
import type { Project } from "@/types/database";

const PLACEHOLDER_IMAGE = "/placeholder.svg";

interface ProjectCardProps {
  project: Project;
  isMember?: boolean;
  isUnlocked?: boolean;
}

export function ProjectCard({ project, isMember = false, isUnlocked }: ProjectCardProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const unlocked = isUnlocked ?? project.status === "unlocked";
  const thumbnailUrl = project.thumbnail_url?.trim() || null;
  const discountedPrice = project.base_price * (1 - Number(project.discount_percentage) / 100);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setJoining(true);
    const result = await joinPool(project.id);
    setJoining(false);
    if (result.success) {
      toast.success("You've joined this capital pool.");
      router.refresh();
    } else {
      toast.error(result.error || "Could not join pool");
    }
  };

  return (
    <Card className="glass-card border-border overflow-hidden rounded-xl shadow-lg hover:shadow-gold/10 hover:border-gold/30 transition-all duration-300">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="relative w-full aspect-[16/10] bg-surface-elevated overflow-hidden">
          <Image
            src={thumbnailUrl || PLACEHOLDER_IMAGE}
            alt={project.project_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            unoptimized={!!thumbnailUrl && thumbnailUrl.startsWith("http")}
            onError={(e) => {
              const t = e.target as HTMLImageElement;
              if (t && t.src !== PLACEHOLDER_IMAGE) t.src = PLACEHOLDER_IMAGE;
            }}
          />
        </div>
      </Link>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/projects/${project.id}`} className="hover:underline focus:outline-none">
              <h3 className="font-heading text-lg font-semibold text-foreground truncate">
                {project.project_name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1 text-sm text-cream-muted">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{project.builder_name}</span>
            </div>
          </div>
          {unlocked && (
            <Badge className="gold-gradient-bg text-accent-foreground border-0 flex-shrink-0">Unlocked</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-cream-muted">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{project.location}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="text-cream-muted">Base: ₹{Number(project.base_price).toLocaleString()}</span>
          <span className="text-gold font-medium">
            {project.discount_percentage}% off → ₹{discountedPrice.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-cream-muted">
          <Users className="w-4 h-4" />
          {project.current_members_joined} / {project.minimum_members_required} members
        </div>
        <ProgressBar current={project.current_members_joined} required={project.minimum_members_required} />
        {project.deal_deadline && (
          <div className="flex items-center gap-2 text-sm">
            <Timer className="w-4 h-4 text-gold flex-shrink-0" />
            <CountdownTimer deadline={project.deal_deadline} />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        {isMember ? (
          <Button asChild variant="secondary" className="w-full" size="sm">
            <Link href={`/projects/${project.id}`}>View Details</Link>
          </Button>
        ) : (
          <Button
            onClick={handleJoin}
            disabled={joining || project.status === "closed"}
            className="w-full gold-gradient-bg text-accent-foreground hover:opacity-90"
            size="sm"
          >
            {joining ? "Joining..." : "Join Capital Pool"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
