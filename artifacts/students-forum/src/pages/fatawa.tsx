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
import { MessageCircleQuestion, CheckCircle2, Clock, Eye, AlertCircle, Send } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { useTranslation } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";
import { apiClient } from "@workspace/api-client-react";

const STATUS_META: Record<string, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "fatawa.status.pending", icon: Clock, variant: "secondary" },
  assigned: { label: "fatawa.status.assigned", icon: Eye, variant: "outline" },
  answered: { label: "fatawa.status.answered", icon: CheckCircle2, variant: "default" },
  published: { label: "fatawa.status.answered", icon: CheckCircle2, variant: "default" },
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
  const { data: fatawa, isLoading, error: listError } = useListFatawa({
    query: { queryKey: getListFatawaQueryKey() },
  });
  const create = useCreateFatwa();

  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Mufti answer state
  const [answerOpen, setAnswerOpen] = useState(false);
  const [selectedFatwaId, setSelectedFatwaId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);

  if (!user) return null;

  const isMuftiOrAdmin = (user as { isMufti?: boolean; isAdmin?: boolean }).isMufti || (user as { isMufti?: boolean; isAdmin?: boolean }).isAdmin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const q = question.trim();
    const cat = category.trim();
    if (!q || q.length < 10) {
      setSubmitError("Question must be at least 10 characters.");
      return;
    }
    if (!cat || cat.length < 2) {
      setSubmitError("Please enter a category (e.g. Fiqh, Aqeedah, Hadith).");
      return;
    }
    create.mutate(
      { data: { questionText: q, category: cat } as Parameters<typeof create.mutate>[0]["data"] },
      {
        onSuccess: () => {
          setOpen(false);
          setQuestion("");
          setCategory("");
          setSubmitError(null);
          queryClient.invalidateQueries({ queryKey: getListFatawaQueryKey() });
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to submit question.";
          setSubmitError(msg);
        },
      },
    );
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFatwaId) return;
    setAnswerError(null);
    const ans = answerText.trim();
    if (!ans || ans.length < 5) {
      setAnswerError("Answer must be at least 5 characters.");
      return;
    }
    setAnswerLoading(true);
    try {
      const token = localStorage.getItem("auth_token") ?? sessionStorage.getItem("auth_token") ?? "";
      const res = await fetch(`/api/fatawa/${selectedFatwaId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ answerText: ans }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `Error ${res.status}`);
      }
      setAnswerOpen(false);
      setAnswerText("");
      setSelectedFatwaId(null);
      queryClient.invalidateQueries({ queryKey: getListFatawaQueryKey() });
    } catch (err) {
      setAnswerError(err instanceof Error ? err.message : "Failed to submit answer.");
    } finally {
      setAnswerLoading(false);
    }
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
          <Button onClick={() => { setOpen(true); setSubmitError(null); }} className="gap-2" data-testid="button-ask-fatwa">
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

        {listError && !isLoading && (
          <Card className="border-destructive/40 border-card-border">
            <CardContent className="p-6 flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">Failed to load your questions. Please refresh the page.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !listError && (!fatawa || fatawa.length === 0) && (
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
            const questionText = (f as { questionText?: string; question?: string }).questionText ?? (f as { question?: string }).question ?? "";
            const answerTextVal = (f as { answerText?: string; answer?: string }).answerText ?? (f as { answer?: string }).answer ?? null;
            const isPending = f.status === "pending" || f.status === "assigned";
            return (
              <Card key={f.id} className="border-card-border" data-testid={`card-fatwa-${f.id}`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className="text-foreground font-medium leading-snug"
                      style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.05rem" }}
                      data-testid={`text-fatwa-question-${f.id}`}
                    >
                      {questionText}
                    </p>
                    <Badge variant={meta.variant} className="shrink-0 gap-1" data-testid={`badge-fatwa-status-${f.id}`}>
                      <StatusIcon className="h-3 w-3" />
                      {t(meta.label)}
                    </Badge>
                  </div>
                  {f.category && (
                    <Badge variant="outline" className="text-xs">{f.category}</Badge>
                  )}
                  {answerTextVal && (
                    <div
                      className="mt-2 p-4 rounded-lg bg-primary/5 border border-primary/20 text-foreground text-sm leading-relaxed"
                      data-testid={`text-fatwa-answer-${f.id}`}
                    >
                      <div className="text-xs text-primary font-medium uppercase tracking-wide mb-2">
                        {t("fatawa.ruling")}
                      </div>
                      {answerTextVal}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {timeAgo(f.createdAt as string, t)}
                    </div>
                    {/* زر الإجابة للمفتي والأدمن */}
                    {isMuftiOrAdmin && isPending && (
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => {
                          setSelectedFatwaId(f.id);
                          setAnswerText("");
                          setAnswerError(null);
                          setAnswerOpen(true);
                        }}
                      >
                        <Send className="h-3 w-3" />
                        إجابة
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Dialog سؤال جديد */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSubmitError(null); }}>
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
              <Label>{t("fatawa.category")}</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t("fatawa.categoryPlaceholder")}
                maxLength={100}
                data-testid="input-fatwa-category"
              />
              <p className="text-xs text-muted-foreground">e.g. Fiqh, Aqeedah, Hadith, Tazkiyah</p>
            </div>
            {submitError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {submitError}
              </div>
            )}
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

      {/* Dialog إجابة المفتي */}
      <Dialog open={answerOpen} onOpenChange={(v) => { setAnswerOpen(v); if (!v) setAnswerError(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--app-font-serif)" }}>
              الإجابة على السؤال
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>نص الإجابة</Label>
              <Textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="اكتب إجابتك هنا..."
                rows={6}
                maxLength={5000}
                required
              />
            </div>
            {answerError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {answerError}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAnswerOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={!answerText.trim() || answerLoading}>
                {answerLoading ? "جاري الإرسال..." : "إرسال الإجابة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
