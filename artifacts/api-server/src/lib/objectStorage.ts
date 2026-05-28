import crypto from "node:crypto";
import path from "node:path";

export type UploadResult = {
  objectPath: string;
  url: string;
};

function parseCloudinaryUrl(): {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
} | null {
  const raw = process.env.CLOUDINARY_URL;
  if (!raw) return null;
  const match = raw.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) return null;
  return { apiKey: match[1], apiSecret: match[2], cloudName: match[3] };
}

export async function uploadBuffer(
  buffer: Buffer,
  contentType: string,
  originalName: string,
): Promise<UploadResult> {
  const creds = parseCloudinaryUrl();
  if (!creds) {
    throw new Error(
      "File uploads require CLOUDINARY_URL to be set. " +
        "Please add it to your environment variables on Render.",
    );
  }

  const { apiKey, apiSecret, cloudName } = creds;

  const resourceType =
    contentType.startsWith("video/") || contentType.startsWith("audio/")
      ? "video"
      : "image";

  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signature: sort params alphabetically, append secret
  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  console.log(`[Cloudinary] Uploading ${resourceType}, size=${buffer.length} bytes, type=${contentType}`);

  // Cloudinary upload endpoint requires multipart/form-data (not JSON)
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const form = new FormData();
  // Use base64 data URI as the file field — Cloudinary accepts this
  const dataUri = `data:${contentType};base64,${buffer.toString("base64")}`;
  form.append("file", dataUri);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`[Cloudinary] Upload failed (${response.status}): ${detail}`);
    throw new Error(`Cloudinary upload failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };

  console.log(`[Cloudinary] Upload success: ${data.secure_url}`);

  const ext = path.extname(originalName).slice(0, 8) || "";
  const id = crypto.randomUUID();

  return {
    objectPath: `/objects/cloudinary/${id}${ext}`,
    url: data.secure_url,
  };
}

export async function streamObject(
  _objectPath: string,
  res: import("express").Response,
): Promise<void> {
  res.status(404).json({ error: "Object not found" });
}
