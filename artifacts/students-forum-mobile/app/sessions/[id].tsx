import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useGetMeeting } from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { SkeletonBox } from "@/components/SkeletonLoader";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function KindBadge({ kind, colors }: { kind: string; colors: ReturnType<typeof useColors> }) {
  const isLive = kind === "live";
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isLive ? colors.primary + "22" : colors.secondary + "22",
        },
      ]}
    >
      <Feather
        name={isLive ? "radio" : "film"}
        size={12}
        color={isLive ? colors.primary : colors.secondary}
      />
      <Text
        style={[
          styles.badgeText,
          { color: isLive ? colors.primary : colors.secondary },
        ]}
      >
        {isLive ? "Live Session" : "Recorded"}
      </Text>
    </View>
  );
}

export default function SessionDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: session, isLoading } = useGetMeeting({ id: Number(id) });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function openLink(url: string) {
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
            {isLoading ? "Loading…" : session?.title ?? "Session"}
          </Text>
          <Text style={[styles.arabicTitle, { color: colors.secondary }]}>
            تفاصيل الجلسة
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ padding: 24, gap: 12 }}>
          <SkeletonBox width="100%" height={24} />
          <SkeletonBox width="60%" height={16} />
          <SkeletonBox width="100%" height={120} />
        </View>
      ) : !session ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={36} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Session not found
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          <KindBadge kind={session.kind} colors={colors} />

          <Text style={[styles.heading, { color: colors.foreground }]}>
            {session.title}
          </Text>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.infoRow}>
              <Feather name="user" size={16} color={colors.mutedForeground} />
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                Scholar
              </Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                {session.scholar}
              </Text>
            </View>
            {session.scheduledAt && (
              <View style={[styles.infoRow, styles.infoRowBorder, { borderTopColor: colors.border }]}>
                <Feather name="calendar" size={16} color={colors.mutedForeground} />
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                  Date
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>
                  {formatDate(session.scheduledAt)}
                </Text>
              </View>
            )}
            {session.durationMinutes && (
              <View style={[styles.infoRow, styles.infoRowBorder, { borderTopColor: colors.border }]}>
                <Feather name="clock" size={16} color={colors.mutedForeground} />
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
                  Duration
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>
                  {session.durationMinutes} min
                </Text>
              </View>
            )}
          </View>

          {session.description && (
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                About
              </Text>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {session.description}
              </Text>
            </View>
          )}

          {session.meetingUrl && (
            <TouchableOpacity
              style={[styles.joinBtn, { backgroundColor: colors.primary }]}
              onPress={() => openLink(session.meetingUrl!)}
            >
              <Feather name="video" size={18} color="#fff" />
              <Text style={styles.joinBtnText}>
                {session.kind === "live" ? "Join Live Session" : "Watch Recording"}
              </Text>
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  heading: { fontSize: 24, fontWeight: "700", lineHeight: 32, marginBottom: 20 },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  infoRowBorder: { borderTopWidth: StyleSheet.hairlineWidth },
  infoLabel: { fontSize: 13, width: 60 },
  infoValue: { fontSize: 14, fontWeight: "500", flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 22 },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: 14,
    marginTop: 28,
  },
  joinBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  errorBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  errorText: { fontSize: 14 },
});
