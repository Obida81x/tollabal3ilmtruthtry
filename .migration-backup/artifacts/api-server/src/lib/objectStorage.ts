import { Storage, type Bucket } from "@google-cloud/storage";
import crypto from "node:crypto";
import path from "node:path";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export const objectStorageClient: Storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: { type: "json", subject_token_field_name: "access_token" },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

function getBucket(): Bucket {
  const id = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!id) {
    throw new Error("DEFAULT_OBJECT_STORAGE_BUCKET_ID env var is required");
  }
  return objectStorageClient.bucket(id);
}

function getPrivateDir(): string {
  const dir = process.env.PRIVATE_OBJECT_DIR;
  if (!dir) throw new Error("PRIVATE_OBJECT_DIR env var is required");
  return dir;
}

function parseGcsPath(fullPath: string): { bucketName: string; objectName: string } {
  const trimmed = fullPath.startsWith("/") ? fullPath.slice(1) : fullPath;
  const idx = trimmed.indexOf("/");
  if (idx === -1) throw new Error("Invalid object path");
  return { bucketName: trimmed.slice(0, idx), objectName: trimmed.slice(idx + 1) };
}

export type UploadResult = {
  objectPath: string;
  url: string;
};

export async function uploadBuffer(
  buffer: Buffer,
  contentType: string,
  originalName: string,
): Promise<UploadResult> {
  const privateDir = getPrivateDir();
  const { bucketName, objectName: prefix } = parseGcsPath(privateDir);
  const ext = path.extname(originalName).slice(0, 8) || "";
  const id = crypto.randomUUID();
  const fullObjectName = `${prefix}/uploads/${id}${ext}`;

  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(fullObjectName);
  await file.save(buffer, {
    contentType,
    resumable: false,
    metadata: {
      contentType,
      cacheControl: "public, max-age=86400",
    },
  });

  const objectPath = `/objects/uploads/${id}${ext}`;
  return { objectPath, url: `/api/storage${objectPath}` };
}

export async function streamObject(
  objectPath: string,
  res: import("express").Response,
): Promise<void> {
  if (!objectPath.startsWith("/objects/")) {
    res.status(400).end();
    return;
  }
  const privateDir = getPrivateDir();
  const { bucketName, objectName: prefix } = parseGcsPath(privateDir);
  const tail = objectPath.slice("/objects/".length);
  const fullName = `${prefix}/${tail}`;
  const file = objectStorageClient.bucket(bucketName).file(fullName);
  const [exists] = await file.exists();
  if (!exists) {
    res.status(404).end();
    return;
  }
  const [meta] = await file.getMetadata();
  if (meta.contentType) res.setHeader("Content-Type", meta.contentType);
  if (meta.size) res.setHeader("Content-Length", String(meta.size));
  res.setHeader("Cache-Control", "public, max-age=3600");
  file
    .createReadStream()
    .on("error", () => {
      if (!res.headersSent) res.status(500).end();
    })
    .pipe(res);
  void getBucket;
}
