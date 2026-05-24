import { type ReactNode } from "react";
import { ArabesqueDivider } from "@/components/Pattern";

type Props = {
  title: string;
  subtitle?: string;
  arabicLabel?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, arabicLabel, actions }: Props) {
  return (
    <div className="border-b border-border bg-card/40 px-6 lg:px-10 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            {arabicLabel && (
              <div
                className="text-secondary text-lg mb-1"
                style={{ fontFamily: "var(--app-font-serif)" }}
                data-testid="text-arabic-label"
              >
                {arabicLabel}
              </div>
            )}
            <h1
              className="text-3xl lg:text-4xl text-foreground"
              style={{ fontFamily: "var(--app-font-serif)" }}
              data-testid="text-page-title"
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
        <ArabesqueDivider className="mt-6" />
      </div>
    </div>
  );
}
