import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  RefreshControl,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useListUsers, getListUsersQueryKey } from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SkeletonBox } from "@/components/SkeletonLoader";

function InitialsCircle({ name, size = 44 }: { name: string; size?: number }) {
  const colors = useColors();
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primary + "22",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: colors.primary, fontWeight: "700", fontSize: size * 0.4 }}>
        {initials || "?"}
      </Text>
    </View>
  );
}

export default function MembersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");

  const { data: users, isLoading, refetch, isRefetching } = useListUsers(
    undefined,
    { query: { queryKey: getListUsersQueryKey() } },
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 20;

  const filtered = (users ?? []).filter((u: any) => {
    if (genderFilter !== "all" && u.gender !== genderFilter) return false;
    if (
      search &&
      !u.displayName?.toLowerCase().includes(search.toLowerCase()) &&
      !u.username?.toLowerCase().includes(search.toLowerCase()) &&
      !u.country?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

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
          <Text style={[styles.title, { color: colors.foreground }]}>Members</Text>
          <Text style={[styles.arabicTitle, { color: colors.secondary }]}>الأعضاء</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + "18" }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>
            {users?.length ?? 0}
          </Text>
        </View>
      </View>

      <View style={[styles.controls, { borderBottomColor: colors.border }]}>
        <View
          style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search members..."
            placeholderTextColor={colors.mutedForeground}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          {(["all", "male", "female"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                {
                  backgroundColor:
                    genderFilter === f ? colors.primary : colors.card,
                  borderColor: genderFilter === f ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                if (Platform.OS !== "web")
                  Haptics.selectionAsync();
                setGenderFilter(f);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: genderFilter === f ? "#fff" : colors.mutedForeground },
                ]}
              >
                {f === "all" ? "All" : f === "male" ? "Brothers" : "Sisters"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={isLoading ? [] : filtered}
        keyExtractor={(item: any) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <View key={i} style={styles.skeletonRow}>
                  <SkeletonBox width={44} height={44} borderRadius={22} />
                  <View style={{ gap: 6, flex: 1 }}>
                    <SkeletonBox width="60%" height={14} />
                    <SkeletonBox width="40%" height={11} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Feather name="users" size={36} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {search ? "No members match your search" : "No members yet"}
              </Text>
            </View>
          )
        }
        renderItem={({ item }: { item: any }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {item.avatarUrl ? (
              <Image
                source={{ uri: item.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <InitialsCircle name={item.displayName ?? item.username} size={44} />
            )}
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Text style={[styles.displayName, { color: colors.foreground }]}>
                  {item.displayName}
                </Text>
                <View
                  style={[
                    styles.genderBadge,
                    {
                      backgroundColor:
                        item.gender === "male"
                          ? "#3b82f618"
                          : "#ec489918",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.genderText,
                      { color: item.gender === "male" ? "#3b82f6" : "#ec4899" },
                    ]}
                  >
                    {item.gender === "male" ? "Brother" : "Sister"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.username, { color: colors.mutedForeground }]}>
                @{item.username}
                {item.country ? ` · ${item.country}` : ""}
              </Text>
              {item.isMufti && (
                <View style={[styles.muftiBadge, { backgroundColor: colors.secondary + "22" }]}>
                  <Feather name="award" size={11} color={colors.secondary} />
                  <Text style={[styles.muftiText, { color: colors.secondary }]}>Mufti</Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
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
  title: { fontSize: 22, fontWeight: "700" },
  arabicTitle: { fontSize: 14, fontWeight: "500", marginTop: 2 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 13, fontWeight: "700" },
  controls: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { flexDirection: "row", gap: 8 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  emptyBox: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  cardContent: { flex: 1, gap: 3 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  displayName: { fontSize: 15, fontWeight: "600", flex: 1 },
  genderBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  genderText: { fontSize: 11, fontWeight: "600" },
  username: { fontSize: 12 },
  muftiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  muftiText: { fontSize: 11, fontWeight: "600" },
});
