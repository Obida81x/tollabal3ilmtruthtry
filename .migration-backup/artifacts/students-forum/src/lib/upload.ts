export type UploadResult = {
  objectPath: string;
  url: string;
  kind: "image" | "video";
  contentType: string;
};

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

export async function uploadMedia(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/storage/uploads`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!res.ok) {
    let message = "Upload failed.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as UploadResult;
}

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
