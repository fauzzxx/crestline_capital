"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { submitMembershipRequest } from "@/app/actions/membership";
import {
  BUDGET_RANGES,
  BUYING_PURPOSES,
  BUYING_TIMELINES,
  HYDERABAD_LOCATIONS,
} from "@/lib/constants";

const budgetRanges = BUDGET_RANGES;
const purposes = BUYING_PURPOSES;
const timelines = BUYING_TIMELINES;
const locations = HYDERABAD_LOCATIONS;

export function MembershipForm() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    budgetRange: "",
    purpose: "",
    locations: [] as string[],
    timeline: "",
    agreed: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleLocationToggle = (loc: string) => {
    setForm((prev) => ({
      ...prev,
      locations: prev.locations.includes(loc)
        ? prev.locations.filter((l) => l !== loc)
        : [...prev.locations, loc],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed) {
      toast.error("Please agree to the membership terms.");
      return;
    }
    setSubmitting(true);
    const result = await submitMembershipRequest({
      full_name: form.fullName,
      phone: form.phone,
      email: form.email,
      budget_range: form.budgetRange,
      buying_purpose: form.purpose,
      preferred_locations: form.locations,
      buying_timeline: form.timeline,
      agreement_accepted: form.agreed,
    });
    setSubmitting(false);
    if (result.success) {
      toast.success("Membership request submitted! We'll review your application shortly.");
      setForm({
        fullName: "",
        phone: "",
        email: "",
        budgetRange: "",
        purpose: "",
        locations: [],
        timeline: "",
        agreed: false,
      });
    } else {
      toast.error(result.error || "Something went wrong.");
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-surface-elevated border border-border text-foreground placeholder:text-cream-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all font-body";

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onSubmit={handleSubmit}
      className="glass-card p-8 rounded-2xl space-y-6"
    >
      <div>
        <label className="text-sm text-cream-muted mb-1.5 block">Full Name</label>
        <input
          type="text"
          required
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className={inputClass}
          placeholder="Your full name"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-cream-muted mb-1.5 block">Phone Number</label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
        <div>
          <label className="text-sm text-cream-muted mb-1.5 block">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            placeholder="you@email.com"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-cream-muted mb-2 block">Budget Range</label>
        <div className="flex flex-wrap gap-2">
          {budgetRanges.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setForm({ ...form, budgetRange: b })}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                form.budgetRange === b
                  ? "gold-gradient-bg text-accent-foreground font-medium"
                  : "glass-card text-cream-muted hover:border-gold/30"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-cream-muted mb-2 block">Buying Purpose</label>
        <div className="flex gap-2">
          {purposes.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setForm({ ...form, purpose: p })}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                form.purpose === p
                  ? "gold-gradient-bg text-accent-foreground font-medium"
                  : "glass-card text-cream-muted hover:border-gold/30"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-cream-muted mb-2 block">Preferred Locations</label>
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => handleLocationToggle(loc)}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                form.locations.includes(loc)
                  ? "gold-gradient-bg text-accent-foreground font-medium"
                  : "glass-card text-cream-muted hover:border-gold/30"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-cream-muted mb-2 block">Buying Timeline</label>
        <div className="flex flex-wrap gap-2">
          {timelines.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, timeline: t })}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                form.timeline === t
                  ? "gold-gradient-bg text-accent-foreground font-medium"
                  : "glass-card text-cream-muted hover:border-gold/30"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.agreed}
          onChange={(e) => setForm({ ...form, agreed: e.target.checked })}
          className="mt-1 accent-gold"
        />
        <span className="text-sm text-cream-muted">
          I agree to the membership terms and confidentiality. Crestline Capital is a structured bulk buying platform—not a financial advisor or listing portal.
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-lg gold-gradient-bg text-accent-foreground font-semibold text-lg hover:opacity-90 transition-all disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Membership Request"}
      </button>
    </motion.form>
  );
}
