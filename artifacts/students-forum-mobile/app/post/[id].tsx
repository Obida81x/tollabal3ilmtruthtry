import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useGetPost,
  useListPostComments,
  useCreatePostComment,
  useTogglePostLike,
  getGetPostQueryKey,
  getListPostCommentsQueryKey,
  getListPostsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { KeyboardAvoidingView as KAV } from "react-native-keyboard-controller";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { isArabic, rtlStyle } from "@/utils/rtl";

function timeAgo(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const ms = Date.now() - d.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = parseInt(id ?? "0", 10);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const { data: post, isLoading: postLoading } = useGetPost(postId, {
    query: { queryKey: getGetPostQueryKey(postId), enabled: postId > 0 },
  });

  const { data: comments, isLoading: commentsLoading } = useListPostComments(postId, {
    query: {
      queryKey: getListPostCommentsQueryKey(postId),
      enabled: postId > 0,
    },
  });

  const createComment = useCreatePostComment();
  const toggleLike = useTogglePostLike();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  function handleLike() {
    if (!post) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike.mutate(
      { id: postId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        },
      },
    );
  }

  function handleComment() {
    const content = text.trim();
    if (!content) return;
    setText("");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    createComment.mutate(
      { id: postId, data: { content } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPostCommentsQueryKey(postId) });
        },
      },
    );
  }

  const liked = (post as any)?.likedByMe ?? false;
  const authorName = (post as any)?.author?.displayName ?? "Member";
  const authorId = (post as any)?.author?.id ?? (post as any)?.userId;
  const content = (post as any)?.content ?? "";
  const arabic = isArabic(content);

  const allItems = [{ type: "post" as const }, ...((comments ?? []).map((c: any) => ({ type: "comment" as const, ...c })))];

  return (
    <KAV
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Discussion</Text>
        <Text style={[styles.headerAr, { color: colors.secondary }]}>النقاش</Text>
      </View>

      {postLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item: any, i) => item.type === "post" ? "post" : String(item.id ?? i)}
          contentContainerStyle={{ paddingBottom: botPad + 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: any }) => {
            if (item.type === "post") {
              return (
                <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.postHeader}>
                    <Avatar displayName={authorName} userId={authorId} size={40} />
                    <View style={styles.postMeta}>
                      <Text style={[styles.postAuthor, { color: colors.foreground }]}>{authorName}</Text>
                      <Text style={[styles.postTime, { color: colors.mutedForeground }]}>
                        {timeAgo((post as any)?.createdAt ?? "")}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.postContent,
                      { color: colors.foreground },
                      arabic && rtlStyle,
                    ]}
                  >
                    {content}
                  </Text>

                  {!!(post as any)?.imageUrl && (
                    <Image
                      source={{ uri: (post as any).imageUrl }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  )}

                  <View style={[styles.postActions, { borderTopColor: colors.border }]}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleLike} activeOpacity={0.7}>
                      <Feather
                        name="heart"
                        size={17}
                        color={liked ? colors.destructive : colors.mutedForeground}
                      />
                      <Text style={[styles.actionLabel, { color: liked ? colors.destructive : colors.mutedForeground }]}>
                        {(post as any)?.likeCount ?? 0}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => inputRef.current?.focus()}
                      activeOpacity={0.7}
                    >
                      <Feather name="message-circle" size={17} color={colors.mutedForeground} />
                      <Text style={[styles.actionLabel, { color: colors.mutedForeground }]}>
                        {comments?.length ?? 0}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }

            const commentArabic = isArabic(item.content ?? "");
            const commentAuthor = item.author?.displayName ?? "Member";
            const commentAuthorId = item.author?.id ?? item.userId;
            const isMe = user?.id === item.userId;

            return (
              <View style={[styles.commentRow, { borderBottomColor: colors.border }]}>
                <Avatar displayName={commentAuthor} userId={commentAuthorId} size={32} />
                <View style={styles.commentBody}>
                  <View style={styles.commentHeader}>
                    <Text style={[styles.commentAuthor, { color: colors.foreground }]}>{commentAuthor}</Text>
                    {isMe && (
                      <View style={[styles.meBadge, { backgroundColor: colors.primary + "20" }]}>
                        <Text style={[styles.meBadgeText, { color: colors.primary }]}>You</Text>
                      </View>
                    )}
                    <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>
                      {timeAgo(item.createdAt ?? "")}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.commentText,
                      { color: colors.foreground },
                      commentArabic && rtlStyle,
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={null}
          ListFooterComponent={
            commentsLoading ? (
              <View style={styles.commentsLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : !comments?.length ? (
              <View style={styles.noComments}>
                <Feather name="message-circle" size={28} color={colors.mutedForeground} />
                <Text style={[styles.noCommentsText, { color: colors.mutedForeground }]}>
                  Be the first to reply
                </Text>
                <Text style={[styles.noCommentsAr, { color: colors.secondary }]}>كن أول من يرد</Text>
              </View>
            ) : null
          }
        />
      )}

      {user && (
        <View style={[styles.inputArea, { borderTopColor: colors.border, backgroundColor: colors.card, paddingBottom: botPad + 8 }]}>
          <Avatar displayName={user.displayName} userId={user.id} size={32} />
          <TextInput
            ref={inputRef}
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            value={text}
            onChangeText={setText}
            placeholder="Write a reply..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.muted }]}
            onPress={handleComment}
            disabled={!text.trim() || createComment.isPending}
            activeOpacity={0.8}
          >
            {createComment.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="send" size={16} color={text.trim() ? "#fff" : colors.mutedForeground} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </KAV>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: "700" as const },
  headerAr: { fontSize: 13 },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  postCard: {
    margin: 12,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  postMeta: { flex: 1 },
  postAuthor: { fontSize: 15, fontWeight: "600" as const },
  postTime: { fontSize: 12, marginTop: 2 },
  postContent: {
    fontSize: 16,
    lineHeight: 25,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  postImage: { width: "100%", height: 220 },
  postActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 20,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionLabel: { fontSize: 14, fontWeight: "500" as const },
  commentRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  commentBody: { flex: 1 },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  commentAuthor: { fontSize: 13, fontWeight: "600" as const },
  meBadge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  meBadgeText: { fontSize: 10, fontWeight: "600" as const },
  commentTime: { fontSize: 11, marginLeft: "auto" as const },
  commentText: { fontSize: 14, lineHeight: 20 },
  commentsLoading: { padding: 20, alignItems: "center" },
  noComments: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  noCommentsText: { fontSize: 14 },
  noCommentsAr: { fontSize: 13 },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    maxHeight: 90,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
});
