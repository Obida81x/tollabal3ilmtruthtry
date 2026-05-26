import { Router, type IRouter } from "express";
import multer from "multer";
import type { Request, Response, NextFunction } from "express";
import { uploadBuffer, streamObject } from "../lib/objectStorage";
import { requireUser } from "../lib/auth";

const router: IRouter = Router();

const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
  "video/x-matroska",
  "video/avi",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Wrapper to catch multer errors (e.g. file too large) and return JSON
function handleUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "File too large. Maximum size is 50 MB." });
          return;
        }
        res.status(400).json({ error: err.message });
        return;
      }
      next(err);
      return;
    }
    next();
  });
}

router.post(
  "/storage/uploads",
  requireUser,
  handleUpload,
  async (req, res): Promise<void> => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    if (!ALLOWED.has(file.mimetype)) {
      res.status(400).json({ error: `Unsupported file type: ${file.mimetype}. Allowed: images (PNG, JPG, WebP, GIF), videos (MP4, WebM, MOV), and audio files.` });
      return;
    }
    try {
      const { objectPath, url } = await uploadBuffer(
        file.buffer,
        file.mimetype,
        file.originalname,
      );
      const kind = file.mimetype.startsWith("video/")
        ? "video"
        : file.mimetype.startsWith("audio/")
          ? "audio"
          : "image";
      res.status(201).json({ objectPath, url, kind, contentType: file.mimetype });
    } catch (err) {
      req.log?.error({ err }, "Upload failed");
      res.status(500).json({ error: "Upload failed. Please try again." });
    }
  },
);

router.get(
  "/storage/objects/*splat",
  async (req, res): Promise<void> => {
    const objectPath = req.path.replace(/^\/storage/, "");
    try {
      await streamObject(objectPath, res);
    } catch (err) {
      req.log?.error({ err }, "Stream failed");
      if (!res.headersSent) res.status(500).end();
    }
  },
);

export default router;
