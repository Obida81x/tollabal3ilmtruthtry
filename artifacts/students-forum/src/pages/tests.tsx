import { Link } from "wouter";
import { GraduationCap, Trophy, ChevronRight } from "lucide-react";
import {
  useListTests,
  useGetTestLeaderboard,
  getListTestsQueryKey,
  getGetTestLeaderboardQueryKey,
} from "@workspace/api-client-react";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/InitialsAvatar";

const levelStyles: Record<string, string> = {
  beginner: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
  intermediate: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  advanced: "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200",
};

export default function TestsPage() {
  useRequireAuth();
  const { data: tests, isLoading } = useListTests({
    query: { queryKey: getListTestsQueryKey() },
  });
  const { data: leaderboard } = useGetTestLeaderboard({
    query: { queryKey: getGetTestLeaderboardQueryKey() },
  });

  return (
    <AppLayout>
      <PageHeader
        title="Aqeedah Tests"
        arabicLabel="اختبارات العقيدة"
        subtitle="Test your understanding of the creed of Ahl as-Sunnah upon the methodology of the Salaf."
      />
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-3">
          {isLoading && <Skeleton className="h-32 w-full" />}
          {tests?.map((t) => (
            <Link key={t.id} href={`/tests/${t.id}`} data-testid={`link-test-${t.id}`} className="block group">
                <Card className="border-card-border hover:border-primary transition-colors">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={levelStyles[t.level]} data-testid={`badge-level-${t.id}`}>
                          {t.level}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {t.questionCount} questions
                        </span>
                      </div>
                      <h3
                        className="text-lg text-foreground group-hover:text-primary transition-colors"
                        style={{ fontFamily: "var(--app-font-serif)" }}
                        data-testid={`text-test-title-${t.id}`}
                      >
                        {t.title}
                      </h3>
                      {t.description && (
                        <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
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
                  Leaderboard
                </h3>
              </div>
              {!leaderboard || leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attempts yet — be the first.
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
                          Best: {entry.bestPercentage}% · {entry.attemptsCount} attempts
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
    </AppLayout>
  );
}
