import { Router, type IRouter } from "express";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import { requireAuth } from "../middleware/auth.js";

const router: IRouter = Router();

router.post("/upload/image", requireAuth, (req, res): void => {
  const { data, mimeType = "image/jpeg" } = req.body as {
    data?: string;
    mimeType?: string;
  };

  if (!data) {
    res.status(400).json({ error: "No image data provided" });
    return;
  }

  const ext = mimeType.includes("png") ? ".png" : ".jpg";
  const filename = randomBytes(16).toString("hex") + ext;
  const uploadsDir = join(process.cwd(), "uploads");

  mkdirSync(uploadsDir, { recursive: true });
  writeFileSync(join(uploadsDir, filename), Buffer.from(data, "base64"));

  const proto = req.get("x-forwarded-proto") ?? req.protocol;
  const host = req.get("x-forwarded-host") ?? req.get("host") ?? "localhost";
  const url = `${proto}://${host}/uploads/${filename}`;

  res.json({ url });
});

export default router;
