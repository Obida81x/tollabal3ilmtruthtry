import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n";

const BASE_URL = "https://tollabal3ilmcommunity.replit.app";

interface SEOProps {
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  path?: string;
}

function setMeta(selector: string, value: string) {
  const el = document.querySelector(selector) as HTMLMetaElement | null;
  if (el) el.setAttribute("content", value);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = url;
}

export function useSEO({ titleAr, titleEn, descAr, descEn, path = "" }: SEOProps) {
  const { lang } = useTranslation();

  useEffect(() => {
    const title = lang === "ar" ? titleAr : titleEn;
    const desc = lang === "ar" ? descAr : descEn;
    const url = `${BASE_URL}${path}`;

    document.title = title;

    setMeta('meta[name="description"]', desc);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', desc);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', desc);
    setCanonical(url);
  }, [lang, titleAr, titleEn, descAr, descEn, path]);
}
