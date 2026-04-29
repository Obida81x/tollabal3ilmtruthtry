import { Link, useRoute } from "wouter";
import { ArrowLeft, ArrowRight, MapPin, Calendar } from "lucide-react";
import {
  useGetUser,
  getGetUserQueryKey,
} from "@workspace/api-client-react";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Badge } from "@/components/ui/badge";
import { ArabesqueDivider } from "@/components/Pattern";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function ProfilePage() {
  useRequireAuth();
  const { t, lang } = useTranslation();
  const [, params] = useRoute<{ id: string }>("/profile/:id");
  const id = params?.id ? Number(params.id) : 0;
  const { data: user, isLoading } = useGetUser(id, {
    query: { enabled: !!id, queryKey: getGetUserQueryKey(id) },
  });

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

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
                <div className="text-sm text-muted-foreground mt-1">@{user.username}</div>
                <Badge variant="secondary" className="mt-3" data-testid="badge-profile-gender">
                  {user.gender === "male" ? t("common.brother") : t("common.sister")}
                </Badge>
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
      </div>
    </AppLayout>
  );
}
