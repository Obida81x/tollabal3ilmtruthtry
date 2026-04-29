import { useEffect, useRef, useState } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import {
  useGetChatGroup,
  useListChatMessages,
  usePostChatMessage,
  getGetChatGroupQueryKey,
  getListChatMessagesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRequireAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export default function HalaqahRoomPage() {
  const user = useRequireAuth();
  const { t, lang } = useTranslation();
  const [, params] = useRoute<{ id: string }>("/halaqah/:id");
  const groupId = params?.id ? Number(params.id) : 0;
  const queryClient = useQueryClient();

  const { data: group } = useGetChatGroup(groupId, {
    query: {
      enabled: !!groupId,
      queryKey: getGetChatGroupQueryKey(groupId),
    },
  });
  const { data: messages, isLoading } = useListChatMessages(groupId, {
    query: {
      enabled: !!groupId,
      queryKey: getListChatMessagesQueryKey(groupId),
      refetchInterval: 4000,
    },
  });
  const post = usePostChatMessage();

  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    post.mutate(
      { id: groupId, data: { content: content.trim() } },
      {
        onSuccess: () => {
          setContent("");
          queryClient.invalidateQueries({
            queryKey: getListChatMessagesQueryKey(groupId),
          });
        },
      },
    );
  };

  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 lg:px-10 py-6 flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/halaqah" data-testid="link-back-halaqah">
              <Button variant="ghost" size="sm" className="gap-1">
                <BackIcon className="h-4 w-4" /> {t("halaqah.allHalaqahs")}
              </Button>
            </Link>
        </div>
        <Card
          className={
            "mb-4 border-l-4 " +
            (user?.gender === "male"
              ? "border-l-blue-500 border-card-border"
              : "border-l-pink-500 border-card-border")
          }
        >
          <CardContent className="p-5">
            <div
              className={
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] uppercase tracking-wide font-medium mb-2 " +
                (user?.gender === "male"
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                  : "bg-pink-500/10 text-pink-700 dark:text-pink-300")
              }
              data-testid="badge-room-gender"
            >
              {user?.gender === "male"
                ? t("common.brothers")
                : t("common.sisters")}
            </div>
            <h1
              className="text-2xl text-foreground"
              style={{ fontFamily: "var(--app-font-serif)" }}
              data-testid="text-group-title"
            >
              {group?.name ?? t("halaqah.fallbackName")}
            </h1>
            {group?.description && (
              <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
            )}
            <p
              className="text-xs text-muted-foreground mt-2"
              data-testid="text-room-gender-banner"
            >
              {user?.gender === "male"
                ? t("halaqah.brothersBanner")
                : t("halaqah.sistersBanner")}
            </p>
          </CardContent>
        </Card>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4"
          data-testid="container-messages"
        >
          {isLoading && <Skeleton className="h-20 w-full" />}
          {messages?.map((m) => {
            const mine = m.userId === user?.id;
            return (
              <div
                key={m.id}
                className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}
                data-testid={`message-${m.id}`}
              >
                <InitialsAvatar name={m.author?.displayName ?? "?"} size="sm" />
                <div className={`max-w-[75%] ${mine ? "items-end" : ""}`}>
                  <div className={`flex items-center gap-2 text-xs text-muted-foreground mb-1 ${mine ? "flex-row-reverse" : ""}`}>
                    <span data-testid={`text-author-${m.id}`}>
                      {m.author?.displayName}
                    </span>
                    <span>{timeAgo(m.createdAt, t)}</span>
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-lg ${
                      mine
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-card-border rounded-tl-sm"
                    }`}
                    data-testid={`text-message-${m.id}`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
          {!isLoading && messages?.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              {t("halaqah.noMessages")}
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 pt-3 border-t border-border">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("halaqah.messagePlaceholder")}
            maxLength={1000}
            data-testid="input-message"
          />
          <Button
            type="submit"
            disabled={!content.trim() || post.isPending}
            data-testid="button-send"
            className="gap-1"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{t("common.send")}</span>
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
