import { initials, cn } from "@/lib/utils";

type Props = {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  testId?: string;
};

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export function InitialsAvatar({ name, className, size = "md", testId }: Props) {
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex items-center justify-center rounded-full font-medium select-none",
        "bg-gradient-to-br from-primary to-secondary text-primary-foreground",
        "ring-1 ring-border/50 shadow-sm",
        sizeMap[size],
        className,
      )}
      aria-hidden
    >
      <span style={{ fontFamily: "var(--app-font-serif)" }}>
        {initials(name) || "?"}
      </span>
    </div>
  );
}
