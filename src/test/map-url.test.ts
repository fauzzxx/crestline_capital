import { describe, expect, it } from "vitest";
import { getMapEmbedUrl } from "@/lib/maps";

describe("getMapEmbedUrl", () => {
  it("falls back to location query on empty input", () => {
    expect(getMapEmbedUrl("", "Gachibowli, Hyderabad")).toContain(
      "google.com/maps?q=Gachibowli%2C%20Hyderabad",
    );
  });

  it("extracts src from full iframe HTML", () => {
    const iframe = '<iframe src="https://www.google.com/maps/embed?pb=!1m18..." width="600"></iframe>';
    expect(getMapEmbedUrl(iframe, "loc")).toBe(
      "https://www.google.com/maps/embed?pb=!1m18...",
    );
  });

  it("returns existing /maps/embed URL unchanged", () => {
    const url = "https://www.google.com/maps/embed?pb=!1m18!1m12";
    expect(getMapEmbedUrl(url, "loc")).toBe(url);
  });

  it("converts goo.gl share link to embed query", () => {
    expect(getMapEmbedUrl("https://goo.gl/maps/abc", "loc")).toContain("output=embed");
  });

  it("converts plain address to embed query", () => {
    expect(getMapEmbedUrl("Hitech City, Hyderabad", "loc")).toContain(
      "q=Hitech%20City%2C%20Hyderabad",
    );
  });

  it("preserves a maps.app.goo.gl link as q parameter", () => {
    expect(getMapEmbedUrl("https://maps.app.goo.gl/xyz", "loc")).toContain("output=embed");
  });
});
