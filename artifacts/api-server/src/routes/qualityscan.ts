import { Router, type IRouter } from "express";
import { db, qualityScansTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth.js";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

type ImageContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

function buildImageContent(cropType: string, notes: string | undefined, imageData: string | undefined, imageUrl: string | undefined, prompt: string): ImageContentPart[] {
  const parts: ImageContentPart[] = [{ type: "text", text: prompt }];
  if (imageData) {
    const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData;
    const mimeType = imageData.startsWith("data:image/png") ? "image/png" : "image/jpeg";
    parts.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } });
  } else if (imageUrl) {
    parts.push({ type: "image_url", image_url: { url: imageUrl } });
  }
  return parts;
}

router.get("/qualityscan/scans", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const scans = await db.select().from(qualityScansTable).where(eq(qualityScansTable.userId, userId));
  res.json(scans);
});

router.post("/qualityscan/analyze", requireAuth, async (req, res): Promise<void> => {
  const userId = req.userId!;
  const { cropType, imageData, imageUrl, notes } = req.body as {
    cropType?: string;
    imageData?: string;
    imageUrl?: string;
    notes?: string;
  };
  if (!cropType) { res.status(400).json({ error: "cropType required" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const hasImage = !!(imageData || imageUrl);
  const narrativePrompt = `You are an expert agricultural quality inspector and agronomist. Perform a comprehensive quality assessment for the following crop.

Crop type: ${cropType}
${notes ? `Farmer's notes: ${notes}` : ""}
${!hasImage ? "Note: No image provided — base your analysis on crop type and notes alone, and advise the farmer to submit a photo for a more accurate grade." : ""}

Analyse thoroughly and cover:
1. Overall quality grade: A (excellent, premium market), B (good, standard market), or C (below standard, requires attention) — state this clearly first
2. Quality score out of 100
3. Estimated moisture content and what it means for safe storage duration
4. Visible or expected defects, disease signs, pest damage, or foreign matter
5. Color, texture, size uniformity, and how these affect market value
6. Recommended selling price range relative to regional market averages
7. Specific post-harvest handling and storage instructions
8. Whether the crop is suitable for export, premium retail, or industrial use

Speak directly to the farmer. Be practical, specific, and encouraging where deserved.`;

  const narrativeContent = buildImageContent(cropType, notes, imageData, imageUrl, narrativePrompt);

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: narrativeContent as Parameters<typeof openai.chat.completions.create>[0]["messages"][0]["content"] }],
      stream: true,
    });

    let fullNarrative = "";
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        fullNarrative += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    const extractPrompt = `From this crop quality analysis report, extract the following as a JSON object only (no markdown fences, no extra text):
{"grade":"A or B or C","score":number_0_to_100,"moisture":number_or_null,"protein":number_or_null,"defects":"one sentence","recommendations":"one or two sentences"}

Report:
${fullNarrative.slice(0, 2000)}`;

    const extractResponse = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 256,
      messages: [{ role: "user", content: extractPrompt }],
    });

    const raw = (extractResponse.choices[0]?.message?.content ?? "{}").trim();
    const jsonStr = raw.startsWith("```") ? raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim() : raw;
    let parsed: {
      grade?: string;
      score?: number;
      moisture?: number | null;
      protein?: number | null;
      defects?: string;
      recommendations?: string;
    } = {};
    try { parsed = JSON.parse(jsonStr); } catch { /* use defaults */ }

    await db.insert(qualityScansTable).values({
      cropType,
      imageUrl: imageUrl ?? null,
      grade: parsed.grade ?? "B",
      score: String(Math.min(100, Math.max(0, parsed.score ?? 75))),
      moisture: parsed.moisture != null ? String(parsed.moisture) : null,
      protein: parsed.protein != null ? String(parsed.protein) : null,
      defects: parsed.defects ?? "Standard quality",
      recommendations: parsed.recommendations ?? fullNarrative.split("\n").filter(Boolean).slice(-1)[0]?.slice(0, 300) ?? "Meets market requirements.",
      status: "complete",
      userId,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("QualityScan streaming error:", err);
    res.write(`data: ${JSON.stringify({ error: "AI analysis failed. Please try again." })}\n\n`);
    res.end();
  }
});

router.get("/qualityscan/scans/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [scan] = await db.select().from(qualityScansTable).where(eq(qualityScansTable.id, id));
  if (!scan) { res.status(404).json({ error: "Scan not found" }); return; }
  if (scan.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  res.json(scan);
});

export default router;
