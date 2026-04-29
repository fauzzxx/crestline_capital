"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Building2, Users, Timer, ChevronRight, CheckCircle2, Map, FileDown, PlayCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { MediaGallery } from "@/components/projects/MediaGallery";
import { joinPool } from "@/app/actions/pool";
import { toast } from "sonner";
import type { Project, ProjectMedia, DiscountTier, UnitConfig, Builder } from "@/types/database";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { getMapEmbedUrl } from "@/lib/maps";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { JoinPoolDialog } from "@/components/projects/JoinPoolDialog";

interface ProjectDetailClientProps {
  project: Project;
  media: ProjectMedia[];
  isMember: boolean;
  builder?: Builder | null;
}

function trustBadgeClasses(score: number | null | undefined) {
  if (typeof score !== "number") return "bg-surface-elevated border-border text-cream-muted";
  if (score >= 80) return "bg-green-500/15 border-green-500/40 text-green-400";
  if (score >= 60) return "bg-gold/15 border-gold/40 text-gold";
  return "bg-surface-elevated border-border text-cream-muted";
}

export function ProjectDetailClient({ project, media, isMember, builder }: ProjectDetailClientProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const isComingSoon = project.status === "coming_soon";
  const unlocked = project.status === "unlocked";

  // Calculate current active tier
  const activeTier = [...(project.discount_tiers || [])]
    .sort((a, b) => b.min_units - a.min_units)
    .find(t => project.current_members_joined >= t.min_units);

  const currentDiscount = activeTier ? activeTier.discount_percentage : project.discount_percentage;
  const discountedPrice = Number(project.base_price) * (1 - Number(currentDiscount) / 100);

  const handleJoin = async () => {
    setJoining(true);
    const result = await joinPool(project.id, { agreementAccepted: true });
    setJoining(false);
    if (result.success) {
      toast.success(isComingSoon ? "Your interest has been recorded." : "You've joined this capital pool.");
      router.refresh();
    } else {
      toast.error(result.error || "Could not complete request");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {project.project_name}
            </h1>
            {unlocked && (
              <Badge className="gold-gradient-bg text-accent-foreground border-0 px-3 py-1">
                Discount Unlocked
              </Badge>
            )}
            <Badge variant="outline" className={`capitalize border-gold/30 text-gold bg-gold/5 ${isComingSoon ? 'text-blue-400' : ''}`}>
              {project.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-cream-muted">
            <div className="flex items-center gap-2">
              {project.builder_logo ? (
                <img src={project.builder_logo} alt="" className="h-6 w-auto object-contain" />
              ) : (
                <Building2 className="w-4 h-4 text-gold/60" />
              )}
              {project.builder_name}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold/60" />
              {project.location}
            </div>
          </div>
        </div>
        {!isMember && project.status !== "closed" && (
          <JoinPoolDialog
            isComingSoon={isComingSoon}
            loading={joining}
            onConfirm={handleJoin}
            trigger={
              <Button
                disabled={joining}
                size="lg"
                className="gold-gradient-bg text-accent-foreground hover:scale-105 transition-transform px-8"
              >
                {joining ? "Processing..." : isComingSoon ? "Express Interest" : "Join Capital Pool"}
              </Button>
            }
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* Gallery */}
          {media.length > 0 && (
            <section>
              <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
                Project Gallery
              </h2>
              <MediaGallery items={media} />
            </section>
          )}

          {/* Project Video */}
          {project.project_video && (
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-gold" /> Project Video
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden bg-surface-elevated">
                {(() => {
                  const embed = getYouTubeEmbedUrl(project.project_video!);
                  if (embed) {
                    return (
                      <iframe
                        title="Project video"
                        width="100%"
                        height="100%"
                        src={embed}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                        loading="lazy"
                        className="w-full h-full border-0"
                      />
                    );
                  }
                  return <video src={project.project_video!} controls className="w-full h-full" />;
                })()}
              </div>
            </section>
          )}

          {/* Brochure */}
          {project.brochure_pdf && (
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
                <FileDown className="w-5 h-5 text-gold" /> Brochure
              </h2>
              <a
                href={project.brochure_pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gold-border text-gold font-medium hover:gold-glow transition-all"
              >
                <FileDown className="w-4 h-4" /> Download Brochure (PDF)
              </a>
            </section>
          )}

          {/* Additional Information */}
          {project.additional_info && (
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-gold" /> Additional Information
              </h2>
              <p className="text-cream-muted leading-relaxed whitespace-pre-wrap">
                {project.additional_info}
              </p>
            </section>
          )}

          {/* Unit Configurations */}
          {project.unit_configs && project.unit_configs.length > 0 && (
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-heading font-semibold mb-6">Unit Configurations</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-xs text-cream-muted uppercase">
                      <th className="py-3 px-2">Type</th>
                      <th className="py-3 px-2">Size</th>
                      <th className="py-3 px-2 text-right">Price Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {project.unit_configs.map((config, i) => (
                      <tr key={`${config.type}-${config.size}-${i}`} className="text-sm">
                        <td className="py-4 px-2 font-medium">{config.type}</td>
                        <td className="py-4 px-2 text-cream-muted">{config.size}</td>
                        <td className="py-4 px-2 text-right font-semibold text-gold">{config.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Description */}
          {project.description && (
            <section className="glass-card p-6 rounded-2xl">
              <h2 className="text-lg font-heading font-semibold mb-4">Project Overview</h2>
              <p className="text-cream-muted leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </section>
          )}

          {/* About the Builder */}
          {builder && (
            <section className="glass-card p-6 rounded-2xl">
              <Accordion type="single" collapsible defaultValue="builder">
                <AccordionItem value="builder" className="border-0">
                  <AccordionTrigger className="text-lg font-heading font-semibold py-2 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-gold" /> About the Builder
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 space-y-5">
                      <div className="flex flex-wrap items-center gap-4">
                        {project.builder_logo && (
                          <img src={project.builder_logo} alt="" className="h-10 w-auto object-contain" />
                        )}
                        <div>
                          <h3 className="font-heading font-semibold text-foreground text-lg">
                            {builder.name}
                          </h3>
                          {builder.established_year && (
                            <p className="text-xs text-cream-muted mt-1">
                              Established {builder.established_year}
                            </p>
                          )}
                        </div>
                        {typeof builder.trust_score === "number" && (
                          <div
                            className={`ml-auto inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-medium ${trustBadgeClasses(builder.trust_score)}`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Trust {builder.trust_score}/100
                          </div>
                        )}
                      </div>
                      {builder.bio && (
                        <p className="text-cream-muted leading-relaxed whitespace-pre-wrap text-sm">
                          {builder.bio}
                        </p>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        {typeof builder.past_projects_count === "number" && (
                          <div className="bg-surface-elevated/50 p-3 rounded-lg border border-border">
                            <p className="text-[10px] text-cream-muted uppercase mb-1">Past projects</p>
                            <p className="font-semibold">{builder.past_projects_count}</p>
                          </div>
                        )}
                        {typeof builder.total_units_delivered === "number" && (
                          <div className="bg-surface-elevated/50 p-3 rounded-lg border border-border">
                            <p className="text-[10px] text-cream-muted uppercase mb-1">Units delivered</p>
                            <p className="font-semibold">{builder.total_units_delivered.toLocaleString()}</p>
                          </div>
                        )}
                        {builder.website_url && (
                          <a
                            href={builder.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-surface-elevated/50 p-3 rounded-lg border border-border hover:border-gold/40 transition-colors flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4 text-gold" />
                            <span className="truncate">Visit website</span>
                          </a>
                        )}
                      </div>
                      {builder.rera_numbers && (
                        <div className="text-xs text-cream-muted">
                          <span className="uppercase tracking-wider mr-2">RERA:</span>
                          {builder.rera_numbers}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          )}

          {/* Location Map Section */}
          <section className="glass-card p-6 rounded-2xl">
            <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Map className="w-5 h-5 text-gold" /> Location Map
            </h2>
            <div className="flex items-center gap-2 text-cream-muted mb-4">
              <MapPin className="w-4 h-4 text-gold/60" />
              <span>{project.location}</span>
            </div>
            <div className="aspect-video rounded-xl overflow-hidden bg-surface-elevated">
              <iframe
                title="Location map"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                src={getMapEmbedUrl(project.google_map_url ?? '', project.location)}
              />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <section className="glass-card p-6 rounded-2xl border-gold/20 shadow-xl shadow-gold/5 lg:sticky lg:top-24">
            <h2 className="text-gold font-semibold text-sm uppercase mb-6 tracking-widest">Active Opportunity</h2>

            <div className="space-y-8">
              <div>
                <p className="text-xs text-cream-muted uppercase mb-1">Indicative Base Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">₹{Number(project.base_price).toLocaleString()}</span>
                  <span className="text-sm text-cream-muted">onwards</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-cream-muted uppercase mb-3">Tier Discount Structure</p>
                <div className="space-y-3">
                  {((project.discount_tiers?.length ?? 0) > 0 ? project.discount_tiers ?? [] : [{ min_units: project.minimum_members_required, discount_percentage: project.discount_percentage }])
                    .sort((a, b) => a.min_units - b.min_units)
                    .map((tier, i) => {
                      const isReached = project.current_members_joined >= tier.min_units;
                      return (
                        <div key={`tier-${tier.min_units}-${tier.discount_percentage}-${i}`} className={`flex items-center justify-between p-3 rounded-lg border ${isReached ? 'bg-gold/10 border-gold/30 text-gold' : 'bg-surface-elevated/50 border-border opacity-60'}`}>
                          <div className="flex items-center gap-3">
                            {isReached ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-current" />}
                            <span className="text-sm font-medium">Pool: {tier.min_units}+ Units</span>
                          </div>
                          <span className="font-bold underline">-{tier.discount_percentage}%</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cream-muted">Pool Progress</span>
                  <span className="font-semibold">{Math.round((project.current_members_joined / project.minimum_members_required) * 100)}%</span>
                </div>
                <ProgressBar
                  current={project.current_members_joined}
                  required={project.minimum_members_required}
                  className="h-2"
                />
                <div className="flex items-center gap-2 text-xs text-gold/80">
                  <Users className="w-3.5 h-3.5" />
                  <span>{project.current_members_joined} members participating</span>
                </div>
              </div>

              {project.deal_deadline && (
                <div className="pt-6 border-t border-border">
                  <p className="text-xs text-cream-muted uppercase mb-3">Deal Expiry</p>
                  <CountdownTimer deadline={project.deal_deadline} />
                </div>
              )}

              {!isMember && (
                <>
                  <p className="text-[10px] text-cream-muted mb-3 text-center">
                    By joining you agree to our Terms &amp; Confidentiality. Deal details are for member network only.
                  </p>
                  <JoinPoolDialog
                    isComingSoon={isComingSoon}
                    loading={joining}
                    onConfirm={handleJoin}
                    trigger={
                      <Button disabled={joining} className="w-full gold-gradient-bg text-accent-foreground py-6">
                        {joining ? "Processing..." : isComingSoon ? "Express Interest" : "Join Capital Pool"}
                      </Button>
                    }
                  />
                </>
              )}
            </div>

            <p className="text-[10px] text-center text-cream-muted mt-6 uppercase tracking-tight">
              * Final structured discount depends on pool size at deal closure.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
