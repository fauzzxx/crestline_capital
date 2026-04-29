/**
 * Tiny in-memory rate limiter. Resets on cold start; good enough for Phase 1 volume.
 * For real horizontal scaling, swap with a Redis or Supabase-backed limiter.
 */

const buckets = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  opts: { maxAttempts: number; windowMs: number },
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const arr = buckets.get(key) ?? [];
  const fresh = arr.filter((ts) => now - ts < opts.windowMs);
  if (fresh.length >= opts.maxAttempts) {
    const oldest = Math.min(...fresh);
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((opts.windowMs - (now - oldest)) / 1000)),
    };
  }
  fresh.push(now);
  buckets.set(key, fresh);
  return { allowed: true, retryAfterSec: 0 };
}

export async function getClientIp(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip")?.trim() ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}
