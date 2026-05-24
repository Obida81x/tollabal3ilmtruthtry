import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey,
  useListUpcomingMeetings,
  getListUpcomingMeetingsQueryKey,
} from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonBox } from "@/components/SkeletonLoader";
import { Avatar } from "@/components/Avatar";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });

  const { data: upcoming, isLoading: upcomingLoading } = useListUpcomingMeetings({
    query: { queryKey: getListUpcomingMeetingsQueryKey() },
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 84;

  const stats = [
    { icon: "users" as const, label: "Members", value: summary?.memberCount },
    { icon: "file-text" as const, label: "Posts", value: summary?.postCount },
    { icon: "book" as const, label: "Books", value: summary?.bookCount },
    { icon: "video" as const, label: "Sessions", value: summary?.meetingCount },
  ];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: botPad, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greetArea}>
          <Text style={[styles.arabicGreet, { color: colors.secondary }]}>السلام عليكم</Text>
          <Text style={[styles.greet, { color: colors.foreground }]}>
            {user ? `Welcome, ${user.displayName.split(" ")[0]}` : "Welcome"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {user && (
            <Avatar displayName={user.displayName} userId={user.id} size={40} />
          )}
          <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { borderColor: colors.border }]}>
            <Feather name="log-out" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + "18" }]}>
              <Feather name={s.icon} size={20} color={colors.primary} />
            </View>
            {summaryLoading ? (
              <SkeletonBox height={24} width={50} style={{ marginTop: 8 }} />
            ) : (
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value ?? 0}</Text>
            )}
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Sessions</Text>
          <TouchableOpacity onPress={() => router.push("/sessions")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {upcomingLoading ? (
          <View style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SkeletonBox height={16} width="80%" />
            <SkeletonBox height={12} width="50%" style={{ marginTop: 8 }} />
          </View>
        ) : !upcoming?.length ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="calendar" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No upcoming sessions</Text>
          </View>
        ) : (
          upcoming.slice(0, 3).map((m: any) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.sessionDot, { backgroundColor: colors.primary }]} />
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionTitle, { color: colors.foreground }]}>{m.title}</Text>
                {m.scheduledAt && (
                  <Text style={[styles.sessionTime, { color: colors.mutedForeground }]}>
                    {formatDate(m.scheduledAt)}
                  </Text>
                )}
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Access</Text>
        <View style={styles.actionsRow}>
          {[
            { icon: "message-circle" as const, label: "Ḥalaqah", route: "/(tabs)/halaqah" },
            { icon: "book-open" as const, label: "Library", route: "/(tabs)/library" },
            { icon: "check-circle" as const, label: "Tests", route: "/(tabs)/tests" },
            { icon: "video" as const, label: "Sessions", route: "/sessions" },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.8}
            >
              <Feather name={a.icon} size={22} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  greetArea: { flex: 1 },
  arabicGreet: { fontSize: 14, fontWeight: "500" as const, marginBottom: 2 },
  greet: { fontSize: 22, fontWeight: "700" as const },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: "47.5%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 26, fontWeight: "700" as const, marginTop: 8 },
  statLabel: { fontSize: 13, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700" as const },
  seeAll: { fontSize: 14, fontWeight: "500" as const },
  sessionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  sessionDot: { width: 8, height: 8, borderRadius: 4 },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: 14, fontWeight: "600" as const },
  sessionTime: { fontSize: 12, marginTop: 3 },
  emptyBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 14 },
  actionsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  actionBtn: {
    width: "47.5%",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  actionLabel: { fontSize: 13, fontWeight: "500" as const },
});
