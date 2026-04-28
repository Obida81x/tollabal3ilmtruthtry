import { Heart } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { cn, timeAgo } from "@/lib/utils";
import { useTogglePostLike, getListPostsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

type Author = {
  id: number;
  username: string;
  displayName: string;
};

type Post = {
  id: number;
  content: string;
  imageUrl?: string | null;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string | Date;
  author: Author;
};

export function PostCard({ post }: { post: Post }) {
  const queryClient = useQueryClient();
  const toggle = useTogglePostLike();

  const handleLike = () => {
    toggle.mutate(
      { id: post.id },
      {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
          queryClient.invalidateQueries({
            queryKey: getGetDashboardSummaryQueryKey(),
          });
        },
      },
    );
  };

  return (
    <Card data-testid={`card-post-${post.id}`} className="border-card-border overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <Link href={`/profile/${post.author.id}`}><InitialsAvatar name={post.author.displayName} size="md" /></Link>
          <div className="flex-1 min-w-0">
            <Link href={`/profile/${post.author.id}`} data-testid={`link-post-author-${post.id}`}
                className="font-medium text-foreground hover:text-primary transition-colors block">
                {post.author.displayName}
              </Link>
            <div className="text-xs text-muted-foreground">
              @{post.author.username} · {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>
        <p
          className="text-foreground whitespace-pre-wrap leading-relaxed"
          data-testid={`text-post-content-${post.id}`}
          style={{ fontFamily: "var(--app-font-serif)", fontSize: "1.05rem" }}
        >
          {post.content}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={toggle.isPending}
            data-testid={`button-like-${post.id}`}
            className={cn(
              "gap-2",
              post.likedByMe && "text-primary",
            )}
          >
            <Heart
              className={cn("h-4 w-4", post.likedByMe && "fill-primary")}
            />
            <span data-testid={`text-likes-${post.id}`}>{post.likeCount}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
