import { useState } from "react";
import { Link } from "wouter";
import { Video, Radio, Calendar, Plus } from "lucide-react";
import {
  useListMeetings,
  useCreateMeeting,
  getListMeetingsQueryKey,
  getListUpcomingMeetingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRequireAuth, useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

function CreateLiveBroadcastDialog() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const create = useCreateMeeting();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [scholar, setScholar] = useState(user?.displayName ?? "");
  const [description, setDescription] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setScholar(user?.displayName ?? "");
    setDescription("");
    setLiveUrl("");
    setScheduledFor("");
    setDurationMinutes("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^https?:\/\/(?:www\.)?meet\.google\.com\//.test(liveUrl.trim())) {
      setError(t("sessions.create.invalidLink"));
      return;
    }
    create.mutate(
      {
        data: {
          title: title.trim(),
          scholar: scholar.trim() || user?.displayName || "",
          description: description.trim() || null,
          liveUrl: liveUrl.trim(),
          scheduledFor: scheduledFor
            ? new Date(scheduledFor).toISOString()
            : null,
          durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getListMeetingsQueryKey({ kind: "live" }),
          });
          queryClient.invalidateQueries({
            queryKey: getListMeetingsQueryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: getListUpcomingMeetingsQueryKey(),
          });
          reset();
          setOpen(false);
        },
        onError: (err) => {
          const msg =
            (err as { message?: string })?.message ??
            t("sessions.create.failed");
          setError(msg);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button data-testid="button-open-create-meeting" className="gap-1">
          <Plus className="h-4 w-4" />
          {t("sessions.create.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("sessions.create.title")}</DialogTitle>
          <DialogDescription>{t("sessions.create.help")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="meeting-title">{t("sessions.create.titleField")}</Label>
            <Input
              id="meeting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              minLength={3}
              data-testid="input-meeting-title"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meeting-scholar">{t("sessions.create.scholar")}</Label>
            <Input
              id="meeting-scholar"
              value={scholar}
              onChange={(e) => setScholar(e.target.value)}
              maxLength={120}
              required
              data-testid="input-meeting-scholar"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meeting-description">
              {t("sessions.create.description")}
            </Label>
            <Textarea
              id="meeting-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              data-testid="input-meeting-description"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="meeting-link">{t("sessions.create.link")}</Label>
            <Input
              id="meeting-link"
              type="url"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              required
              data-testid="input-meeting-link"
            />
            <p className="text-xs text-muted-foreground">
              {t("sessions.create.linkHelp")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="meeting-when">{t("sessions.create.when")}</Label>
              <Input
                id="meeting-when"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                data-testid="input-meeting-when"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="meeting-duration">
                {t("sessions.create.duration")}
              </Label>
              <Input
                id="meeting-duration"
                type="number"
                min={1}
                max={600}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                data-testid="input-meeting-duration"
              />
            </div>
          </div>
          {error && (
            <p
              className="text-sm text-destructive"
              data-testid="text-meeting-error"
            >
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-meeting-cancel"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={create.isPending}
              data-testid="button-meeting-submit"
            >
              {create.isPending
                ? t("sessions.create.publishing")
                : t("sessions.create.publish")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SessionsPage() {
  useRequireAuth();
  const { t } = useTranslation();
  const { user } = useAuth();
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
        {user && (
          <div className="mb-4 flex justify-end">
            <CreateLiveBroadcastDialog />
          </div>
        )}
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
