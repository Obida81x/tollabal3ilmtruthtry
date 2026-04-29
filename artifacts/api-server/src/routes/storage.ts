import { Router, type IRouter } from "express";
import multer from "multer";
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
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post(
  "/storage/uploads",
  requireUser,
  upload.single("file"),
  async (req, res): Promise<void> => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    if (!ALLOWED.has(file.mimetype)) {
      res.status(400).json({ error: `Unsupported type ${file.mimetype}` });
      return;
    }
    try {
      const { objectPath, url } = await uploadBuffer(
        file.buffer,
        file.mimetype,
        file.originalname,
      );
      const kind = file.mimetype.startsWith("video/") ? "video" : "image";
      res.status(201).json({ objectPath, url, kind, contentType: file.mimetype });
    } catch (err) {
      req.log?.error({ err }, "Upload failed");
      res.status(500).json({ error: "Upload failed" });
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
