import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

type TFn = (key: string, vars?: Record<string, string | number>) => string;

export function timeAgo(
  date: Date | string,
  t?: TFn,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  if (seconds < 60) {
    return t ? t("time.secondsAgo", { n: seconds }) : `${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return t ? t("time.minutesAgo", { n: minutes }) : `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return t ? t("time.hoursAgo", { n: hours }) : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return t ? t("time.daysAgo", { n: days }) : `${days}d ago`;
  }
  return d.toLocaleDateString();
}

export function formatDateTime(
  date: Date | string | null | undefined,
  locale?: string,
  fallback = "TBA",
): string {
  if (!date) return fallback;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
