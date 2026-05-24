import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, Download, BookOpen } from "lucide-react";
import {
  useGetBook,
  getGetBookQueryKey,
} from "@workspace/api-client-react";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";

export default function BookDetailPage() {
  useRequireAuth();
  const { t, lang } = useTranslation();
  const [, params] = useRoute<{ id: string }>("/library/:id");
  const id = params?.id ? Number(params.id) : 0;
  const { data: b, isLoading } = useGetBook(id, {
    query: { enabled: !!id, queryKey: getGetBookQueryKey(id) },
  });

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <AppLayout>
      <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto">
        <Link href="/library" data-testid="link-back-library">
            <Button variant="ghost" size="sm" className="gap-1 mb-4">
              <BackIcon className="h-4 w-4" /> {t("library.backToLibrary")}
            </Button>
          </Link>
        {isLoading && <Skeleton className="h-64 w-full" />}
        {b && (
          <div className="grid md:grid-cols-[260px_1fr] gap-8">
            <div className="aspect-[3/4] rounded-md bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center relative overflow-hidden">
              <BookOpen className="h-16 w-16 text-primary-foreground/30" />
              <div className="absolute inset-x-4 bottom-4 text-primary-foreground" style={{ fontFamily: "var(--app-font-serif)" }}>
                <div className="text-sm opacity-90 mb-1">{b.author}</div>
                <div className="text-lg font-semibold">{b.title}</div>
              </div>
            </div>
            <div>
              <Badge variant="secondary" className="mb-3">{b.category}</Badge>
              <h1
                className="text-3xl text-foreground"
                style={{ fontFamily: "var(--app-font-serif)" }}
                data-testid="text-book-title"
              >
                {b.title}
              </h1>
              <div className="text-secondary text-lg mt-1">{b.author}</div>
              <div className="text-sm text-muted-foreground mt-2">
                {b.language}
                {b.pages ? ` · ${b.pages} ${t("common.pages")}` : ""}
              </div>
              {b.description && (
                <Card className="border-card-border mt-6">
                  <CardContent className="p-5">
                    <p
                      className="text-foreground leading-relaxed"
                      style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.05rem" }}
                      data-testid="text-book-description"
                    >
                      {b.description}
                    </p>
                  </CardContent>
                </Card>
              )}
              <Button asChild size="lg" className="mt-6 gap-2" data-testid="button-download">
                <a href={b.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> {t("common.download")}
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
