import { useState } from "react";
import {
  useListPosts,
  useCreatePost,
  getListPostsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { StoryTray } from "@/components/StoryTray";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InitialsAvatar } from "@/components/InitialsAvatar";

export default function FeedPage() {
  useRequireAuth();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useListPosts({
    query: { queryKey: getListPostsQueryKey() },
  });
  const create = useCreatePost();
  const [content, setContent] = useState("");

  const handlePost = () => {
    if (!content.trim()) return;
    create.mutate(
      { data: { content: content.trim() } },
      {
        onSuccess: () => {
          setContent("");
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        },
      },
    );
  };

  return (
    <AppLayout>
      <PageHeader
        title="The Feed"
        arabicLabel="الفوائد"
        subtitle="Beneficial posts from members of the majlis. Stories above are visible to all for 24 hours."
      />
      <div className="px-6 lg:px-10 py-8 max-w-3xl mx-auto space-y-6">
        <Card className="border-card-border">
          <CardContent className="p-5">
            <StoryTray />
          </CardContent>
        </Card>

        {user && (
          <Card className="border-card-border" data-testid="card-composer">
            <CardContent className="p-5">
              <div className="flex gap-3">
                <InitialsAvatar name={user.displayName} size="md" />
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share a beneficial reminder, an ayah, a hadith, or a question for the brothers and sisters…"
                    rows={3}
                    maxLength={2000}
                    data-testid="input-post-content"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {content.length}/2000
                    </span>
                    <Button
                      onClick={handlePost}
                      disabled={!content.trim() || create.isPending}
                      data-testid="button-submit-post"
                    >
                      {create.isPending ? "Posting…" : "Post"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
        <div className="space-y-4">
          {posts?.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
        {!isLoading && posts?.length === 0 && (
          <Card className="border-card-border">
            <CardContent className="p-8 text-center text-muted-foreground">
              No posts yet — be the first to share a benefit.
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
