import { useRef, useState } from "react";
import { ImagePlus, Video as VideoIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadMedia, MAX_UPLOAD_BYTES, type UploadResult } from "@/lib/upload";
import { useTranslation } from "@/lib/i18n";

type Props = {
  value: UploadResult | null;
  onChange: (value: UploadResult | null) => void;
  disabled?: boolean;
  testIdPrefix?: string;
};

export function MediaUploadButton({
  value,
  onChange,
  disabled,
  testIdPrefix = "media",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handlePick = () => inputRef.current?.click();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(t("upload.tooBig"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const result = await uploadMedia(file);
      onChange(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (value) {
    return (
      <div className="space-y-2" data-testid={`${testIdPrefix}-preview-wrapper`}>
        <div className="relative inline-block max-w-full">
          {value.kind === "image" ? (
            <img
              src={value.url}
              alt="upload preview"
              className="max-h-64 rounded-md border border-card-border object-cover"
              data-testid={`${testIdPrefix}-preview-image`}
            />
          ) : (
            <video
              src={value.url}
              controls
              className="max-h-64 rounded-md border border-card-border"
              data-testid={`${testIdPrefix}-preview-video`}
            />
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 bg-background/90 border border-border rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground"
            data-testid={`${testIdPrefix}-remove`}
            aria-label={t("upload.remove")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleChange}
        data-testid={`${testIdPrefix}-input`}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={handlePick}
          disabled={disabled || busy}
          data-testid={`${testIdPrefix}-pick`}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          <span>{busy ? t("upload.uploading") : t("upload.image")}</span>
        </Button>
        <span className="text-muted-foreground text-xs flex items-center gap-1">
          <VideoIcon className="h-3 w-3" /> {t("upload.videoOk")}
        </span>
      </div>
      {error && (
        <p className="text-xs text-destructive" data-testid={`${testIdPrefix}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
