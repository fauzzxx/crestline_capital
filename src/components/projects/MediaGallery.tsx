"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectMedia } from "@/types/database";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface MediaGalleryProps {
  items: ProjectMedia[];
}

export function MediaGallery({ items }: MediaGalleryProps) {
  const [index, setIndex] = useState(0);
  const current = items[index];

  if (items.length === 0) return null;

  const goPrev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-maroon-deep">
      <div className="relative aspect-video bg-black/40">
        {current.media_type === "youtube" ? (
          <iframe
            src={getYouTubeEmbedUrl(current.media_url) ?? current.media_url}
            title="YouTube"
            className="absolute inset-0 w-full h-full"
            allowFullScreen
          />
        ) : current.media_type === "video" ? (
          <video
            src={current.media_url}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={current.media_url}
            alt=""
            className="w-full h-full object-contain"
          />
        )}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
      <div className="flex gap-2 p-2 overflow-x-auto">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
              i === index ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            {item.media_type === "image" ? (
              <img src={item.media_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-cream-muted">
                {item.media_type === "youtube" ? "YT" : "Video"}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
