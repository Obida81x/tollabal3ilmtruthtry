import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useListMeetings,
  getListMeetingsQueryKey,
} from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SkeletonBox } from "@/components/SkeletonLoader";

type Kind = "all" | "live" | "recorded";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function SessionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<Kind>("all");

  const { data: meetings, isLoading, refetch, isRefetching } = useListMeetings(
    kind !== "all" ? { kind } : {},
    { query: { queryKey: getListMeetingsQueryKey(kind !== "all" ? { kind } : {}) } }
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 20;

  function openLink(url: string) {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Sessions</Text>
          <Text style={[styles.arabicTitle, { color: colors.secondary }]}>الجلسات العلمية</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={[styles.filterRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {(["all", "live", "recorded"] as Kind[]).map((k) => (
          <TouchableOpacity
            key={k}
            style={[
              styles.filterBtn,
              kind === k && { backgroundColor: colors.primary, borderColor: colors.primary },
              kind !== k && { borderColor: colors.border },
            ]}
            onPress={() => setKind(k)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, { color: kind === k ? "#fff" : colors.mutedForeground }]}>
              {k === "all" ? "All" : k === "live" ? "Live" : "Recorded"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={isLoading ? [] : (meetings ?? [])}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!(meetings?.length)}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.meetingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <SkeletonBox height={16} width="80%" />
                  <SkeletonBox height={12} width="50%" style={{ marginTop: 8 }} />
                  <SkeletonBox height={12} width="60%" style={{ marginTop: 6 }} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Feather name="video" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No sessions found</Text>
            </View>
          )
        }
        renderItem={({ item }: { item: any }) => {
          const isLive = item.kind === "live";
          return (
            <View style={[styles.meetingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.meetingTop}>
                <View style={[
                  styles.kindBadge,
                  { backgroundColor: isLive ? "#DC2626" + "18" : colors.muted, borderColor: isLive ? "#DC262640" : colors.border }
                ]}>
                  <View style={[styles.kindDot, { backgroundColor: isLive ? "#DC2626" : colors.mutedForeground }]} />
                  <Text style={[styles.kindText, { color: isLive ? "#DC2626" : colors.mutedForeground }]}>
                    {isLive ? "Live" : "Recorded"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.meetingTitle, { color: colors.foreground }]}>{item.title}</Text>
              {item.description && (
                <Text style={[styles.meetingDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              {item.scheduledAt && (
                <View style={styles.metaRow}>
                  <Feather name="calendar" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{formatDate(item.scheduledAt)}</Text>
                </View>
              )}
              {(item.meetLink || item.recordingUrl) && (
                <TouchableOpacity
                  style={[styles.joinBtn, { backgroundColor: isLive ? "#DC2626" : colors.primary }]}
                  onPress={() => openLink(item.meetLink ?? item.recordingUrl)}
                  activeOpacity={0.85}
                >
                  <Feather name={isLive ? "video" : "play-circle"} size={16} color="#fff" />
                  <Text style={styles.joinBtnText}>{isLive ? "Join Session" : "Watch Recording"}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 4,
  },
  backBtn: { padding: 4, marginTop: 4 },
  title: { fontSize: 24, fontWeight: "700" as const },
  arabicTitle: { fontSize: 14, marginTop: 2 },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterBtn: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterText: { fontSize: 13, fontWeight: "500" as const },
  meetingCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  meetingTop: { flexDirection: "row" },
  kindBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  kindDot: { width: 6, height: 6, borderRadius: 3 },
  kindText: { fontSize: 11, fontWeight: "600" as const },
  meetingTitle: { fontSize: 15, fontWeight: "600" as const },
  meetingDesc: { fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12 },
  joinBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 4,
  },
  joinBtnText: { color: "#fff", fontWeight: "600" as const, fontSize: 14 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 15 },
});
