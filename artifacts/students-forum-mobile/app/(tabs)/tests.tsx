import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  RefreshControl,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useListTests,
  useGetTestLeaderboard,
  getListTestsQueryKey,
  getGetTestLeaderboardQueryKey,
} from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { Avatar } from "@/components/Avatar";

type Tab = "tests" | "leaderboard";

export default function TestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("tests");

  const { data: tests, isLoading: testsLoading, refetch: refetchTests, isRefetching: refetchingTests } = useListTests({
    query: { queryKey: getListTestsQueryKey() },
  });

  const { data: leaderboard, isLoading: lbLoading } = useGetTestLeaderboard({
    query: { queryKey: getGetTestLeaderboardQueryKey() },
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 84;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Tests</Text>
        <Text style={[styles.arabicTitle, { color: colors.secondary }]}>الاختبارات</Text>

        <View style={[styles.tabRow, { backgroundColor: colors.muted, borderRadius: 10 }]}>
          {(["tests", "leaderboard"] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === t && { backgroundColor: colors.card }]}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === t ? colors.primary : colors.mutedForeground }]}>
                {t === "tests" ? "Tests" : "Leaderboard"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === "tests" ? (
        <FlatList
          data={testsLoading ? [] : (tests ?? [])}
          keyExtractor={(item: any) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: botPad }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!(tests?.length)}
          refreshControl={
            <RefreshControl refreshing={refetchingTests} onRefresh={refetchTests} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            testsLoading ? (
              <View style={{ gap: 10 }}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={[styles.testCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <SkeletonBox height={16} width="70%" />
                    <SkeletonBox height={12} width="40%" style={{ marginTop: 8 }} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.empty}>
                <Feather name="check-circle" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No tests yet</Text>
              </View>
            )
          }
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={[styles.testCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/tests/${item.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.testCardLeft}>
                <View style={[styles.testIcon, { backgroundColor: colors.secondary + "18" }]}>
                  <Feather name="check-square" size={22} color={colors.secondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.testTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text style={[styles.testDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {item.description}
                    </Text>
                  )}
                  <View style={styles.testMeta}>
                    <Feather name="help-circle" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.testMetaText, { color: colors.mutedForeground }]}>
                      {item.questionCount ?? "?"} questions
                    </Text>
                  </View>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: botPad }}
          showsVerticalScrollIndicator={false}
        >
          {lbLoading ? (
            <View style={{ gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={[styles.lbRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <SkeletonBox width={32} height={32} borderRadius={16} />
                  <SkeletonBox height={14} width="50%" />
                  <SkeletonBox height={14} width={50} />
                </View>
              ))}
            </View>
          ) : !leaderboard?.length ? (
            <View style={styles.empty}>
              <Feather name="award" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results yet</Text>
            </View>
          ) : (
            (leaderboard as any[]).map((entry, idx) => {
              const isMe = user && entry.user?.id === user.id;
              const rank = entry.rank ?? idx + 1;
              return (
                <View
                  key={entry.userId ?? idx}
                  style={[
                    styles.lbRow,
                    {
                      backgroundColor: isMe ? colors.primary + "10" : colors.card,
                      borderColor: isMe ? colors.primary + "40" : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.rankCircle, {
                    backgroundColor: rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : colors.muted,
                  }]}>
                    <Text style={[styles.rankText, { color: rank <= 3 ? "#fff" : colors.mutedForeground }]}>
                      {rank}
                    </Text>
                  </View>
                  <Avatar displayName={entry.user?.displayName ?? "?"} userId={entry.userId} size={36} />
                  <Text style={[styles.lbName, { color: colors.foreground }]} numberOfLines={1}>
                    {entry.user?.displayName ?? "Unknown"}
                  </Text>
                  <View style={[styles.scoreBadge, { backgroundColor: colors.secondary + "18" }]}>
                    <Text style={[styles.scoreText, { color: colors.secondary }]}>{entry.totalScore ?? 0}</Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
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
  tabRow: {
    flexDirection: "row",
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  tabBtnText: { fontSize: 13, fontWeight: "600" as const },
  testCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  testCardLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  testIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  testTitle: { fontSize: 14, fontWeight: "600" as const },
  testDesc: { fontSize: 12, marginTop: 2 },
  testMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  testMetaText: { fontSize: 12 },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  rankCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { fontSize: 13, fontWeight: "700" as const },
  lbName: { flex: 1, fontSize: 14, fontWeight: "500" as const },
  scoreBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreText: { fontSize: 13, fontWeight: "700" as const },
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 15 },
});
