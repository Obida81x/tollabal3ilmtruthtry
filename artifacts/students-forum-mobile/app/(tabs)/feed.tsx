import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import {
  useListPosts,
  useCreatePost,
  useTogglePostLike,
  getListPostsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { PostCard } from "@/components/PostCard";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { Avatar } from "@/components/Avatar";

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [postText, setPostText] = useState("");
  const [composing, setComposing] = useState(false);

  const { data: posts, isLoading, refetch, isRefetching } = useListPosts({
    query: { queryKey: getListPostsQueryKey() },
  });

  const createPost = useCreatePost();
  const toggleLike = useTogglePostLike();

  function handleLike(postId: number) {
    toggleLike.mutate(
      { id: postId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        },
      }
    );
  }

  function handlePost() {
    if (!postText.trim()) return;
    createPost.mutate(
      { data: { content: postText.trim() } },
      {
        onSuccess: () => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setPostText("");
          setComposing(false);
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        },
      }
    );
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 84;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Feed</Text>
        <Text style={[styles.arabicTitle, { color: colors.secondary }]}>المنشورات</Text>
      </View>

      <FlatList
        data={isLoading ? [] : (posts ?? [])}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!posts?.length}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          user ? (
            <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.composerRow}>
                <Avatar displayName={user.displayName} userId={user.id} size={36} />
                {composing ? (
                  <TextInput
                    style={[styles.composerInput, { color: colors.foreground }]}
                    value={postText}
                    onChangeText={setPostText}
                    placeholder="Share something beneficial..."
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    autoFocus
                  />
                ) : (
                  <TouchableOpacity
                    style={[styles.composerPlaceholder, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setComposing(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                      Share something beneficial...
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              {composing && (
                <View style={[styles.composerActions, { borderTopColor: colors.border }]}>
                  <TouchableOpacity onPress={() => { setComposing(false); setPostText(""); }}>
                    <Text style={[styles.cancelBtn, { color: colors.mutedForeground }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.postBtn, { backgroundColor: colors.primary, opacity: !postText.trim() ? 0.5 : 1 }]}
                    onPress={handlePost}
                    disabled={!postText.trim() || createPost.isPending}
                  >
                    {createPost.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.postBtnText}>Post</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View>
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </View>
          ) : (
            <View style={styles.empty}>
              <Feather name="file-text" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No posts yet</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <PostCard post={item as any} onLike={handleLike} currentUserId={user?.id} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: "700" as const },
  arabicTitle: { fontSize: 14, marginTop: 2 },
  composer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  composerInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 60,
  },
  composerPlaceholder: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  placeholderText: { fontSize: 14 },
  composerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cancelBtn: { fontSize: 14 },
  postBtn: {
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 64,
    alignItems: "center",
  },
  postBtnText: { color: "#fff", fontWeight: "600" as const, fontSize: 14 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 15 },
});
