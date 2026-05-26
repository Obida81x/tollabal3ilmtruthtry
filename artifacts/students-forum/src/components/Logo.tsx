import { useTranslation } from "@/lib/i18n";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

export function Logo({ size = "md", showWordmark = true }: LogoProps) {
  const { t } = useTranslation();
  const dim = size === "sm" ? 28 : size === "lg" ? 56 : 40;
  return (
    <div className="flex items-center gap-3" data-testid="logo-app">
      <img
        src="/logo.png"
        alt="Tollabal3ilm Community logo"
        width={dim}
        height={dim}
        style={{ borderRadius: "22%", objectFit: "cover", flexShrink: 0 }}
      />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className="font-bold text-base text-foreground"
            style={{ fontFamily: "var(--app-font-serif)", direction: "rtl" }}
          >
            {t("ar.studentsOfIlm")}
          </span>
          <span className="text-xs text-muted-foreground tracking-wide">
            {t("app.name.en")}
          </span>
        </div>
      )}
    </div>
  );
}
