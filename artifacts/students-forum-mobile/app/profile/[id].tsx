import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useGetUser,
  getGetUserQueryKey,
} from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = parseInt(id ?? "0", 10);
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { data: user, isLoading } = useGetUser(userId, {
    query: { queryKey: getGetUserQueryKey(userId), enabled: userId > 0 },
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 20;

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="user-x" size={32} color={colors.mutedForeground} />
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Member not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backLink, { borderColor: colors.border }]}>
          <Text style={[styles.backLinkText, { color: colors.foreground }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const u = user as any;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: botPad }}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Avatar displayName={u.displayName} userId={u.id} size={80} />
          <Text style={[styles.displayName, { color: colors.foreground }]}>{u.displayName}</Text>
          <Text style={[styles.username, { color: colors.mutedForeground }]}>@{u.username}</Text>

          <View style={styles.badgesRow}>
            {u.isAdmin && (
              <View style={[styles.badge, { backgroundColor: colors.secondary + "18", borderColor: colors.secondary + "40" }]}>
                <Feather name="shield" size={12} color={colors.secondary} />
                <Text style={[styles.badgeText, { color: colors.secondary }]}>Admin</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <Feather name="user" size={12} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                {u.gender === "male" ? "Brother" : "Sister"}
              </Text>
            </View>
            {u.isActive ? (
              <View style={[styles.badge, { backgroundColor: "#246B3C18", borderColor: "#246B3C40" }]}>
                <View style={[styles.activeDot, { backgroundColor: "#246B3C" }]} />
                <Text style={[styles.badgeText, { color: "#246B3C" }]}>Active</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Inactive</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details */}
        <View style={{ padding: 16, gap: 12 }}>
          {u.email && (
            <View style={[styles.detailRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="mail" size={18} color={colors.primary} />
              <View>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Email</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{u.email}</Text>
              </View>
            </View>
          )}
          <View style={[styles.detailRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="calendar" size={18} color={colors.primary} />
            <View>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Joined</Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>{formatDate(u.createdAt)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  notFound: { fontSize: 16 },
  backLink: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 10 },
  backLinkText: { fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, width: 32 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 17, fontWeight: "600" as const },
  hero: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    gap: 8,
  },
  displayName: { fontSize: 22, fontWeight: "700" as const, marginTop: 8 },
  username: { fontSize: 14 },
  badgesRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap", justifyContent: "center" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "500" as const },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  detailLabel: { fontSize: 12, marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: "500" as const },
});
