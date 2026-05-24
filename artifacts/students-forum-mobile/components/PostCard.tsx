import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";

interface PostAuthor {
  id: number;
  displayName: string;
}

interface Post {
  id: number;
  content: string;
  mediaUrl?: string | null;
  likeCount?: number;
  isLikedByCurrentUser?: boolean;
  author?: PostAuthor | null;
  authorId: number;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: number) => void;
  currentUserId?: number;
}

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const colors = useColors();
  const liked = post.isLikedByCurrentUser ?? false;
  const authorName = post.author?.displayName ?? "Member";
  const authorId = post.author?.id ?? post.authorId;

  function handleLike() {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onLike?.(post.id);
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Avatar displayName={authorName} userId={authorId} size={38} />
        <View style={styles.headerText}>
          <Text style={[styles.authorName, { color: colors.foreground }]}>{authorName}</Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>
            {timeAgo(post.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={[styles.content, { color: colors.foreground }]}>{post.content}</Text>

      {!!post.mediaUrl && (
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.media}
          resizeMode="cover"
        />
      )}

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity style={styles.likeBtn} onPress={handleLike} activeOpacity={0.7}>
          <Feather
            name={liked ? "heart" : "heart"}
            size={16}
            color={liked ? colors.destructive : colors.mutedForeground}
          />
          <Text
            style={[
              styles.likeCount,
              { color: liked ? colors.destructive : colors.mutedForeground },
            ]}
          >
            {post.likeCount ?? 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  headerText: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  time: {
    fontSize: 12,
    marginTop: 1,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  media: {
    width: "100%",
    height: 200,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  likeCount: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
});
