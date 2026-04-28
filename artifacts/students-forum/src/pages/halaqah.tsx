import { Link } from "wouter";
import { MessagesSquare, ChevronRight } from "lucide-react";
import {
  useListChatGroups,
  getListChatGroupsQueryKey,
} from "@workspace/api-client-react";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

export default function HalaqahListPage() {
  useRequireAuth();
  const { user } = useAuth();
  const { data: groups, isLoading } = useListChatGroups({
    query: { queryKey: getListChatGroupsQueryKey() },
  });

  const isBrothers = user?.gender === "male";

  return (
    <AppLayout>
      <PageHeader
        title={isBrothers ? "Brothers' Halaqahs" : "Sisters' Halaqahs"}
        arabicLabel={isBrothers ? "حلقات الإخوة" : "حلقات الأخوات"}
        subtitle="Quiet study circles — choose a halaqah to enter the discussion."
      />
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto space-y-3">
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
                        {g.memberCount} contributing
                      </Badge>
                      {g.lastMessageAt && (
                        <span>Last message {timeAgo(g.lastMessageAt)}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </CardContent>
              </Card>
            </Link>
        ))}
        {!isLoading && groups?.length === 0 && (
          <Card className="border-card-border">
            <CardContent className="p-6 text-center text-muted-foreground">
              No halaqahs available yet.
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
