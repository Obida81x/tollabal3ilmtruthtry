import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useListChatGroups,
  getListChatGroupsQueryKey,
} from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonBox } from "@/components/SkeletonLoader";

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HalaqahScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data: groups, isLoading, refetch, isRefetching } = useListChatGroups({
    query: { queryKey: getListChatGroupsQueryKey() },
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 84;

  const genderLabel = user?.gender === "male" ? "Brothers' Ḥalaqah" : "Sisters' Ḥalaqah";
  const genderAr = user?.gender === "male" ? "حلقات الإخوة" : "حلقات الأخوات";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{genderLabel}</Text>
        <Text style={[styles.arabicTitle, { color: colors.secondary }]}>{genderAr}</Text>
      </View>

      <FlatList
        data={isLoading ? [] : (groups ?? [])}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!(groups?.length)}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <SkeletonBox width={44} height={44} borderRadius={22} />
                  <View style={{ flex: 1, gap: 8 }}>
                    <SkeletonBox height={15} width="70%" />
                    <SkeletonBox height={12} width="90%" />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <Feather name="message-circle" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No rooms available</Text>
            </View>
          )
        }
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/halaqah/${item.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.groupIcon, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.groupIconText, { color: colors.primary }]}>
                {item.name?.[0]?.toUpperCase() ?? "H"}
              </Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={[styles.groupName, { color: colors.foreground }]}>{item.name}</Text>
              {item.description && (
                <Text style={[styles.groupDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
              <View style={styles.groupMeta}>
                {item.gender && (
                  <View style={[styles.genderBadge, { backgroundColor: item.gender === "male" ? "#246B3C18" : "#B5832D18", borderColor: item.gender === "male" ? "#246B3C40" : "#B5832D40" }]}>
                    <Text style={[styles.genderBadgeText, { color: item.gender === "male" ? colors.primary : colors.secondary }]}>
                      {item.gender === "male" ? "Brothers" : "Sisters"}
                    </Text>
                  </View>
                )}
                {item.updatedAt && (
                  <Text style={[styles.groupTime, { color: colors.mutedForeground }]}>
                    {timeAgo(item.updatedAt)}
                  </Text>
                )}
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
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
  arabicTitle: { fontSize: 14, marginTop: 2 },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  groupIconText: { fontSize: 18, fontWeight: "700" as const },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 15, fontWeight: "600" as const },
  groupDesc: { fontSize: 13, marginTop: 2 },
  groupMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 5 },
  genderBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  genderBadgeText: { fontSize: 11, fontWeight: "500" as const },
  groupTime: { fontSize: 12 },
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 15 },
});
