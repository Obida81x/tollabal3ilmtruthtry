import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Linking,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  useListBooks,
  getListBooksQueryKey,
} from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SkeletonBox } from "@/components/SkeletonLoader";

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const { data: books, isLoading, refetch, isRefetching } = useListBooks(
    undefined,
    { query: { queryKey: getListBooksQueryKey() } }
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 84;

  const filtered = (books ?? []).filter(
    (b: any) =>
      !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
  );

  function openBook(url: string) {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Library</Text>
        <Text style={[styles.arabicTitle, { color: colors.secondary }]}>المكتبة</Text>
        <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search books..."
            placeholderTextColor={colors.mutedForeground}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={isLoading ? [] : filtered}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.bookCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <SkeletonBox width={52} height={68} borderRadius={8} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <SkeletonBox height={15} width="80%" />
                    <SkeletonBox height={12} width="50%" />
                    <SkeletonBox height={12} width="90%" />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Feather name="book-open" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {search ? "No books found" : "No books yet"}
              </Text>
            </View>
          )
        }
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            style={[styles.bookCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => item.downloadUrl && openBook(item.downloadUrl)}
            activeOpacity={0.8}
          >
            <View style={[styles.bookCover, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.bookCoverLetter, { color: colors.primary }]}>
                {item.title?.[0]?.toUpperCase() ?? "B"}
              </Text>
            </View>
            <View style={styles.bookInfo}>
              <Text style={[styles.bookTitle, { color: colors.foreground }]} numberOfLines={2}>
                {item.title}
              </Text>
              {item.author && (
                <Text style={[styles.bookAuthor, { color: colors.secondary }]}>{item.author}</Text>
              )}
              {item.category && (
                <View style={[styles.categoryBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>{item.category}</Text>
                </View>
              )}
              {item.description && (
                <Text style={[styles.bookDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
            {item.downloadUrl && (
              <View style={[styles.downloadBtn, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="download" size={18} color={colors.primary} />
              </View>
            )}
          </TouchableOpacity>
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
  arabicTitle: { fontSize: 14, marginTop: 2, marginBottom: 12 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  bookCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    alignItems: "flex-start",
  },
  bookCover: {
    width: 52,
    height: 68,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bookCoverLetter: { fontSize: 22, fontWeight: "700" as const },
  bookInfo: { flex: 1, gap: 4 },
  bookTitle: { fontSize: 14, fontWeight: "600" as const, lineHeight: 20 },
  bookAuthor: { fontSize: 13 },
  categoryBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  categoryText: { fontSize: 11 },
  bookDesc: { fontSize: 12, lineHeight: 17 },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 15 },
});
