import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type Props = {
  variant?: "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function LanguageToggle({
  variant = "ghost",
  size = "sm",
  className,
}: Props) {
  const { t, toggleLang } = useI18n();
  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleLang}
      data-testid="button-language-toggle"
      className={className}
      aria-label={t("common.languageToggleAria")}
    >
      <Languages className="h-4 w-4" />
      <span className="ml-2">{t("common.languageLabel")}</span>
    </Button>
  );
}
