import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, Radio, Video, Calendar, Clock, ExternalLink } from "lucide-react";
import {
  useGetMeeting,
  getGetMeetingQueryKey,
} from "@workspace/api-client-react";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

function videoEmbed(url: string): string {
  if (url.includes("youtube.com/embed")) return url;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return url;
}

export default function SessionDetailPage() {
  useRequireAuth();
  const { t, lang } = useTranslation();
  const [, params] = useRoute<{ id: string }>("/sessions/:id");
  const id = params?.id ? Number(params.id) : 0;
  const { data: m, isLoading } = useGetMeeting(id, {
    query: { enabled: !!id, queryKey: getGetMeetingQueryKey(id) },
  });

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <AppLayout>
      <div className="px-6 lg:px-10 py-8 max-w-4xl mx-auto">
        <Link href="/sessions" data-testid="link-back-sessions">
            <Button variant="ghost" size="sm" className="gap-1 mb-4">
              <BackIcon className="h-4 w-4" /> {t("sessions.allSittings")}
            </Button>
          </Link>

        {isLoading && <Skeleton className="h-96 w-full" />}
        {m && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge variant={m.kind === "live" ? "default" : "secondary"} className="gap-1">
                {m.kind === "live" ? <Radio className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                {t(`sessions.kind.${m.kind}`)}
              </Badge>
              {m.scheduledFor && (
                <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />{" "}
                  {formatDateTime(m.scheduledFor, lang === "ar" ? "ar" : undefined, t("common.tba"))}
                </span>
              )}
              {m.durationMinutes && (
                <span className="text-sm text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {m.durationMinutes} {t("common.min")}
                </span>
              )}
            </div>
            <div>
              <h1
                className="text-3xl lg:text-4xl text-foreground"
                style={{ fontFamily: "var(--app-font-serif)" }}
                data-testid="text-session-title"
              >
                {m.title}
              </h1>
              <div className="text-secondary text-lg mt-2">{m.scholar}</div>
            </div>

            {m.kind === "recorded" && m.videoUrl && (
              <Card className="border-card-border overflow-hidden">
                <div className="aspect-video w-full">
                  <iframe
                    src={videoEmbed(m.videoUrl)}
                    title={m.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    data-testid="iframe-recording"
                  />
                </div>
              </Card>
            )}

            {m.kind === "live" && m.liveUrl && (
              <Card className="border-card-border bg-primary/5">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Radio className="h-5 w-5" />
                    <span className="font-medium">{t("sessions.liveLink")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("sessions.liveHelp")}
                  </p>
                  <Button asChild size="lg" className="gap-2" data-testid="button-join-live">
                    <a href={m.liveUrl} target="_blank" rel="noopener noreferrer">
                      {t("sessions.joinSitting")} <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {m.description && (
              <Card className="border-card-border">
                <CardContent className="p-6">
                  <p
                    className="text-foreground leading-relaxed"
                    style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.05rem" }}
                  >
                    {m.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
