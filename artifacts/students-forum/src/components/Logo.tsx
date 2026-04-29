import { useTranslation } from "@/lib/i18n";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
};

export function Logo({ size = "md", showWordmark = true }: LogoProps) {
  const { t, lang } = useTranslation();
  const dim = size === "sm" ? 28 : size === "lg" ? 56 : 40;
  return (
    <div className="flex items-center gap-3" data-testid="logo-app">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="12"
          fill="url(#logoGrad)"
          opacity="0.95"
        />
        <g
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="1.4"
          fill="none"
        >
          <path d="M16 32 L32 16 L48 32 L32 48 Z" />
          <path d="M22 32 L32 22 L42 32 L32 42 Z" />
          <circle cx="32" cy="32" r="3" fill="hsl(var(--primary-foreground))" />
        </g>
      </svg>
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className="font-serif text-base text-foreground"
            style={{ fontFamily: "var(--app-font-serif)" }}
          >
            {t("ar.studentsOfIlm")}
          </span>
          <span
            className={
              lang === "ar"
                ? "text-xs text-muted-foreground tracking-wide"
                : "text-xs text-muted-foreground tracking-wide uppercase"
            }
          >
            {t("app.name.en")}
          </span>
        </div>
      )}
    </div>
  );
}
