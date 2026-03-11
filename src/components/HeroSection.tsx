"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const HERO_SKYLINE_SRC =
  process.env.NEXT_PUBLIC_HERO_SKYLINE_URL || "/images/hyderabad-hero.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-bleed background image (reference: buildings as full background) */}
      <div className="absolute inset-0">
        <Image
          src={HERO_SKYLINE_SRC}
          alt="Hyderabad city skyline at night"
          fill
          className="object-cover"
          sizes="100vw"
          priority
          quality={95}
          unoptimized={HERO_SKYLINE_SRC.startsWith("/")}
        />
        {/* Dark overlay for readability — reference-style gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"
          aria-hidden
        />
      </div>

      {/* Centered content block — reference: big serif headline + sub + single CTA */}
      <div className="relative z-10 section-container text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gold/90 text-sm uppercase tracking-[0.2em] mb-6 font-medium"
          >
            Private Buyer Network · Hyderabad
          </motion.p>

          <h1 className="font-heading font-bold text-white leading-[1.1] mb-8 tracking-tight">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              Unlock
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl gold-gradient-text mt-1">
              Builder-Level
            </span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mt-1">
              Pricing
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-12 font-body font-normal leading-relaxed"
          >
            Where serious buyers pool capital to negotiate exclusive tier-based discounts from premium residential projects.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/membership"
              className="px-10 py-4 rounded-md gold-gradient-bg text-accent-foreground font-semibold text-sm uppercase tracking-wider hover:opacity-95 transition-all duration-300 border border-gold/30 shadow-lg"
            >
              Request Membership
            </Link>
            <a
              href="#opportunities"
              className="px-10 py-4 rounded-md bg-white/10 backdrop-blur border border-white/20 text-white font-semibold text-sm uppercase tracking-wider hover:bg-white/15 transition-all duration-300"
            >
              View Live Opportunities
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown size={20} className="animate-scroll-indicator" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
