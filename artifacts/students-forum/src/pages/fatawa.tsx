import { useState } from "react";
import {
  useListFatawa,
  useCreateFatwa,
  getListFatawaQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageCircleQuestion, CheckCircle2, Clock, Eye } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { useTranslation } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";

const STATUS_META: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "fatawa.status.pending", icon: Clock, variant: "secondary" },
  assigned: { label: "fatawa.status.assigned", icon: Eye, variant: "outline" },
  answered: { label: "fatawa.status.answered", icon: CheckCircle2, variant: "default" },
  closed: { label: "fatawa.status.closed", icon: CheckCircle2, variant: "destructive" },
};

export default function FatawaPage() {
  const user = useRequireAuth();
  const { t } = useTranslation();
  useSEO({
    titleAr: "الفتاوى الشرعية | مجتمع طلاب العلم الشرعي",
    titleEn: "Islamic Fatwas | Tollabal3ilm Community",
    descAr: "اطرح أسئلتك الشرعية للمفتين في الفقه والعقيدة والحديث واحصل على إجابات موثوقة",
    descEn: "Submit your Islamic law questions to qualified muftis on matters of fiqh, aqeedah and hadith",
    path: "/fatawa",
  });
  const queryClient = useQueryClient();
  const { data: fatawa, isLoading } = useListFatawa({
    query: { queryKey: getListFatawaQueryKey() },
  });
  const create = useCreateFatwa();

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    create.mutate(
      { data: { question: question.trim(), category: category.trim() || undefined } },
      {
        onSuccess: () => {
          setOpen(false);
          setQuestion("");
          setCategory("");
          queryClient.invalidateQueries({ queryKey: getListFatawaQueryKey() });
        },
      },
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title={t("fatawa.title")}
        arabicLabel={t("ar.fatawa")}
        subtitle={t("fatawa.subtitle")}
      />
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)} className="gap-2" data-testid="button-ask-fatwa">
            <MessageCircleQuestion className="h-4 w-4" />
            {t("fatawa.ask")}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {!isLoading && (!fatawa || fatawa.length === 0) && (
          <Card className="border-card-border">
            <CardContent className="p-8 text-center text-muted-foreground">
              {t("fatawa.empty")}
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {fatawa?.map((f) => {
            const meta = STATUS_META[f.status as string] ?? STATUS_META.pending;
            const StatusIcon = meta.icon;
            return (
              <Card key={f.id} className="border-card-border" data-testid={`card-fatwa-${f.id}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className="text-foreground font-medium leading-snug"
                      style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.05rem" }}
                      data-testid={`text-fatwa-question-${f.id}`}
                    >
                      {f.question}
                    </p>
                    <Badge variant={meta.variant} className="shrink-0 gap-1" data-testid={`badge-fatwa-status-${f.id}`}>
                      <StatusIcon className="h-3 w-3" />
                      {t(meta.label)}
                    </Badge>
                  </div>
                  {f.category && (
                    <Badge variant="outline" className="text-xs">{f.category}</Badge>
                  )}
                  {f.answer && (
                    <div
                      className="mt-2 p-4 rounded-lg bg-primary/5 border border-primary/20 text-foreground text-sm leading-relaxed"
                      data-testid={`text-fatwa-answer-${f.id}`}
                    >
                      <div className="text-xs text-primary font-medium uppercase tracking-wide mb-2">
                        {t("fatawa.ruling")}
                      </div>
                      {f.answer}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {timeAgo(f.createdAt as string, t)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--app-font-serif)" }}>
              {t("fatawa.ask")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("fatawa.question")}</Label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t("fatawa.questionPlaceholder")}
                rows={5}
                maxLength={2000}
                required
                data-testid="input-fatwa-question"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("fatawa.category")} <span className="text-muted-foreground text-xs">({t("fatawa.optional")})</span></Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t("fatawa.categoryPlaceholder")}
                maxLength={100}
                data-testid="input-fatwa-category"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={!question.trim() || create.isPending} data-testid="button-submit-fatwa">
                {create.isPending ? t("fatawa.submitting") : t("fatawa.submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
