import { useState } from "react";
import { Shield, ShieldCheck, ShieldOff, Lock, Star, Loader2 } from "lucide-react";
import {
  useAdminLogin,
  useAdminListUsers,
  useAdminSetAdmin,
  useAdminSetActive,
  getAdminListUsersQueryKey,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Skeleton } from "@/components/ui/skeleton";
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

function AdminTable({ me }: { me: NonNullable<ReturnType<typeof useAuth>["user"]> }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminListUsers({
    query: { queryKey: getAdminListUsersQueryKey() },
  });
  const setAdmin = useAdminSetAdmin();
  const setActive = useAdminSetActive();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
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
          <AdminTable me={me} />
        )}
      </div>
    </AppLayout>
  );
}
