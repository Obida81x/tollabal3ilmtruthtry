import { useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Award } from "lucide-react";
import {
  useGetTest,
  useSubmitTestAttempt,
  getGetTestQueryKey,
  getGetTestLeaderboardQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArabesqueDivider } from "@/components/Pattern";
import { useTranslation } from "@/lib/i18n";

type Result = {
  questionId: number;
  prompt: string;
  chosenIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation?: string | null;
};

type AttemptResult = {
  score: number;
  totalQuestions: number;
  percentage: number;
  results: Result[];
};

export default function TestDetailPage() {
  useRequireAuth();
  const { t, lang } = useTranslation();
  const [, params] = useRoute<{ id: string }>("/tests/:id");
  const id = params?.id ? Number(params.id) : 0;
  const queryClient = useQueryClient();

  const { data: test, isLoading } = useGetTest(id, {
    query: { enabled: !!id, queryKey: getGetTestQueryKey(id) },
  });
  const submit = useSubmitTestAttempt();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = test?.questions?.length ?? 0;
  const progress = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0;

  const handleSubmit = () => {
    if (!test) return;
    const orderedAnswers = test.questions.map((_q, idx) => answers[idx] ?? -1);
    submit.mutate(
      { id, data: { answers: orderedAnswers } },
      {
        onSuccess: (res) => {
          setResult(res as AttemptResult);
          queryClient.invalidateQueries({ queryKey: getGetTestLeaderboardQueryKey() });
        },
      },
    );
  };

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <AppLayout>
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        <Link href="/tests" data-testid="link-back-tests">
            <Button variant="ghost" size="sm" className="gap-1 mb-4">
              <BackIcon className="h-4 w-4" /> {t("tests.allTests")}
            </Button>
          </Link>
        {isLoading && <Skeleton className="h-96 w-full" />}
        {test && !result && (
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">{t(`tests.level.${test.level}`)}</Badge>
              <h1
                className="text-3xl text-foreground"
                style={{ fontFamily: "var(--app-font-serif)" }}
                data-testid="text-test-title"
              >
                {test.title}
              </h1>
              {test.description && (
                <p className="text-muted-foreground mt-2">{test.description}</p>
              )}
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>
                  {t("tests.answeredOf", { answered: totalAnswered, total: totalQuestions })}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} data-testid="progress-quiz" />
            </div>
            <div className="space-y-4">
              {test.questions.map((q, idx) => (
                <Card key={q.id} className="border-card-border" data-testid={`card-question-${q.id}`}>
                  <CardContent className="p-5">
                    <div className="text-xs text-muted-foreground mb-1">
                      {t("tests.question", { n: idx + 1 })}
                    </div>
                    <p
                      className="text-foreground mb-4"
                      style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.1rem" }}
                      data-testid={`text-prompt-${q.id}`}
                    >
                      {q.prompt}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const selected = answers[idx] === oIdx;
                        return (
                          <button
                            type="button"
                            key={oIdx}
                            onClick={() => setAnswers({ ...answers, [idx]: oIdx })}
                            data-testid={`option-${q.id}-${oIdx}`}
                            className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${
                              selected
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border bg-card hover:border-primary/50"
                            }`}
                          >
                            <span className="text-sm">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={totalAnswered < totalQuestions || submit.isPending}
              data-testid="button-submit-test"
            >
              {submit.isPending ? t("tests.grading") : t("tests.submit")}
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <Card className="border-card-border bg-primary/5">
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 mx-auto text-secondary mb-3" />
                <div
                  className="text-secondary text-lg mb-1"
                  style={{ fontFamily: "var(--app-font-serif)" }}
                >
                  {t("tests.barakAllah")}
                </div>
                <h2
                  className="text-3xl text-foreground"
                  style={{ fontFamily: "var(--app-font-serif)" }}
                  data-testid="text-result-title"
                >
                  {t("tests.yourResult")}
                </h2>
                <div className="mt-4 text-5xl font-semibold text-primary" data-testid="text-result-score">
                  {result.score} / {result.totalQuestions}
                </div>
                <div className="text-lg text-muted-foreground mt-1" data-testid="text-result-percentage">
                  {result.percentage}%
                </div>
                <ArabesqueDivider className="mt-6" />
              </CardContent>
            </Card>
            <div className="space-y-3">
              {result.results.map((r, idx) => (
                <Card
                  key={r.questionId}
                  className={`border-card-border ${r.isCorrect ? "border-l-4 border-l-primary" : "border-l-4 border-l-destructive"}`}
                  data-testid={`card-result-${r.questionId}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-2 mb-2">
                      {r.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground">
                          {t("tests.question", { n: idx + 1 })}
                        </div>
                        <p
                          className="text-foreground"
                          style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.05rem" }}
                        >
                          {r.prompt}
                        </p>
                      </div>
                    </div>
                    {r.explanation && (
                      <div className="ml-7 mt-3 p-3 rounded-md bg-muted text-sm text-foreground/90 leading-relaxed">
                        <span className="font-semibold text-secondary">
                          {t("common.explanation")}:{" "}
                        </span>
                        {r.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1" data-testid="button-back-to-tests">
                <Link href="/tests">{t("tests.backToTests")}</Link>
              </Button>
              <Button
                onClick={() => {
                  setAnswers({});
                  setResult(null);
                }}
                className="flex-1"
                data-testid="button-retake"
              >
                {t("tests.retake")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
