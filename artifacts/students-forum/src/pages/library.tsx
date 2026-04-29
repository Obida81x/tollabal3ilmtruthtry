import { useState, useMemo } from "react";
import { Link } from "wouter";
import { BookOpen, Download } from "lucide-react";
import {
  useListBooks,
  getListBooksQueryKey,
} from "@workspace/api-client-react";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function LibraryPage() {
  useRequireAuth();
  const { t } = useTranslation();
  const { data: books, isLoading } = useListBooks(undefined, {
    query: { queryKey: getListBooksQueryKey() },
  });
  const [filter, setFilter] = useState<string>("all");

  const categories = useMemo(() => {
    if (!books) return [];
    return Array.from(new Set(books.map((b) => b.category)));
  }, [books]);

  const filtered = useMemo(() => {
    if (!books) return [];
    if (filter === "all") return books;
    return books.filter((b) => b.category === filter);
  }, [books, filter]);

  return (
    <AppLayout>
      <PageHeader
        title={t("library.title")}
        arabicLabel={t("ar.library")}
        subtitle={t("library.subtitle")}
      />
      <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            data-testid="button-filter-all"
          >
            {t("common.all")}
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              variant={filter === c ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(c)}
              data-testid={`button-filter-${c.toLowerCase()}`}
            >
              {c}
            </Button>
          ))}
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <Card key={b.id} data-testid={`card-book-${b.id}`} className="border-card-border h-full overflow-hidden flex flex-col">
              <div className="aspect-[3/2] bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center relative">
                <BookOpen className="h-12 w-12 text-primary-foreground/40" />
                <div
                  className="absolute bottom-3 left-3 right-3 text-primary-foreground"
                  style={{ fontFamily: "var(--app-font-serif)" }}
                >
                  <div className="text-sm opacity-90 truncate">{b.author}</div>
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3
                  className="font-semibold text-foreground mb-1"
                  style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.1rem" }}
                  data-testid={`text-book-title-${b.id}`}
                >
                  {b.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Badge variant="secondary" data-testid={`badge-category-${b.id}`}>{b.category}</Badge>
                  <span>{b.language}</span>
                  {b.pages && <span>· {b.pages} {t("common.pp")}</span>}
                </div>
                {b.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{b.description}</p>
                )}
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline" className="flex-1" data-testid={`link-book-${b.id}`}>
                    <Link href={`/library/${b.id}`}>{t("common.details")}</Link>
                  </Button>
                  <Button asChild size="sm" className="gap-1" data-testid={`button-download-${b.id}`}>
                    <a href={b.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {!isLoading && filtered.length === 0 && (
          <Card className="border-card-border">
            <CardContent className="p-8 text-center text-muted-foreground">
              {t("library.empty")}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
