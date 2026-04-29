"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBuilder, updateBuilder } from "@/app/actions/admin";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { Builder } from "@/types/database";

interface BuilderFormProps {
  builder?: Builder;
  onSuccess?: () => void;
}

export function BuilderForm({ builder, onSuccess }: BuilderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: builder?.name ?? "",
    contact_person: builder?.contact_person ?? "",
    phone: builder?.phone ?? "",
    email: builder?.email ?? "",
    past_performance: builder?.past_performance ?? "",
    trust_score: typeof builder?.trust_score === "number" ? builder.trust_score : 50,
    bio: builder?.bio ?? "",
    established_year: builder?.established_year?.toString() ?? "",
    website_url: builder?.website_url ?? "",
    past_projects_count: builder?.past_projects_count?.toString() ?? "0",
    total_units_delivered: builder?.total_units_delivered?.toString() ?? "0",
    rera_numbers: builder?.rera_numbers ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name.trim(),
      contact_person: form.contact_person.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      past_performance: form.past_performance.trim() || null,
      trust_score: form.trust_score,
      bio: form.bio.trim() || null,
      established_year: form.established_year ? parseInt(form.established_year, 10) : null,
      website_url: form.website_url.trim() || null,
      past_projects_count: parseInt(form.past_projects_count, 10) || 0,
      total_units_delivered: parseInt(form.total_units_delivered, 10) || 0,
      rera_numbers: form.rera_numbers.trim() || null,
    };

    if (builder) {
      const result = await updateBuilder(builder.id, payload);
      if (result.success) {
        toast.success("Builder updated");
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await createBuilder(payload);
      if (result.success) {
        toast.success("Builder created");
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    }
    setLoading(false);
  };

  const inputClass =
    "w-full px-4 py-2 rounded-lg bg-surface-elevated border border-border text-foreground focus:outline-none focus:border-gold/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-cream-muted block mb-1">Builder Name</label>
        <Input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-cream-muted block mb-1">Contact Person</label>
          <Input
            value={form.contact_person}
            onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-cream-muted block mb-1">Phone</label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-cream-muted block mb-1">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-cream-muted block mb-1">Website</label>
          <Input
            type="url"
            placeholder="https://..."
            value={form.website_url}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-cream-muted block mb-2">
          Trust Score: <span className="text-gold font-medium">{form.trust_score}/100</span>
        </label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[form.trust_score]}
          onValueChange={(v) => setForm({ ...form, trust_score: v[0] ?? 0 })}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-cream-muted block mb-1">Established Year</label>
          <Input
            type="number"
            min="1900"
            max="2100"
            value={form.established_year}
            onChange={(e) => setForm({ ...form, established_year: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-cream-muted block mb-1">Past Projects</label>
          <Input
            type="number"
            min="0"
            value={form.past_projects_count}
            onChange={(e) => setForm({ ...form, past_projects_count: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-cream-muted block mb-1">Units Delivered</label>
          <Input
            type="number"
            min="0"
            value={form.total_units_delivered}
            onChange={(e) => setForm({ ...form, total_units_delivered: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-cream-muted block mb-1">RERA Numbers</label>
        <Input
          value={form.rera_numbers}
          onChange={(e) => setForm({ ...form, rera_numbers: e.target.value })}
          className={inputClass}
          placeholder="Comma-separated RERA registration numbers"
        />
      </div>
      <div>
        <label className="text-xs text-cream-muted block mb-1">Bio / About</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Short bio shown on the builder profile section."
        />
      </div>
      <div>
        <label className="text-xs text-cream-muted block mb-1">Past Performance (internal)</label>
        <textarea
          value={form.past_performance}
          onChange={(e) => setForm({ ...form, past_performance: e.target.value })}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full gold-gradient-bg text-accent-foreground"
      >
        {loading ? "Saving..." : builder ? "Update Builder" : "Create Builder"}
      </Button>
    </form>
  );
}
