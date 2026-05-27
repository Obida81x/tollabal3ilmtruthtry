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
  const signature = crypto
    .createHash("sha1")
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const base64 = buffer.toString("base64");
  const dataUri = `data:${contentType};base64,${base64}`;

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file: dataUri,
      api_key: apiKey,
      timestamp,
      signature,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Cloudinary upload failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };

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
