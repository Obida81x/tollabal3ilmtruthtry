import { Link } from "wouter";
import { Users, Newspaper, BookOpen, Video, ArrowRight } from "lucide-react";
import { useAuth, useRequireAuth } from "@/lib/auth";
import {
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/PostCard";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function HomePage() {
  useRequireAuth();
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const { data, isLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });

  const stats = [
    { icon: Users, labelKey: "home.stat.members", value: data?.memberCount ?? 0, key: "members" },
    { icon: Newspaper, labelKey: "home.stat.posts", value: data?.postCount ?? 0, key: "posts" },
    { icon: BookOpen, labelKey: "home.stat.books", value: data?.bookCount ?? 0, key: "books" },
    { icon: Video, labelKey: "home.stat.sittings", value: data?.meetingCount ?? 0, key: "meetings" },
  ];

  return (
    <AppLayout>
      <PageHeader
        title={
          user ? t("home.greeting", { name: user.displayName }) : t("common.welcome")
        }
        arabicLabel={t("ar.salam")}
        subtitle={t("home.subtitle")}
      />
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.key} data-testid={`card-stat-${s.key}`} className="border-card-border">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div
                        className="text-2xl font-semibold text-foreground"
                        data-testid={`text-stat-${s.key}`}
                      >
                        {isLoading ? "—" : s.value}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t(s.labelKey)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-xl text-foreground"
                style={{ fontFamily: "var(--app-font-serif)" }}
              >
                {t("home.recentBenefits")}
              </h2>
              <Button asChild variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-feed">
                <Link href="/feed">
                  {t("home.viewFeed")}{" "}
                  <ArrowRight
                    className={lang === "ar" ? "h-4 w-4 rotate-180" : "h-4 w-4"}
                  />
                </Link>
              </Button>
            </div>
            {isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            )}
            {data?.recentPosts?.map((p) => <PostCard key={p.id} post={p} />)}
            {!isLoading && data?.recentPosts?.length === 0 && (
              <Card className="border-card-border">
                <CardContent className="p-6 text-center text-muted-foreground">
                  {t("home.noPostsYet")}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <h2
              className="text-xl text-foreground"
              style={{ fontFamily: "var(--app-font-serif)" }}
            >
              {t("home.upcomingSittings")}
            </h2>
            {isLoading && <Skeleton className="h-24 w-full" />}
            {data?.upcomingMeetings?.map((m) => (
              <Link key={m.id} href={`/sessions/${m.id}`} data-testid={`link-upcoming-meeting-${m.id}`}
                  className="block group">
                  <Card className="border-card-border hover:border-primary transition-colors">
                    <CardContent className="p-4">
                      <div className="text-xs text-secondary uppercase tracking-wide mb-1">
                        {formatDateTime(m.scheduledFor, lang === "ar" ? "ar" : undefined, t("common.tba"))}
                      </div>
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {m.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {m.scholar}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
            ))}
            {!isLoading && data?.upcomingMeetings?.length === 0 && (
              <Card className="border-card-border">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  {t("home.noLiveScheduled")}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
