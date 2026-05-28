import { useEffect, useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Lock,
  Star,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Video,
} from "lucide-react";
import {
  useAdminLogin,
  useAdminListUsers,
  useAdminSetAdmin,
  useAdminSetActive,
  useListMeetings,
  useListBooks,
  useAdminCreateMeeting,
  useAdminUpdateMeeting,
  useAdminDeleteMeeting,
  useAdminCreateBook,
  useAdminUpdateBook,
  useAdminDeleteBook,
  useAdminListMuftis,
  useAdminAssignMufti,
  useAdminRevokeMufti,
  useAdminListFatawa,
  useAnswerFatwa,
  usePublishFatwa,
  getAdminListUsersQueryKey,
  getGetCurrentUserQueryKey,
  getListMeetingsQueryKey,
  getListBooksQueryKey,
  getAdminListMuftisQueryKey,
  getAdminListFatawaQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n";

type AdminUser = {
  id: number;
  username: string;
  displayName: string;
  gender: "male" | "female";
  isAdmin: boolean;
  isMainAdmin: boolean;
  isActive: boolean;
  createdAt: string | Date;
};

type Meeting = {
  id: number;
  title: string;
  description: string | null;
  scholar: string;
  kind: "live" | "recorded";
  videoUrl: string | null;
  liveUrl: string | null;
  scheduledFor: string | Date | null;
  durationMinutes: number | null;
  coverImageUrl: string | null;
};

type Book = {
  id: number;
  title: string;
  author: string;
  description: string | null;
  coverImageUrl: string | null;
  fileUrl: string;
  pages: number | null;
  language: string;
  category: string;
};

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const login = useAdminLogin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    login.mutate(
      { data: { password } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetCurrentUserQueryKey(),
          });
          onSuccess();
        },
        onError: (err) => {
          setError(
            (err as { message?: string })?.message ?? t("admin.gate.invalid"),
          );
        },
      },
    );
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <Card className="border-card-border">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2
                className="text-xl"
                style={{ fontFamily: "var(--app-font-serif)" }}
              >
                {t("admin.gate.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("admin.gate.subtitle")}
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">{t("admin.gate.password")}</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-admin-password"
                autoFocus
              />
            </div>
            {error && (
              <p
                className="text-sm text-destructive"
                data-testid="text-admin-gate-error"
              >
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={!password || login.isPending}
              data-testid="button-admin-gate-submit"
            >
              {login.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("admin.gate.unlock")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminMembers({
  me,
}: {
  me: NonNullable<ReturnType<typeof useAuth>["user"]>;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminListUsers({
    query: { queryKey: getAdminListUsersQueryKey() },
  });
  const setAdmin = useAdminSetAdmin();
  const setActive = useAdminSetActive();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  const users = (data ?? []) as AdminUser[];

  return (
    <Card className="border-card-border">
      <CardContent className="p-0 divide-y divide-border">
        {users.map((u) => {
          const isSelf = u.id === me.id;
          const canChangeAdmin = me.isMainAdmin && !u.isMainAdmin && !isSelf;
          const canChangeActive =
            !u.isMainAdmin && !isSelf && (me.isMainAdmin || !u.isAdmin);
          return (
            <div
              key={u.id}
              data-testid={`admin-row-${u.id}`}
              className="flex items-center gap-4 p-4"
            >
              <InitialsAvatar name={u.displayName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium" data-testid={`admin-name-${u.id}`}>
                    {u.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{u.username}
                  </span>
                  {u.isMainAdmin && (
                    <Badge className="gap-1" data-testid={`badge-main-admin-${u.id}`}>
                      <Star className="h-3 w-3" /> {t("admin.role.main")}
                    </Badge>
                  )}
                  {u.isAdmin && !u.isMainAdmin && (
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="h-3 w-3" /> {t("admin.role.admin")}
                    </Badge>
                  )}
                  {!u.isActive && (
                    <Badge variant="destructive">{t("admin.role.inactive")}</Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      u.gender === "male"
                        ? "border-blue-500/40 text-blue-600 dark:text-blue-300"
                        : "border-pink-500/40 text-pink-600 dark:text-pink-300"
                    }
                  >
                    {u.gender === "male" ? t("common.brother") : t("common.sister")}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={u.isAdmin ? "secondary" : "outline"}
                  size="sm"
                  className="gap-1"
                  disabled={!canChangeAdmin || setAdmin.isPending}
                  onClick={() =>
                    setAdmin.mutate(
                      { id: u.id, data: { value: !u.isAdmin } },
                      { onSettled: invalidate },
                    )
                  }
                  data-testid={`button-toggle-admin-${u.id}`}
                  title={
                    !me.isMainAdmin
                      ? t("admin.role.onlyMain")
                      : u.isMainAdmin
                        ? t("admin.role.cannotChangeMain")
                        : ""
                  }
                >
                  <Shield className="h-4 w-4" />
                  {u.isAdmin ? t("admin.action.revokeAdmin") : t("admin.action.grantAdmin")}
                </Button>
                <Button
                  variant={u.isActive ? "outline" : "default"}
                  size="sm"
                  className="gap-1"
                  disabled={!canChangeActive || setActive.isPending}
                  onClick={() =>
                    setActive.mutate(
                      { id: u.id, data: { value: !u.isActive } },
                      { onSettled: invalidate },
                    )
                  }
                  data-testid={`button-toggle-active-${u.id}`}
                >
                  <ShieldOff className="h-4 w-4" />
                  {u.isActive ? t("admin.action.deactivate") : t("admin.action.activate")}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AdminMuftis() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: muftis, isLoading: loadingMuftis } = useAdminListMuftis({
    query: { queryKey: getAdminListMuftisQueryKey() },
  });
  const { data: allUsers, isLoading: loadingUsers } = useAdminListUsers({
    query: { queryKey: getAdminListUsersQueryKey() },
  });
  const assign = useAdminAssignMufti();
  const revoke = useAdminRevokeMufti();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getAdminListMuftisQueryKey() });
    queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
  };

  if (loadingMuftis || loadingUsers) return <Skeleton className="h-64 w-full" />;

  const muftiIds = new Set((muftis ?? []).map((m: { userId: number }) => m.userId));
  const users = (allUsers ?? []) as AdminUser[];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>
          {t("admin.muftis.heading")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("admin.muftis.subtitle")}</p>
      </div>
      <Card className="border-card-border">
        <CardContent className="p-0 divide-y divide-border">
          {users.map((u) => {
            const isMufti = muftiIds.has(u.id);
            return (
              <div key={u.id} className="flex items-center gap-4 p-4" data-testid={`mufti-row-${u.id}`}>
                <InitialsAvatar name={u.displayName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{u.displayName}</span>
                    <span className="text-xs text-muted-foreground">@{u.username}</span>
                    {isMufti && (
                      <Badge className="gap-1 bg-amber-600 hover:bg-amber-700">
                        <Star className="h-3 w-3" /> {t("admin.muftis.isMufti")}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={u.gender === "male" ? "border-blue-500/40 text-blue-600" : "border-pink-500/40 text-pink-600"}
                    >
                      {u.gender === "male" ? t("common.brother") : t("common.sister")}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant={isMufti ? "destructive" : "outline"}
                  size="sm"
                  className="gap-1"
                  disabled={assign.isPending || revoke.isPending}
                  onClick={() => {
                    if (isMufti) {
                      revoke.mutate({ userId: u.id }, { onSettled: invalidate });
                    } else {
                      assign.mutate({ data: { userId: u.id } }, { onSettled: invalidate });
                    }
                  }}
                  data-testid={`button-toggle-mufti-${u.id}`}
                >
                  {isMufti ? (
                    <><ShieldOff className="h-4 w-4" /> {t("admin.muftis.revoke")}</>
                  ) : (
                    <><ShieldCheck className="h-4 w-4" /> {t("admin.muftis.grant")}</>
                  )}
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminFatawaQueue() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: fatawa, isLoading } = useAdminListFatawa({
    query: { queryKey: getAdminListFatawaQueryKey() },
  });
  const answer = useAnswerFatwa();
  const publish = usePublishFatwa();

  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [draftAnswer, setDraftAnswer] = useState("");

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getAdminListFatawaQueryKey() });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const items = (fatawa ?? []) as Array<{
    id: number;
    questionText: string;
    status: string;
    category?: string | null;
    answerText?: string | null;
    answerAudioUrl?: string | null;
    createdAt: string | Date;
    askerName?: string | null;
  }>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>
          {t("admin.fatawa.heading")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("admin.fatawa.subtitle")}</p>
      </div>
      {items.length === 0 ? (
        <Card className="border-card-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            {t("admin.fatawa.empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <Card key={f.id} className="border-card-border" data-testid={`fatwa-admin-row-${f.id}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant={f.status === "answered" ? "default" : "secondary"}>
                        {f.status}
                      </Badge>
                      {f.category && (
                        <Badge variant="outline" className="text-xs">{f.category}</Badge>
                      )}
                      {f.askerName && (
                        <span className="text-xs text-muted-foreground">
                          {f.askerName}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground leading-relaxed">{f.questionText}</p>
                    {f.askerName && (
                      <p className="text-xs text-muted-foreground mt-1">{f.askerName}</p>
                    )}
                  </div>
                </div>
                {f.answerText && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                    <div className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
                      {t("admin.fatawa.answerLabel")}
                    </div>
                    {f.answerText}
                  </div>
                )}
                {f.answerAudioUrl && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                    <div className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
                      {t("admin.fatawa.answerLabel")}
                    </div>
                    <audio src={f.answerAudioUrl} controls className="h-8 w-full" />
                  </div>
                )}
                {answeringId === f.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={draftAnswer}
                      onChange={(e) => setDraftAnswer(e.target.value)}
                      placeholder={t("admin.fatawa.answerPlaceholder")}
                      rows={4}
                      data-testid={`input-fatwa-answer-${f.id}`}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={!draftAnswer.trim() || answer.isPending}
                        onClick={() => {
                          answer.mutate(
                            { id: f.id, data: { answerText: draftAnswer.trim() } },
                            {
                              onSuccess: () => {
                                setAnsweringId(null);
                                setDraftAnswer("");
                                invalidate();
                              },
                            },
                          );
                        }}
                        data-testid={`button-save-answer-${f.id}`}
                      >
                        {answer.isPending ? t("admin.fatawa.saving") : t("admin.fatawa.answer")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setAnsweringId(null); setDraftAnswer(""); }}
                      >
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => { setAnsweringId(f.id); setDraftAnswer(f.answerText ?? ""); }}
                      data-testid={`button-answer-${f.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                      {f.answerText ? t("common.details") : t("admin.fatawa.answer")}
                    </Button>
                    {f.answerText && f.status === "answered" && (
                      <Button
                        size="sm"
                        className="gap-1"
                        disabled={publish.isPending}
                        onClick={() =>
                          publish.mutate({ id: f.id }, { onSuccess: invalidate })
                        }
                        data-testid={`button-publish-fatwa-${f.id}`}
                      >
                        {publish.isPending ? t("admin.fatawa.publishing") : t("admin.fatawa.publish")}
                      </Button>
                    )}
                    {f.status === "published" && (
                      <Badge className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> {t("admin.fatawa.published")}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

type LessonForm = {
  title: string;
  scholar: string;
  description: string;
  videoUrl: string;
  coverImageUrl: string;
  scheduledFor: string;
  durationMinutes: string;
};

function LessonDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: LessonForm | null;
  onSubmit: (form: LessonForm) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const empty: LessonForm = {
    title: "",
    scholar: "",
    description: "",
    videoUrl: "",
    coverImageUrl: "",
    scheduledFor: "",
    durationMinutes: "",
  };
  const [form, setForm] = useState<LessonForm>(empty);

  useEffect(() => {
    if (open) setForm(initial ?? empty);
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? t("admin.lessons.editTitle") : t("admin.lessons.addTitle")}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="space-y-3"
        >
          <div>
            <Label>{t("admin.lessons.title")}</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              minLength={3}
              maxLength={200}
              data-testid="input-lesson-title"
            />
          </div>
          <div>
            <Label>{t("admin.lessons.scholar")}</Label>
            <Input
              value={form.scholar}
              onChange={(e) => setForm({ ...form, scholar: e.target.value })}
              required
              minLength={2}
              maxLength={120}
              data-testid="input-lesson-scholar"
            />
          </div>
          <div>
            <Label>{t("admin.lessons.videoUrl")}</Label>
            <Input
              type="url"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="https://"
              required
              data-testid="input-lesson-video-url"
            />
          </div>
          <div>
            <Label>{t("admin.lessons.description")}</Label>
            <Textarea
              rows={3}
              maxLength={2000}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              data-testid="input-lesson-description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("admin.lessons.scheduledFor")}</Label>
              <Input
                type="datetime-local"
                value={form.scheduledFor}
                onChange={(e) =>
                  setForm({ ...form, scheduledFor: e.target.value })
                }
                data-testid="input-lesson-date"
              />
            </div>
            <div>
              <Label>{t("admin.lessons.durationMinutes")}</Label>
              <Input
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: e.target.value })
                }
                data-testid="input-lesson-duration"
              />
            </div>
          </div>
          <div>
            <Label>{t("admin.lessons.coverImageUrl")}</Label>
            <Input
              type="url"
              value={form.coverImageUrl}
              onChange={(e) =>
                setForm({ ...form, coverImageUrl: e.target.value })
              }
              placeholder="https://"
              data-testid="input-lesson-cover"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending} data-testid="button-lesson-save">
              {initial ? t("admin.lessons.update") : t("admin.lessons.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminLessons() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useListMeetings(
    { kind: "recorded" },
    { query: { queryKey: getListMeetingsQueryKey({ kind: "recorded" }) } },
  );
  const create = useAdminCreateMeeting();
  const update = useAdminUpdateMeeting();
  const remove = useAdminDeleteMeeting();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: getListMeetingsQueryKey({ kind: "recorded" }),
    });
    queryClient.invalidateQueries({ queryKey: getListMeetingsQueryKey() });
  };

  const lessons = (data ?? []) as Meeting[];

  const initialForm: LessonForm | null = editing
    ? {
        title: editing.title,
        scholar: editing.scholar,
        description: editing.description ?? "",
        videoUrl: editing.videoUrl ?? "",
        coverImageUrl: editing.coverImageUrl ?? "",
        scheduledFor: editing.scheduledFor
          ? new Date(editing.scheduledFor).toISOString().slice(0, 16)
          : "",
        durationMinutes: editing.durationMinutes
          ? String(editing.durationMinutes)
          : "",
      }
    : null;

  const handleSubmit = (form: LessonForm) => {
    const payload = {
      title: form.title.trim(),
      scholar: form.scholar.trim(),
      description: form.description.trim() || null,
      videoUrl: form.videoUrl.trim(),
      coverImageUrl: form.coverImageUrl.trim() || null,
      scheduledFor: form.scheduledFor
        ? new Date(form.scheduledFor).toISOString()
        : null,
      durationMinutes: form.durationMinutes
        ? Number(form.durationMinutes)
        : null,
    };
    if (editing) {
      update.mutate(
        { id: editing.id, data: { ...payload, kind: "recorded" } },
        {
          onSuccess: () => {
            invalidate();
            setOpen(false);
            setEditing(null);
          },
        },
      );
    } else {
      create.mutate(
        { data: { ...payload, kind: "recorded" } },
        {
          onSuccess: () => {
            invalidate();
            setOpen(false);
          },
        },
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-xl"
            style={{ fontFamily: "var(--app-font-serif)" }}
          >
            {t("admin.lessons.heading")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("admin.lessons.subtitle")}
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          data-testid="button-add-lesson"
        >
          <Plus className="h-4 w-4" /> {t("admin.lessons.add")}
        </Button>
      </div>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : lessons.length === 0 ? (
        <Card className="border-card-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            {t("admin.lessons.empty")}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-card-border">
          <CardContent className="p-0 divide-y divide-border">
            {lessons.map((m) => (
              <div
                key={m.id}
                className="p-4 flex items-start gap-4"
                data-testid={`lesson-row-${m.id}`}
              >
                <Video className="h-5 w-5 mt-1 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.scholar}
                  </div>
                  {m.videoUrl && (
                    <a
                      href={m.videoUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs text-primary hover:underline break-all"
                    >
                      {m.videoUrl}
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => {
                      setEditing(m);
                      setOpen(true);
                    }}
                    data-testid={`button-edit-lesson-${m.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(t("admin.lessons.confirmDelete"))) {
                        remove.mutate(
                          { id: m.id },
                          { onSuccess: invalidate },
                        );
                      }
                    }}
                    data-testid={`button-delete-lesson-${m.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <LessonDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}
        initial={initialForm}
        onSubmit={handleSubmit}
        pending={create.isPending || update.isPending}
      />
    </div>
  );
}

type BookForm = {
  title: string;
  author: string;
  description: string;
  fileUrl: string;
  coverImageUrl: string;
  pages: string;
  language: string;
  category: string;
};

function BookDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: BookForm | null;
  onSubmit: (form: BookForm) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const empty: BookForm = {
    title: "",
    author: "",
    description: "",
    fileUrl: "",
    coverImageUrl: "",
    pages: "",
    language: "Arabic",
    category: "Aqeedah",
  };
  const [form, setForm] = useState<BookForm>(empty);

  useEffect(() => {
    if (open) setForm(initial ?? empty);
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? t("admin.books.editTitle") : t("admin.books.addTitle")}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="space-y-3"
        >
          <div>
            <Label>{t("admin.books.title")}</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              minLength={2}
              maxLength={200}
              data-testid="input-book-title"
            />
          </div>
          <div>
            <Label>{t("admin.books.author")}</Label>
            <Input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              required
              minLength={2}
              maxLength={200}
              data-testid="input-book-author"
            />
          </div>
          <div>
            <Label>{t("admin.books.fileUrl")}</Label>
            <Input
              type="url"
              value={form.fileUrl}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              placeholder="https://"
              required
              data-testid="input-book-file-url"
            />
          </div>
          <div>
            <Label>{t("admin.books.description")}</Label>
            <Textarea
              rows={3}
              maxLength={2000}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              data-testid="input-book-description"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("admin.books.language")}</Label>
              <Input
                value={form.language}
                onChange={(e) =>
                  setForm({ ...form, language: e.target.value })
                }
                required
                minLength={2}
                maxLength={32}
                data-testid="input-book-language"
              />
            </div>
            <div>
              <Label>{t("admin.books.category")}</Label>
              <Input
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                required
                minLength={2}
                maxLength={60}
                data-testid="input-book-category"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("admin.books.pages")}</Label>
              <Input
                type="number"
                min={1}
                value={form.pages}
                onChange={(e) => setForm({ ...form, pages: e.target.value })}
                data-testid="input-book-pages"
              />
            </div>
            <div>
              <Label>{t("admin.books.coverImageUrl")}</Label>
              <Input
                type="url"
                value={form.coverImageUrl}
                onChange={(e) =>
                  setForm({ ...form, coverImageUrl: e.target.value })
                }
                placeholder="https://"
                data-testid="input-book-cover"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={pending} data-testid="button-book-save">
              {initial ? t("admin.books.update") : t("admin.books.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminBooks() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useListBooks(
    {},
    { query: { queryKey: getListBooksQueryKey() } },
  );
  const create = useAdminCreateBook();
  const update = useAdminUpdateBook();
  const remove = useAdminDeleteBook();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListBooksQueryKey() });

  const books = (data ?? []) as Book[];

  const initialForm: BookForm | null = editing
    ? {
        title: editing.title,
        author: editing.author,
        description: editing.description ?? "",
        fileUrl: editing.fileUrl,
        coverImageUrl: editing.coverImageUrl ?? "",
        pages: editing.pages ? String(editing.pages) : "",
        language: editing.language,
        category: editing.category,
      }
    : null;

  const handleSubmit = (form: BookForm) => {
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      description: form.description.trim() || null,
      fileUrl: form.fileUrl.trim(),
      coverImageUrl: form.coverImageUrl.trim() || null,
      pages: form.pages ? Number(form.pages) : null,
      language: form.language.trim(),
      category: form.category.trim(),
    };
    if (editing) {
      update.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            invalidate();
            setOpen(false);
            setEditing(null);
          },
        },
      );
    } else {
      create.mutate(
        { data: payload },
        {
          onSuccess: () => {
            invalidate();
            setOpen(false);
          },
        },
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-xl"
            style={{ fontFamily: "var(--app-font-serif)" }}
          >
            {t("admin.books.heading")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("admin.books.subtitle")}
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          data-testid="button-add-book"
        >
          <Plus className="h-4 w-4" /> {t("admin.books.add")}
        </Button>
      </div>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : books.length === 0 ? (
        <Card className="border-card-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            {t("admin.books.empty")}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-card-border">
          <CardContent className="p-0 divide-y divide-border">
            {books.map((b) => (
              <div
                key={b.id}
                className="p-4 flex items-start gap-4"
                data-testid={`book-row-${b.id}`}
              >
                <BookOpen className="h-5 w-5 mt-1 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.author} · {b.category} · {b.language}
                  </div>
                  <a
                    href={b.fileUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs text-primary hover:underline break-all"
                  >
                    {b.fileUrl}
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => {
                      setEditing(b);
                      setOpen(true);
                    }}
                    data-testid={`button-edit-book-${b.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(t("admin.books.confirmDelete"))) {
                        remove.mutate(
                          { id: b.id },
                          { onSuccess: invalidate },
                        );
                      }
                    }}
                    data-testid={`button-delete-book-${b.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <BookDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}
        initial={initialForm}
        onSubmit={handleSubmit}
        pending={create.isPending || update.isPending}
      />
    </div>
  );
}

// ─── Admin Applications ───────────────────────────────────────────────────────

type AdminApplication = {
  id: number;
  userId: number;
  fullName: string;
  age: number;
  contactEmail: string;
  notes: string | null;
  reasons: string;
  status: "pending" | "approved" | "rejected";
  reviewedAt: string | null;
  createdAt: string;
  username: string | null;
  displayName: string | null;
  gender: string | null;
};

function AdminApplications() {
  const { t } = useTranslation();
  const [apps, setApps] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [messages, setMessages] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-applications", { credentials: "include" });
      const data = await res.json();
      if (res.ok) setApps(data);
      else setError(data.error ?? "Failed to load");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const review = async (id: number, status: "approved" | "rejected") => {
    setReviewing(id);
    try {
      const res = await fetch(`/api/admin-applications/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, message: messages[id] ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      fetchApps();
    } catch { setError("Network error"); }
    finally { setReviewing(null); }
  };

  const statusColor = (s: string) => s === "approved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" : s === "rejected" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";

  if (loading) return <div className="py-8 text-center text-muted-foreground"><Loader2 className="animate-spin h-5 w-5 mx-auto" /></div>;

  return (
    <div className="space-y-4">
      {error && <div className="text-sm text-destructive mb-2">{error}</div>}
      {apps.length === 0 && (
        <Card className="border-card-border">
          <CardContent className="p-6 text-center text-muted-foreground">{t("admin.applications.empty")}</CardContent>
        </Card>
      )}
      {apps.map((app) => (
        <Card key={app.id} className="border-card-border">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold" style={{ fontFamily: "var(--app-font-serif)" }}>{app.fullName}</span>
                  <span className="text-sm text-muted-foreground">@{app.username}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(app.status)}`}>
                    {t(`admin.applications.status.${app.status}` as Parameters<typeof t>[0])}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">Age: {app.age} · {app.contactEmail}</div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">{new Date(app.createdAt).toLocaleDateString()}</div>
            </div>

            <div className="bg-muted/40 rounded-md p-3 text-sm">
              <strong className="text-xs uppercase tracking-wide text-muted-foreground block mb-1">Reasons</strong>
              <p className="whitespace-pre-wrap">{app.reasons}</p>
              {app.notes && <><strong className="text-xs uppercase tracking-wide text-muted-foreground block mt-2 mb-1">Notes</strong><p className="whitespace-pre-wrap">{app.notes}</p></>}
            </div>

            {app.status === "pending" && (
              <div className="space-y-2">
                <Input
                  placeholder={t("admin.applications.messagePlaceholder")}
                  value={messages[app.id] ?? ""}
                  onChange={(e) => setMessages((m) => ({ ...m, [app.id]: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => review(app.id, "approved")} disabled={reviewing === app.id}>
                    {reviewing === app.id ? t("admin.applications.reviewing") : t("admin.applications.approve")}
                  </Button>
                  <Button size="sm" variant="outline" className="border-rose-300 text-rose-600 hover:bg-rose-50" onClick={() => review(app.id, "rejected")} disabled={reviewing === app.id}>
                    {t("admin.applications.reject")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Admin Settings ───────────────────────────────────────────────────────────

function AdminSupportMessages() {
  const [messages, setMessages] = useState<Array<{id: number; userId: number | null; username: string; message: string; sentAt: string; isRead: boolean}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support/messages", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setMessages(data);
    } catch {
      setError("Failed to load support messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  if (loading) return <div className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>;
  if (error) return <p className="text-destructive text-sm">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">رسائل الدعم الفني</h3>
        <Button variant="outline" size="sm" onClick={fetchMessages}>تحديث</Button>
      </div>
      {messages.length === 0 && (
        <Card className="border-card-border">
          <CardContent className="p-8 text-center text-muted-foreground">لا توجد رسائل بعد</CardContent>
        </Card>
      )}
      {messages.map((msg) => (
        <Card key={msg.id} className="border-card-border">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{msg.username}</span>
              <span className="text-xs text-muted-foreground">{new Date(msg.sentAt).toLocaleString("ar")}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{msg.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AdminSettings() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/support/contact-email").then(r => r.json()).then(d => { if (d.email) setEmail(d.email); });
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSaved(false); setLoading(true);
    try {
      const res = await fetch("/api/support/contact-email", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setSaved(true);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <Card className="border-card-border max-w-md">
      <CardContent className="p-6">
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label className="text-base font-semibold">{t("admin.settings.supportEmail")}</Label>
            <p className="text-xs text-muted-foreground mb-2">{t("admin.settings.supportEmailDesc")}</p>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && <p className="text-sm text-primary">{t("admin.settings.saved")}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? t("admin.settings.saving") : t("admin.settings.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const me = useRequireAuth();
  const { t } = useTranslation();
  const [unlocked, setUnlocked] = useState(false);

  if (!me) return null;

  const isAdminAlready = me.isAdmin === true;

  return (
    <AppLayout>
      <PageHeader
        title={t("admin.title")}
        arabicLabel={t("ar.adminPanel")}
        subtitle={t("admin.subtitle")}
      />
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
        {!isAdminAlready && !unlocked ? (
          <PasswordGate onSuccess={() => setUnlocked(true)} />
        ) : (
          <Tabs defaultValue="members">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="members" data-testid="tab-admin-members">
                {t("admin.tabs.members")}
              </TabsTrigger>
              <TabsTrigger value="muftis" data-testid="tab-admin-muftis">
                {t("admin.tabs.muftis")}
              </TabsTrigger>
              <TabsTrigger value="fatawa" data-testid="tab-admin-fatawa">
                {t("admin.tabs.fatawa")}
              </TabsTrigger>
              <TabsTrigger value="lessons" data-testid="tab-admin-lessons">
                {t("admin.tabs.lessons")}
              </TabsTrigger>
              <TabsTrigger value="books" data-testid="tab-admin-books">
                {t("admin.tabs.books")}
              </TabsTrigger>
              {me.isMainAdmin && (
                <TabsTrigger value="applications" data-testid="tab-admin-applications">
                  {t("admin.tabs.applications")}
                </TabsTrigger>
              )}
              {me.isMainAdmin && (
                <TabsTrigger value="support" data-testid="tab-admin-support">
                  الدعم الفني
                </TabsTrigger>
              )}
              {me.isMainAdmin && (
                <TabsTrigger value="settings" data-testid="tab-admin-settings">
                  {t("admin.tabs.settings")}
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="members">
              <AdminMembers me={me} />
            </TabsContent>
            <TabsContent value="muftis">
              <AdminMuftis />
            </TabsContent>
            <TabsContent value="fatawa">
              <AdminFatawaQueue />
            </TabsContent>
            <TabsContent value="lessons">
              <AdminLessons />
            </TabsContent>
            <TabsContent value="books">
              <AdminBooks />
            </TabsContent>
            {me.isMainAdmin && (
              <TabsContent value="applications">
                <AdminApplications />
              </TabsContent>
            )}
            {me.isMainAdmin && (
              <TabsContent value="support">
                <AdminSupportMessages />
              </TabsContent>
            )}
            {me.isMainAdmin && (
              <TabsContent value="settings">
                <AdminSettings />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
