import { useState } from "react";
import { Link } from "wouter";
import { MapPin } from "lucide-react";
import {
  useListUsers,
  getListUsersQueryKey,
} from "@workspace/api-client-react";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { useTranslation } from "@/lib/i18n";

export default function MembersPage() {
  useRequireAuth();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | "male" | "female">("all");
  const params = filter === "all" ? undefined : { gender: filter };
  const { data: users, isLoading } = useListUsers(params, {
    query: { queryKey: getListUsersQueryKey(params) },
  });

  return (
    <AppLayout>
      <PageHeader
        title={t("members.title")}
        arabicLabel={t("ar.members")}
        subtitle={t("members.subtitle")}
      />
      <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            data-testid="button-filter-all-members"
          >
            {t("common.all")}
          </Button>
          <Button
            variant={filter === "male" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("male")}
            data-testid="button-filter-brothers"
          >
            {t("common.brothers")}
          </Button>
          <Button
            variant={filter === "female" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("female")}
            data-testid="button-filter-sisters"
          >
            {t("common.sisters")}
          </Button>
        </div>
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users?.map((u) => (
            <Link key={u.id} href={`/profile/${u.id}`} data-testid={`link-member-${u.id}`} className="block group">
                <Card className="border-card-border hover:border-primary transition-colors h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <InitialsAvatar name={u.displayName} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium text-foreground group-hover:text-primary transition-colors truncate"
                          style={{ fontFamily: "var(--app-font-serif)" }}
                          data-testid={`text-member-name-${u.id}`}
                        >
                          {u.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">@{u.username}</div>
                      </div>
                    </div>
                    {u.country && (
                      <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {u.country}
                      </div>
                    )}
                    {u.bio && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{u.bio}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
