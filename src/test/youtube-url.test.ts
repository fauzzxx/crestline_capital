import { describe, expect, it } from "vitest";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

describe("getYouTubeEmbedUrl", () => {
  it("returns null on empty input", () => {
    expect(getYouTubeEmbedUrl("")).toBeNull();
  });

  it("extracts ID from a watch?v= URL", () => {
    expect(getYouTubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("extracts ID from a youtu.be short URL", () => {
    expect(getYouTubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ?t=10")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("extracts ID from a /embed/ URL", () => {
    expect(getYouTubeEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("extracts ID from a /shorts/ URL", () => {
    expect(getYouTubeEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
    );
  });

  it("returns null for non-YouTube URLs", () => {
    expect(getYouTubeEmbedUrl("https://vimeo.com/12345")).toBeNull();
  });

  it("returns null for malformed strings", () => {
    expect(getYouTubeEmbedUrl("not a url")).toBeNull();
  });
});
