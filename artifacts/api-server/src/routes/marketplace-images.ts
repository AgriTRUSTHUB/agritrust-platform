import { Router, type IRouter, type Request } from "express";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server";
import sharp from "sharp";

const router: IRouter = Router();

// ── Simple in-memory rate limiter ───────────────────────────────────────────
// Max 10 generate-image requests per IP per 60 seconds
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 10;
const ipWindows = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipWindows.get(ip);
  if (!entry || now > entry.resetAt) {
    ipWindows.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT) return true;
  return false;
}

// ── POST /api/marketplace/generate-image ────────────────────────────────────
// Generates a 400×250 JPEG thumbnail for a marketplace listing using AI.
// - Rate limited: max 10 requests / IP / 60 s
// - Prompt capped at 500 characters to prevent abuse
router.post("/marketplace/generate-image", async (req: Request, res): Promise<void> => {
  const ip = (req.headers["x-forwarded-for"] as string | undefined) ?? req.socket.remoteAddress ?? "unknown";

  if (isRateLimited(ip)) {
    res.status(429).json({ error: "Rate limit exceeded. Please wait before generating more images." });
    return;
  }

  const { prompt, listingId } = req.body as { prompt?: string; listingId?: number };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  // Cap prompt length to prevent prompt-injection / excessive API cost
  const safePrompt = prompt.trim().slice(0, 500);

  try {
    // Generate at 1024×1024 (smallest supported square size)
    const rawBuffer = await generateImageBuffer(safePrompt, "1024x1024");

    // Resize server-side to exactly 400×250 px (spec target, 8:5 landscape ratio)
    // and convert to JPEG at quality 82 — balances visual quality vs payload size
    const resizedBuffer = await sharp(rawBuffer)
      .resize(400, 250, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82 })
      .toBuffer();

    const base64 = resizedBuffer.toString("base64");
    res.json({
      dataUrl: `data:image/jpeg;base64,${base64}`,
      listingId: listingId ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Image generation failed";
    res.status(500).json({ error: message });
  }
});

export default router;
