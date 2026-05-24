import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useListBooks } from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SkeletonBox } from "@/components/SkeletonLoader";

export default function BookDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: books, isLoading } = useListBooks();
  const book = books?.find((b: any) => String(b.id) === String(id));

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function openFile(url: string) {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(url);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 10,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {isLoading ? "Loading…" : book?.title ?? "Book"}
          </Text>
          <Text style={[styles.arabicTitle, { color: colors.secondary }]}>تفاصيل الكتاب</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 24, gap: 16 }}>
          <SkeletonBox width="100%" height={200} borderRadius={16} />
          <SkeletonBox width="70%" height={24} />
          <SkeletonBox width="50%" height={16} />
          <SkeletonBox width="100%" height={80} />
        </View>
      ) : !book ? (
        <View style={styles.errorBox}>
          <Feather name="book-open" size={36} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Book not found
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Cover / Placeholder */}
          {book.coverImageUrl ? (
            <View style={[styles.coverWrap, { backgroundColor: colors.card }]}>
              <Feather name="book" size={60} color={colors.primary} />
            </View>
          ) : (
            <View style={[styles.coverWrap, { backgroundColor: colors.card }]}>
              <Feather name="book" size={60} color={colors.primary} />
            </View>
          )}

          <Text style={[styles.bookTitle, { color: colors.foreground }]}>
            {book.title}
          </Text>

          {book.titleAr && (
            <Text style={[styles.bookTitleAr, { color: colors.secondary }]}>
              {book.titleAr}
            </Text>
          )}

          <View
            style={[
              styles.metaCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {book.author && (
              <View style={styles.metaRow}>
                <Feather name="user" size={15} color={colors.mutedForeground} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Author</Text>
                <Text style={[styles.metaValue, { color: colors.foreground }]}>
                  {book.author}
                </Text>
              </View>
            )}
            {book.language && (
              <View style={[styles.metaRow, styles.metaRowBorder, { borderTopColor: colors.border }]}>
                <Feather name="globe" size={15} color={colors.mutedForeground} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Language</Text>
                <Text style={[styles.metaValue, { color: colors.foreground }]}>
                  {book.language === "ar" ? "Arabic" : book.language === "en" ? "English" : book.language}
                </Text>
              </View>
            )}
            {book.pages && (
              <View style={[styles.metaRow, styles.metaRowBorder, { borderTopColor: colors.border }]}>
                <Feather name="file-text" size={15} color={colors.mutedForeground} />
                <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>Pages</Text>
                <Text style={[styles.metaValue, { color: colors.foreground }]}>
                  {book.pages}
                </Text>
              </View>
            )}
          </View>

          {book.description && (
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {book.description}
              </Text>
            </View>
          )}

          {book.fileUrl && (
            <TouchableOpacity
              style={[styles.downloadBtn, { backgroundColor: colors.primary }]}
              onPress={() => openFile(book.fileUrl!)}
            >
              <Feather name="download" size={18} color="#fff" />
              <Text style={styles.downloadBtnText}>Download / Read</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: "700" },
  arabicTitle: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  content: { padding: 24 },
  coverWrap: {
    height: 200,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  bookTitle: { fontSize: 22, fontWeight: "700", lineHeight: 30, marginBottom: 4 },
  bookTitleAr: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 20,
    direction: "rtl",
  } as any,
  metaCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  metaRowBorder: { borderTopWidth: StyleSheet.hairlineWidth },
  metaLabel: { fontSize: 13, width: 64 },
  metaValue: { fontSize: 14, fontWeight: "500", flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 22 },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
    marginTop: 28,
  },
  downloadBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  errorBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 14 },
});
