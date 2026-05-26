import { useState } from "react";
import { Link } from "wouter";
import { GraduationCap, Trophy, ChevronRight, Plus, Trash2, PlusCircle } from "lucide-react";
import {
  useGetTestLeaderboard,
  getGetTestLeaderboardQueryKey,
  useListTestsWithParams,
  getListTestsWithParamsQueryKey,
  useCreateTest,
  type TestSubject,
  type TestSummaryLevel,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { useSEO } from "@/hooks/use-seo";
import { useTranslation } from "@/lib/i18n";

const levelStyles: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  intermediate: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  advanced: "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200",
};

const subjectStyles: Record<string, string> = {
  aqeedah: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  fiqh: "bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200",
  hadith: "bg-teal-100 text-teal-900 dark:bg-teal-900/30 dark:text-teal-200",
};

type QuestionDraft = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

function emptyQuestion(): QuestionDraft {
  return { prompt: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" };
}

const SUBJECTS: Array<{ value: TestSubject | "all"; labelKey: string }> = [
  { value: "all", labelKey: "tests.subject.all" },
  { value: "aqeedah", labelKey: "tests.subject.aqeedah" },
  { value: "fiqh", labelKey: "tests.subject.fiqh" },
  { value: "hadith", labelKey: "tests.subject.hadith" },
];

export default function TestsPage() {
  useRequireAuth();
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  useSEO({
    titleAr: "الاختبارات والمسابقات | مجتمع طلاب العلم الشرعي",
    titleEn: "Tests & Quizzes | Tollabal3ilm Community",
    descAr: "اختبر فهمك في العقيدة والفقه والحديث — أسئلة مصحّحة مع شرح الإجابات",
    descEn: "Test your knowledge of aqeedah, fiqh and hadith with graded questions and explained answers",
    path: "/tests",
  });
  const queryClient = useQueryClient();

  const [activeSubject, setActiveSubject] = useState<TestSubject | "all">("all");
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLevel, setFormLevel] = useState<TestSummaryLevel>("beginner");
  const [formSubject, setFormSubject] = useState<TestSubject>("aqeedah");
  const [formQuestions, setFormQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const params = activeSubject === "all" ? undefined : { subject: activeSubject };
  const { data: tests, isLoading } = useListTestsWithParams(params, {
    query: { queryKey: getListTestsWithParamsQueryKey(params) },
  });
  const { data: leaderboard } = useGetTestLeaderboard({
    query: { queryKey: getGetTestLeaderboardQueryKey() },
  });

  const createMutation = useCreateTest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
        setFormSuccess(true);
        setTimeout(() => {
          setShowCreate(false);
          setFormSuccess(false);
          resetForm();
        }, 1500);
      },
      onError: (err) => {
        setFormError((err as Error).message ?? "Failed to create test");
      },
    },
  });

  function resetForm() {
    setFormTitle("");
    setFormDesc("");
    setFormLevel("beginner");
    setFormSubject("aqeedah");
    setFormQuestions([emptyQuestion()]);
    setFormError(null);
    setFormSuccess(false);
  }

  function addQuestion() {
    setFormQuestions((qs) => [...qs, emptyQuestion()]);
  }

  function removeQuestion(idx: number) {
    setFormQuestions((qs) => qs.filter((_, i) => i !== idx));
  }

  function updateQuestion(idx: number, patch: Partial<QuestionDraft>) {
    setFormQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  function updateOption(qIdx: number, optIdx: number, val: string) {
    setFormQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? val : o)) }
          : q,
      ),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!formTitle.trim()) { setFormError("Title is required"); return; }
    for (let i = 0; i < formQuestions.length; i++) {
      const q = formQuestions[i];
      if (!q.prompt.trim()) { setFormError(`Question ${i + 1} prompt is required`); return; }
      if (q.options.filter((o) => o.trim()).length < 2) {
        setFormError(`Question ${i + 1} needs at least 2 answer options`);
        return;
      }
    }
    createMutation.mutate({
      data: {
        title: formTitle,
        description: formDesc || null,
        level: formLevel,
        subject: formSubject,
        questions: formQuestions.map((q, idx) => ({
          prompt: q.prompt,
          options: q.options.filter((o) => o.trim()),
          correctIndex: q.correctIndex,
          explanation: q.explanation || null,
          order: idx,
        })),
      },
    });
  }

  return (
    <AppLayout>
      <PageHeader
        title={t("tests.title")}
        arabicLabel={t("ar.tests")}
        subtitle={t("tests.subtitle")}
      />

      {/* Subject filter tabs */}
      <div className="px-6 lg:px-10 pt-4 max-w-5xl mx-auto flex flex-wrap gap-2 items-center">
        {SUBJECTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setActiveSubject(s.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeSubject === s.value
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-card-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {t(s.labelKey as Parameters<typeof t>[0])}
          </button>
        ))}

        {user?.isAdmin && (
          <Button
            size="sm"
            className="ml-auto gap-1"
            onClick={() => { resetForm(); setShowCreate(true); }}
          >
            <Plus className="h-4 w-4" />
            {t("tests.create.button")}
          </Button>
        )}
      </div>

      <div className="px-6 lg:px-10 py-6 max-w-5xl mx-auto grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-3">
          {isLoading && <Skeleton className="h-32 w-full" />}
          {!isLoading && tests?.length === 0 && (
            <Card className="border-card-border">
              <CardContent className="p-6 text-center text-muted-foreground">
                {t("tests.noTests")}
              </CardContent>
            </Card>
          )}
          {tests?.map((tst) => (
            <Link key={tst.id} href={`/tests/${tst.id}`} data-testid={`link-test-${tst.id}`} className="block group">
              <Card className="border-card-border hover:border-primary transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={levelStyles[tst.level]} data-testid={`badge-level-${tst.id}`}>
                        {t(`tests.level.${tst.level}`)}
                      </Badge>
                      <Badge className={subjectStyles[tst.subject ?? "aqeedah"]} variant="outline">
                        {t(`tests.subject.${tst.subject ?? "aqeedah"}` as Parameters<typeof t>[0])}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tst.questionCount} {t("common.questions")}
                      </span>
                    </div>
                    <h3
                      className="text-lg text-foreground group-hover:text-primary transition-colors"
                      style={{ fontFamily: "var(--app-font-serif)" }}
                      data-testid={`text-test-title-${tst.id}`}
                    >
                      {tst.title}
                    </h3>
                    {tst.description && (
                      <p className="text-sm text-muted-foreground mt-1">{tst.description}</p>
                    )}
                  </div>
                  <ChevronRight
                    className={
                      lang === "ar"
                        ? "h-5 w-5 text-muted-foreground group-hover:text-primary rotate-180"
                        : "h-5 w-5 text-muted-foreground group-hover:text-primary"
                    }
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <aside>
          <Card className="border-card-border" data-testid="card-leaderboard">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-secondary" />
                <h3
                  className="text-lg text-foreground"
                  style={{ fontFamily: "var(--app-font-serif)" }}
                >
                  {t("tests.leaderboard")}
                </h3>
              </div>
              {!leaderboard || leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("tests.leaderboardEmpty")}
                </p>
              ) : (
                <ol className="space-y-3">
                  {leaderboard.slice(0, 10).map((entry, idx) => (
                    <li
                      key={entry.user.id}
                      className="flex items-center gap-3"
                      data-testid={`row-leaderboard-${entry.user.id}`}
                    >
                      <span className="w-5 text-center text-sm font-semibold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <InitialsAvatar name={entry.user.displayName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{entry.user.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {t("tests.bestLine", {
                            pct: entry.bestPercentage,
                            attempts: entry.attemptsCount,
                          })}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {entry.totalScore}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Create Test Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => { if (!o) { setShowCreate(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--app-font-serif)" }}>
              {t("tests.create.title")}
            </DialogTitle>
          </DialogHeader>

          {formSuccess ? (
            <div className="py-8 text-center text-primary font-medium">
              {t("tests.create.success")}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              {/* Title */}
              <div className="space-y-1.5">
                <Label>{t("tests.create.name")}</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={t("tests.create.namePlaceholder")}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label>{t("tests.create.description")}</Label>
                <Textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Subject + Level row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t("tests.create.subject")}</Label>
                  <Select value={formSubject} onValueChange={(v) => setFormSubject(v as TestSubject)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aqeedah">{t("tests.subject.aqeedah")}</SelectItem>
                      <SelectItem value="fiqh">{t("tests.subject.fiqh")}</SelectItem>
                      <SelectItem value="hadith">{t("tests.subject.hadith")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("tests.create.level")}</Label>
                  <Select value={formLevel} onValueChange={(v) => setFormLevel(v as TestSummaryLevel)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">{t("tests.level.beginner")}</SelectItem>
                      <SelectItem value="intermediate">{t("tests.level.intermediate")}</SelectItem>
                      <SelectItem value="advanced">{t("tests.level.advanced")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">{t("tests.create.questions")}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    {t("tests.create.addQuestion")}
                  </Button>
                </div>

                {formQuestions.map((q, qi) => (
                  <Card key={qi} className="border-card-border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          {t("tests.create.questionPrompt", { n: qi + 1 })}
                        </span>
                        {formQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qi)}
                            className="text-xs text-destructive hover:underline"
                          >
                            {t("tests.create.removeQuestion")}
                          </button>
                        )}
                      </div>

                      <Textarea
                        value={q.prompt}
                        onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
                        placeholder={t("tests.create.questionPlaceholder")}
                        rows={2}
                        required
                      />

                      {/* Answer options */}
                      <RadioGroup
                        value={String(q.correctIndex)}
                        onValueChange={(v) => updateQuestion(qi, { correctIndex: Number(v) })}
                      >
                        <p className="text-xs text-muted-foreground mb-1">
                          {t("tests.create.correctAnswer")}
                        </p>
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <RadioGroupItem value={String(oi)} id={`q${qi}-opt${oi}`} />
                            <Input
                              value={opt}
                              onChange={(e) => updateOption(qi, oi, e.target.value)}
                              placeholder={t("tests.create.answer", { n: oi + 1 })}
                              className="flex-1 h-8 text-sm"
                            />
                          </div>
                        ))}
                      </RadioGroup>

                      {/* Explanation */}
                      <div className="space-y-1">
                        <Label className="text-xs">{t("tests.create.explanation")}</Label>
                        <Input
                          value={q.explanation}
                          onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                          placeholder={t("tests.create.explanationPlaceholder")}
                          className="text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t("tests.create.submitting") : t("tests.create.submit")}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
