"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject, uploadProjectThumbnail } from "@/app/actions/admin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import type { Project, Builder, DiscountTier, UnitConfig, ProjectStatus } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

interface ProjectFormProps {
  project?: Project;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [builders, setBuilders] = useState<Builder[]>([]);

  const [form, setForm] = useState({
    project_name: project?.project_name ?? "",
    builder_name: project?.builder_name ?? "",
    builder_id: project?.builder_id ?? "",
    location: project?.location ?? "",
    base_price: project?.base_price?.toString() ?? "",
    discount_percentage: project?.discount_percentage?.toString() ?? "0",
    commission_percentage: project?.commission_percentage?.toString() ?? "0",
    google_map_url: project?.google_map_url ?? "",
    builder_logo: project?.builder_logo ?? "",
    brochure_pdf: project?.brochure_pdf ?? "",
    project_video: project?.project_video ?? "",
    thumbnail_url: project?.thumbnail_url ?? "",
    minimum_members_required: project?.minimum_members_required?.toString() ?? "10",
    deal_deadline: project?.deal_deadline
      ? new Date(project.deal_deadline).toISOString().slice(0, 16)
      : "",
    description: project?.description ?? "",
    additional_info: project?.additional_info ?? "",
    status: (project?.status ?? "open") as ProjectStatus,
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(project?.thumbnail_url ?? null);

  const [tiers, setTiers] = useState<DiscountTier[]>(project?.discount_tiers ?? []);
  const [unitConfigs, setUnitConfigs] = useState<UnitConfig[]>(project?.unit_configs ?? []);

  useEffect(() => {
    const fetchBuilders = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('builders').select('*').order('name');
      if (data) setBuilders(data);
    };
    fetchBuilders();
  }, []);

  const addTier = () => setTiers([...tiers, { min_units: 0, discount_percentage: 0 }]);
  const removeTier = (index: number) => setTiers(tiers.filter((_, i) => i !== index));
  const updateTier = (index: number, field: keyof DiscountTier, value: number) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  const addConfig = () => setUnitConfigs([...unitConfigs, { type: "", size: "", price: "" }]);
  const removeConfig = (index: number) => setUnitConfigs(unitConfigs.filter((_, i) => i !== index));
  const updateConfig = (index: number, field: keyof UnitConfig, value: string) => {
    const newConfigs = [...unitConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setUnitConfigs(newConfigs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let thumbnailUrl: string | null = form.thumbnail_url?.trim() || null;
    if (thumbnailFile) {
      const formData = new FormData();
      formData.set("file", thumbnailFile);
      const uploadResult = await uploadProjectThumbnail(formData);
      if (!uploadResult.success) {
        toast.error(uploadResult.error);
        setLoading(false);
        return;
      }
      thumbnailUrl = uploadResult.url;
    }

    const selectedBuilder = builders.find(b => b.id === form.builder_id);
    const deadline = form.deal_deadline ? new Date(form.deal_deadline) : null;
    const deal_deadline =
      deadline && Number.isFinite(deadline.getTime()) ? deadline.toISOString() : null;

    const payload = {
      project_name: form.project_name.trim(),
      builder_name: selectedBuilder?.name || form.builder_name.trim(),
      location: form.location.trim(),
      base_price: parseFloat(form.base_price) || 0,
      discount_percentage: parseFloat(form.discount_percentage) || 0,
      commission_percentage: parseFloat(form.commission_percentage) || 0,
      google_map_url: form.google_map_url.trim() || null,
      builder_logo: form.builder_logo.trim() || null,
      brochure_pdf: form.brochure_pdf.trim() || null,
      project_video: form.project_video.trim() || null,
      thumbnail_url: thumbnailUrl,
      minimum_members_required: parseInt(form.minimum_members_required, 10) || 1,
      deal_deadline,
      description: form.description.trim() || null,
      additional_info: form.additional_info.trim() || null,
      status: form.status,
      discount_tiers: tiers,
      unit_configs: unitConfigs,
      ...(form.builder_id ? { builder_id: form.builder_id } : {}),
    };

    if (project) {
      const result = await updateProject(project.id, payload);
      if (result.success) {
        toast.success("Project updated");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await createProject(payload);
      if (result.success) {
        toast.success("Project created");
        router.push("/admin/projects");
      } else {
        toast.error(result.error);
      }
    }
    setLoading(false);
  };

  const inputClass =
    "w-full px-4 py-2 rounded-lg bg-surface-elevated border border-border text-foreground focus:outline-none focus:border-gold/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gold uppercase tracking-wider">Basic Info</h3>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Project Name</label>
            <Input
              required
              value={form.project_name}
              onChange={(e) => setForm({ ...form, project_name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Builder</label>
            <select
              value={form.builder_id}
              onChange={(e) => setForm({ ...form, builder_id: e.target.value })}
              className={inputClass}
            >
              <option value="">Select a Builder (Optional)</option>
              {builders.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          {!form.builder_id && (
            <div>
              <label className="text-xs text-cream-muted block mb-1">Builder Name (Manual)</label>
              <Input
                value={form.builder_name}
                onChange={(e) => setForm({ ...form, builder_name: e.target.value })}
                className={inputClass}
              />
            </div>
          )}
          <div>
            <label className="text-xs text-cream-muted block mb-1">Location</label>
            <Input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Google Maps URL</label>
            <Input
              value={form.google_map_url}
              onChange={(e) => setForm({ ...form, google_map_url: e.target.value })}
              className={inputClass}
              placeholder="https://goo.gl/maps/..."
            />
            <p className="text-xs text-cream-muted mt-1">
              Paste any Google Maps link (goo.gl, maps.app.goo.gl, full URL) or full embed iframe HTML. Leave blank to use the location text above.
            </p>
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Builder Logo URL</label>
            <Input
              value={form.builder_logo}
              onChange={(e) => setForm({ ...form, builder_logo: e.target.value })}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Project Thumbnail</label>
            <p className="text-[10px] text-cream-muted mb-1.5">Single image for dashboard cards (JPEG, PNG, WebP, GIF)</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={inputClass}
              onChange={(e) => {
                const f = e.target.files?.[0];
                setThumbnailFile(f ?? null);
                setThumbnailPreview(f ? URL.createObjectURL(f) : (form.thumbnail_url || null));
              }}
            />
            {thumbnailPreview && (
              <div className="mt-2 relative w-32 h-24 rounded-lg overflow-hidden border border-border bg-surface-elevated">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  width={128}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized={thumbnailPreview.startsWith("blob:")}
                />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Brochure PDF URL</label>
            <Input
              value={form.brochure_pdf}
              onChange={(e) => setForm({ ...form, brochure_pdf: e.target.value })}
              className={inputClass}
              placeholder="https://... or storage path"
            />
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Project Video URL</label>
            <Input
              value={form.project_video}
              onChange={(e) => setForm({ ...form, project_video: e.target.value })}
              className={inputClass}
              placeholder="YouTube embed or direct video URL"
            />
          </div>
          <div>
            <label className="text-xs text-cream-muted uppercase tracking-wider mb-2 block">
              Additional Information
            </label>
            <textarea
              value={form.additional_info}
              onChange={(e) => setForm({ ...form, additional_info: e.target.value })}
              placeholder="Any extra details — amenities, RERA number, payment terms, possession date, etc. Free text."
              rows={4}
              className={`${inputClass} resize-y`}
            />
            <p className="text-xs text-cream-muted mt-1">
              Shown on the project page just below the brochure. Optional.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gold uppercase tracking-wider">Pricing & Deal</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-cream-muted block mb-1">Base Price (₹)</label>
              <Input
                type="number"
                min="0"
                required
                value={form.base_price}
                onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-cream-muted block mb-1">Min Members</label>
              <Input
                type="number"
                min="0"
                value={form.minimum_members_required}
                onChange={(e) => setForm({ ...form, minimum_members_required: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-cream-muted block mb-1">Default Discount %</label>
              <Input
                type="number"
                min="0"
                value={form.discount_percentage}
                onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-cream-muted block mb-1">Commission %</label>
              <Input
                type="number"
                min="0"
                value={form.commission_percentage}
                onChange={(e) => setForm({ ...form, commission_percentage: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
              className={inputClass}
            >
              <option value="open">Open</option>
              <option value="unlocked">Unlocked</option>
              <option value="closed">Closed</option>
              <option value="coming_soon">Coming Soon (Pre-launch)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-cream-muted block mb-1">Deal Deadline</label>
            <Input
              type="datetime-local"
              value={form.deal_deadline}
              onChange={(e) => setForm({ ...form, deal_deadline: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gold uppercase tracking-wider">Discount Tiers</h3>
          <Button type="button" onClick={addTier} variant="outline" size="sm" className="h-8 gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Tier
          </Button>
        </div>
        <div className="space-y-2">
          {tiers.map((tier, i) => (
            <div key={i} className="flex gap-4 items-end bg-surface-elevated/50 p-3 rounded-lg border border-border/50">
              <div className="flex-1">
                <label className="text-[10px] text-cream-muted uppercase mb-1 block">Min Units</label>
                <Input
                  type="number"
                  min="0"
                  value={Number.isFinite(tier.min_units) ? tier.min_units : ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateTier(i, "min_units", v === "" ? 0 : parseInt(v, 10));
                  }}
                  className="h-9"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-cream-muted uppercase mb-1 block">Discount %</label>
                <Input
                  type="number"
                  min="0"
                  value={Number.isFinite(tier.discount_percentage) ? tier.discount_percentage : ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateTier(i, "discount_percentage", v === "" ? 0 : parseFloat(v));
                  }}
                  className="h-9"
                />
              </div>
              <Button type="button" onClick={() => removeTier(i)} variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {tiers.length === 0 && <p className="text-center py-4 text-xs text-cream-muted italic border border-dashed border-border rounded-lg">No custom tiers added. Using default discount.</p>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gold uppercase tracking-wider">Unit Configurations</h3>
          <Button type="button" onClick={addConfig} variant="outline" size="sm" className="h-8 gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Config
          </Button>
        </div>
        <div className="space-y-2">
          {unitConfigs.map((config, i) => (
            <div key={i} className="flex gap-4 items-end bg-surface-elevated/50 p-3 rounded-lg border border-border/50">
              <div className="flex-[2]">
                <label className="text-[10px] text-cream-muted uppercase mb-1 block">Type (e.g. 3BHK)</label>
                <Input
                  value={config.type}
                  onChange={(e) => updateConfig(i, 'type', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex-[2]">
                <label className="text-[10px] text-cream-muted uppercase mb-1 block">Size (e.g. 1850 Sft)</label>
                <Input
                  value={config.size}
                  onChange={(e) => updateConfig(i, 'size', e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex-[2]">
                <label className="text-[10px] text-cream-muted uppercase mb-1 block">Price Range</label>
                <Input
                  value={config.price}
                  onChange={(e) => updateConfig(i, 'price', e.target.value)}
                  className="h-9"
                />
              </div>
              <Button type="button" onClick={() => removeConfig(i)} variant="ghost" size="icon" className="h-9 w-9 text-red-400 hover:text-red-300">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {unitConfigs.length === 0 && <p className="text-center py-4 text-xs text-cream-muted italic border border-dashed border-border rounded-lg">No unit configurations added.</p>}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <label className="text-xs text-cream-muted block mb-2">Description / Private Notes</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Detailed project info, negotiated terms, etc."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="gold-gradient-bg text-accent-foreground min-w-[140px]"
        >
          {loading ? "Saving..." : project ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
