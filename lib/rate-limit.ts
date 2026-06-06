/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Per-user token bucket: each user gets `maxRequests` within a rolling
 * `windowMs` window. Exceeding the limit returns { success: false }.
 *
 * In-memory is fine for a solo-use app on a single Vercel serverless
 * instance. For multi-instance deployments, swap for Upstash Redis.
 */

interface TokenBucket {
  timestamps: number[];
}

const buckets = new Map<string, TokenBucket>();

// Prune stale buckets every 5 minutes to prevent memory leaks.
const PRUNE_INTERVAL = 5 * 60 * 1000;
let lastPrune = Date.now();

function prune(windowMs: number) {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL) return;
  lastPrune = now;

  for (const [key, bucket] of buckets) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
    if (bucket.timestamps.length === 0) buckets.delete(key);
  }
}

export function rateLimit({
  key,
  maxRequests,
  windowMs,
}: {
  /** Unique identifier — typically userId or userId:route. */
  key: string;
  /** Max allowed requests within the window. */
  maxRequests: number;
  /** Rolling window in milliseconds. */
  windowMs: number;
}): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  prune(windowMs);

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  // Drop timestamps outside the window.
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= maxRequests) {
    const oldest = bucket.timestamps[0];
    const resetMs = windowMs - (now - oldest);
    return { success: false, remaining: 0, resetMs };
  }

  bucket.timestamps.push(now);
  return {
    success: true,
    remaining: maxRequests - bucket.timestamps.length,
    resetMs: windowMs,
  };
}

/** Standard JSON 429 response with Retry-After header. */
export function rateLimitResponse(resetMs: number): Response {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(resetMs / 1000)),
      },
    },
  );
}
