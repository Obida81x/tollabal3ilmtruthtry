import { useState } from "react";
import { Plus, X } from "lucide-react";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useListStories,
  useCreateStory,
  getListStoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

type StoryUser = {
  id: number;
  displayName: string;
};

export function StoryTray() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: groups, isLoading } = useListStories({
    query: { queryKey: getListStoriesQueryKey() },
  });
  const create = useCreateStory();

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [viewing, setViewing] = useState<{
    user: StoryUser;
    stories: Array<{ id: number; content: string; createdAt: string | Date }>;
  } | null>(null);

  const handleSubmit = () => {
    if (!content.trim()) return;
    create.mutate(
      { data: { content: content.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStoriesQueryKey() });
          setContent("");
          setOpen(false);
        },
      },
    );
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2" data-testid="tray-stories">
        {user && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            data-testid="button-create-story"
            className="flex flex-col items-center gap-2 min-w-[64px] group"
          >
            <div className="relative h-16 w-16 rounded-full bg-muted border-2 border-dashed border-secondary flex items-center justify-center group-hover:border-primary transition-colors">
              <Plus className="h-6 w-6 text-secondary group-hover:text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">{t("stories.your")}</span>
          </button>
        )}
        {isLoading && (
          <div className="text-xs text-muted-foreground py-4">{t("stories.loading")}</div>
        )}
        {groups?.map((g) => (
          <button
            type="button"
            key={g.user.id}
            onClick={() => setViewing(g)}
            data-testid={`button-story-${g.user.id}`}
            className="flex flex-col items-center gap-2 min-w-[64px] group"
          >
            <div className="p-0.5 rounded-full bg-gradient-to-br from-primary to-secondary">
              <div className="bg-background p-0.5 rounded-full">
                <InitialsAvatar name={g.user.displayName} size="lg" />
              </div>
            </div>
            <span className="text-xs text-foreground truncate max-w-[64px]">
              {g.user.displayName.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("stories.share")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("stories.dialogHelp")}
          </p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("stories.placeholder")}
            rows={4}
            maxLength={500}
            data-testid="input-story-content"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-story-cancel"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || create.isPending}
              data-testid="button-story-submit"
            >
              {create.isPending ? t("common.posting") : t("stories.postStory")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="bg-gradient-to-br from-primary/95 to-secondary/95 text-primary-foreground border-none">
          <button
            type="button"
            onClick={() => setViewing(null)}
            className="absolute top-3 right-3 text-primary-foreground"
            data-testid="button-close-story"
          >
            <X className="h-5 w-5" />
          </button>
          {viewing && (
            <div className="py-6 space-y-6">
              <div className="flex items-center gap-3">
                <InitialsAvatar name={viewing.user.displayName} size="md" />
                <div>
                  <div className="font-medium">{viewing.user.displayName}</div>
                  <div className="text-xs opacity-80">
                    {viewing.stories.length}{" "}
                    {viewing.stories.length === 1
                      ? t("stories.singular")
                      : t("stories.plural")}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {viewing.stories.map((s) => (
                  <div
                    key={s.id}
                    data-testid={`text-story-content-${s.id}`}
                    className="rounded-md bg-primary-foreground/10 p-4 text-base"
                    style={{ fontFamily: "var(--app-font-serif)" }}
                  >
                    {s.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
