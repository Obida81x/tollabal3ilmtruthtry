import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, MapPin, Calendar, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetUser,
  getGetUserQueryKey,
  useUpdateMyProfile,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Badge } from "@/components/ui/badge";
import { ArabesqueDivider } from "@/components/Pattern";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function ProfilePage() {
  useRequireAuth();
  const { user: me, refresh } = useAuth();
  const { t, lang } = useTranslation();
  const [, params] = useRoute<{ id: string }>("/profile/:id");
  const id = params?.id ? Number(params.id) : 0;
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetUser(id, {
    query: { enabled: !!id, queryKey: getGetUserQueryKey(id) },
  });
  const updateProfile = useUpdateMyProfile();

  const isOwn = !!me && !!user && me.id === user.id;
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    country: "",
    bio: "",
    avatarUrl: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setForm({
        displayName: user.displayName ?? "",
        email: user.email ?? "",
        country: user.country ?? "",
        bio: user.bio ?? "",
        avatarUrl: user.avatarUrl ?? "",
      });
      setError(null);
    }
  }, [open, user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    updateProfile.mutate(
      {
        data: {
          displayName: form.displayName.trim(),
          email: form.email.trim() || undefined,
          country: form.country.trim() || null,
          bio: form.bio.trim() || null,
          avatarUrl: form.avatarUrl.trim() || null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(id) });
          queryClient.invalidateQueries({
            queryKey: getGetCurrentUserQueryKey(),
          });
          refresh();
          setOpen(false);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : t("profile.saveFailed"));
        },
      },
    );
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto">
        <Link href="/members" data-testid="link-back-members">
          <Button variant="ghost" size="sm" className="gap-1 mb-4">
            <BackIcon className="h-4 w-4" /> {t("members.allMembers")}
          </Button>
        </Link>
        {isLoading && <Skeleton className="h-64 w-full" />}
        {user && (
          <Card className="border-card-border">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center">
                <InitialsAvatar name={user.displayName} size="xl" />
                <h1
                  className="text-3xl text-foreground mt-4"
                  style={{ fontFamily: "var(--app-font-serif)" }}
                  data-testid="text-profile-name"
                >
                  {user.displayName}
                </h1>
                <div className="text-sm text-muted-foreground mt-1">
                  @{user.username}
                </div>
                <Badge variant="secondary" className="mt-3" data-testid="badge-profile-gender">
                  {user.gender === "male" ? t("common.brother") : t("common.sister")}
                </Badge>
                {isOwn && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-2"
                    onClick={() => setOpen(true)}
                    data-testid="button-edit-profile"
                  >
                    <Pencil className="h-4 w-4" />
                    {t("profile.editButton")}
                  </Button>
                )}
                <ArabesqueDivider className="my-6 w-full max-w-xs" />
                <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
                  {user.country && (
                    <div className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {user.country}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />{" "}
                    {t("profile.joined", {
                      date: formatDateTime(
                        user.createdAt,
                        lang === "ar" ? "ar" : undefined,
                        t("common.tba"),
                      ),
                    })}
                  </div>
                </div>
                {user.bio && (
                  <p
                    className="mt-6 text-foreground leading-relaxed max-w-xl"
                    style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.1rem" }}
                    data-testid="text-profile-bio"
                  >
                    {user.bio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("profile.editTitle")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="edit-displayName">
                  {t("profile.fieldDisplayName")}
                </Label>
                <Input
                  id="edit-displayName"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                  minLength={2}
                  maxLength={60}
                  required
                  data-testid="input-edit-display-name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">{t("profile.fieldEmail")}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={254}
                  data-testid="input-edit-email"
                />
              </div>
              <div>
                <Label htmlFor="edit-country">
                  {t("profile.fieldCountry")}
                </Label>
                <Input
                  id="edit-country"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  data-testid="input-edit-country"
                />
              </div>
              <div>
                <Label htmlFor="edit-bio">{t("profile.fieldBio")}</Label>
                <Textarea
                  id="edit-bio"
                  rows={3}
                  maxLength={280}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  data-testid="input-edit-bio"
                />
              </div>
              <div>
                <Label htmlFor="edit-avatar">
                  {t("profile.fieldAvatar")}
                </Label>
                <Input
                  id="edit-avatar"
                  type="url"
                  value={form.avatarUrl}
                  onChange={(e) =>
                    setForm({ ...form, avatarUrl: e.target.value })
                  }
                  placeholder="https://"
                  data-testid="input-edit-avatar"
                />
              </div>
              {error && (
                <div
                  className="text-sm text-destructive"
                  data-testid="text-edit-profile-error"
                >
                  {error}
                </div>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-testid="button-edit-profile-cancel"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  data-testid="button-edit-profile-save"
                >
                  {updateProfile.isPending
                    ? t("profile.saving")
                    : t("profile.save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
