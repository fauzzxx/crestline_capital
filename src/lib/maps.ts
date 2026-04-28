export function getMapEmbedUrl(input: string, fallbackLocation: string): string {
  if (!input) return `https://www.google.com/maps?q=${encodeURIComponent(fallbackLocation)}&output=embed`;
  const trimmed = input.trim();
  if (trimmed.includes("<iframe")) {
    const srcMatch = trimmed.match(/src="([^"]+)"/);
    if (srcMatch) return srcMatch[1];
  }
  if (trimmed.includes("/maps/embed")) return trimmed;
  if (
    trimmed.includes("google.com/maps") ||
    trimmed.includes("goo.gl/maps") ||
    trimmed.includes("maps.app.goo.gl")
  ) {
    return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}
