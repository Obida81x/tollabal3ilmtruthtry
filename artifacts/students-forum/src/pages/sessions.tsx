import { Link } from "wouter";
import { Video, Radio, Calendar } from "lucide-react";
import {
  useListMeetings,
  getListMeetingsQueryKey,
} from "@workspace/api-client-react";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

type Meeting = {
  id: number;
  title: string;
  description?: string | null;
  scholar: string;
  kind: "live" | "recorded";
  scheduledFor?: string | Date | null;
  durationMinutes?: number | null;
};

function MeetingList({ items, isLoading }: { items?: Meeting[]; isLoading: boolean }) {
  const { t, lang } = useTranslation();
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!items || items.length === 0) {
    return (
      <Card className="border-card-border">
        <CardContent className="p-6 text-center text-muted-foreground">
          {t("sessions.empty")}
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map((m) => (
        <Link key={m.id} href={`/sessions/${m.id}`} data-testid={`link-session-${m.id}`} className="block group">
            <Card className="border-card-border hover:border-primary transition-colors h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant={m.kind === "live" ? "default" : "secondary"}
                    className="gap-1"
                    data-testid={`badge-kind-${m.id}`}
                  >
                    {m.kind === "live" ? <Radio className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                    {t(`sessions.kind.${m.kind}`)}
                  </Badge>
                  {m.scheduledFor && (
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(m.scheduledFor, lang === "ar" ? "ar" : undefined, t("common.tba"))}
                    </span>
                  )}
                </div>
                <h3
                  className="text-lg text-foreground group-hover:text-primary transition-colors mb-1"
                  style={{ fontFamily: "var(--app-font-serif)" }}
                  data-testid={`text-session-title-${m.id}`}
                >
                  {m.title}
                </h3>
                <div className="text-sm text-muted-foreground">{m.scholar}</div>
                {m.description && (
                  <p className="mt-3 text-sm text-foreground/80 line-clamp-2">{m.description}</p>
                )}
              </CardContent>
            </Card>
          </Link>
      ))}
    </div>
  );
}

export default function SessionsPage() {
  useRequireAuth();
  const { t } = useTranslation();
  const live = useListMeetings(
    { kind: "live" },
    { query: { queryKey: getListMeetingsQueryKey({ kind: "live" }) } },
  );
  const recorded = useListMeetings(
    { kind: "recorded" },
    { query: { queryKey: getListMeetingsQueryKey({ kind: "recorded" }) } },
  );

  return (
    <AppLayout>
      <PageHeader
        title={t("sessions.title")}
        arabicLabel={t("ar.sittings")}
        subtitle={t("sessions.subtitle")}
      />
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
        <Tabs defaultValue="live">
          <TabsList data-testid="tabs-sessions">
            <TabsTrigger value="live" data-testid="tab-live">{t("sessions.tabLive")}</TabsTrigger>
            <TabsTrigger value="recorded" data-testid="tab-recorded">{t("sessions.tabRecorded")}</TabsTrigger>
          </TabsList>
          <TabsContent value="live" className="mt-6">
            <MeetingList items={live.data as Meeting[]} isLoading={live.isLoading} />
          </TabsContent>
          <TabsContent value="recorded" className="mt-6">
            <MeetingList items={recorded.data as Meeting[]} isLoading={recorded.isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
