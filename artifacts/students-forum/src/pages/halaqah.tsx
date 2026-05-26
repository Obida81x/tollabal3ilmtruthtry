import { useState } from "react";
import { Link } from "wouter";
import { MessagesSquare, ChevronRight, Plus, Users, UserCheck } from "lucide-react";
import {
  useListChatGroupsWithParams,
  getListChatGroupsWithParamsQueryKey,
  useCreateChatGroup,
  type ListChatGroupsParams,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useRequireAuth } from "@/lib/auth";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { timeAgo } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function HalaqahListPage() {
  useRequireAuth();
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const queryClient = useQueryClient();

  // Main admin can switch gender view; others always see their own section
  const [viewGender, setViewGender] = useState<"male" | "female">(
    (user?.gender as "male" | "female") ?? "male",
  );

  const params: ListChatGroupsParams | undefined = user?.isMainAdmin
    ? { gender: viewGender }
    : undefined;

  const { data: groups, isLoading } = useListChatGroupsWithParams(params, {
    query: { queryKey: getListChatGroupsWithParamsQueryKey(params) },
  });

  const isBrothers = user?.isMainAdmin ? viewGender === "male" : user?.gender === "male";

  // Create halaqah form
  const [showCreate, setShowCreate] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formGender, setFormGender] = useState<"male" | "female">("male");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const createMutation = useCreateChatGroup({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/groups"] });
        setFormSuccess(true);
        setTimeout(() => {
          setShowCreate(false);
          setFormSuccess(false);
          resetForm();
        }, 1500);
      },
      onError: (err) => {
        setFormError((err as Error).message ?? "Failed to create halaqah");
      },
    },
  });

  function resetForm() {
    setFormName("");
    setFormDesc("");
    setFormGender("male");
    setFormError(null);
    setFormSuccess(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!formName.trim()) { setFormError("Name is required"); return; }
    createMutation.mutate({ data: { name: formName, description: formDesc || null, gender: formGender } });
  }

  return (
    <AppLayout>
      <PageHeader
        title={isBrothers ? t("halaqah.brothersTitle") : t("halaqah.sistersTitle")}
        arabicLabel={isBrothers ? t("ar.brothersHalaqahs") : t("ar.sistersHalaqahs")}
        subtitle={t("halaqah.subtitle")}
      />
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto space-y-3">

        {/* Gender toggle — main admin only */}
        {user?.isMainAdmin && (
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-muted-foreground">{t("halaqah.viewingSection")}</span>
            <div className="flex rounded-md border border-card-border overflow-hidden">
              <button
                onClick={() => setViewGender("male")}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewGender === "male"
                    ? "bg-blue-500 text-white"
                    : "bg-card text-muted-foreground hover:bg-blue-50"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                {t("halaqah.create.male")}
              </button>
              <button
                onClick={() => setViewGender("female")}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewGender === "female"
                    ? "bg-pink-500 text-white"
                    : "bg-card text-muted-foreground hover:bg-pink-50"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                {t("halaqah.create.female")}
              </button>
            </div>

            {user?.isAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="ml-auto gap-1"
                onClick={() => { resetForm(); setShowCreate(true); }}
              >
                <Plus className="h-4 w-4" />
                {t("halaqah.create.button")}
              </Button>
            )}
          </div>
        )}

        {/* Admin create button (non-main-admin) */}
        {user?.isAdmin && !user?.isMainAdmin && (
          <div className="flex justify-end mb-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => { resetForm(); setShowCreate(true); }}
            >
              <Plus className="h-4 w-4" />
              {t("halaqah.create.button")}
            </Button>
          </div>
        )}

        <div
          className={
            "rounded-md border-l-4 px-4 py-3 text-sm flex items-center gap-3 " +
            (isBrothers
              ? "border-blue-500 bg-blue-500/10 text-blue-900 dark:text-blue-100"
              : "border-pink-500 bg-pink-500/10 text-pink-900 dark:text-pink-100")
          }
          data-testid="banner-gender"
        >
          <MessagesSquare className="h-4 w-4" />
          <span>
            {isBrothers
              ? t("halaqah.brothersBanner")
              : t("halaqah.sistersBanner")}
          </span>
        </div>
        {isLoading && (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        )}
        {groups?.map((g) => (
          <Link key={g.id} href={`/halaqah/${g.id}`} data-testid={`link-halaqah-${g.id}`} className="block group">
            <Card className="border-card-border hover:border-primary transition-colors">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <MessagesSquare className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className="font-medium text-foreground group-hover:text-primary transition-colors"
                      style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.1rem" }}
                      data-testid={`text-group-name-${g.id}`}
                    >
                      {g.name}
                    </h3>
                  </div>
                  {g.description && (
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {g.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" data-testid={`badge-members-${g.id}`}>
                      {t("halaqah.contributing", { n: g.memberCount })}
                    </Badge>
                    {g.lastMessageAt && (
                      <span>
                        {t("halaqah.lastMessage", { time: timeAgo(g.lastMessageAt, t) })}
                      </span>
                    )}
                  </div>
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
        {!isLoading && groups?.length === 0 && (
          <Card className="border-card-border">
            <CardContent className="p-6 text-center text-muted-foreground">
              {t("halaqah.empty")}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Halaqah Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => { if (!o) { setShowCreate(false); resetForm(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--app-font-serif)" }}>
              {t("halaqah.create.title")}
            </DialogTitle>
          </DialogHeader>

          {formSuccess ? (
            <div className="py-8 text-center text-primary font-medium">
              {t("halaqah.create.success")}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>{t("halaqah.create.name")}</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t("halaqah.create.namePlaceholder")}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("halaqah.create.description")}</Label>
                <Textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label>{t("halaqah.create.gender")}</Label>
                <Select value={formGender} onValueChange={(v) => setFormGender(v as "male" | "female")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("halaqah.create.male")}</SelectItem>
                    <SelectItem value="female">{t("halaqah.create.female")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <Button type="button" variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t("halaqah.create.submitting") : t("halaqah.create.submit")}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
