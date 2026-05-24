import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Feather as FeatherIcon } from "@expo/vector-icons";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <FeatherIcon name={icon as any} size={20} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [muftiUsername, setMuftiUsername] = useState("");
  const [assigning, setAssigning] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user?.isAdmin && !user?.isMainAdmin) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <FeatherIcon name="chevron-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Admin</Text>
        </View>
        <View style={styles.centerBox}>
          <FeatherIcon name="lock" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Access restricted to administrators.
          </Text>
        </View>
      </View>
    );
  }

  async function handleAssignMufti() {
    if (!muftiUsername.trim()) return;
    setAssigning(true);
    try {
      const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";
      const res = await fetch(`${BASE}/api/admin/muftis`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: muftiUsername.trim() }),
      });
      if (res.ok) {
        Alert.alert("Success", `${muftiUsername} has been assigned as Mufti.`);
        setMuftiUsername("");
      } else {
        const d = await res.json().catch(() => ({}));
        Alert.alert("Error", d?.error ?? "Failed to assign Mufti.");
      }
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setAssigning(false);
    }
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
          <FeatherIcon name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Admin Panel</Text>
          <Text style={[styles.arabicTitle, { color: colors.secondary }]}>لوحة الإدارة</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Quick Stats">
          <View style={styles.statsGrid}>
            <StatCard label="Members" value="—" icon="users" />
            <StatCard label="Posts" value="—" icon="file-text" />
            <StatCard label="Books" value="—" icon="book" />
            <StatCard label="Fatawa" value="—" icon="award" />
          </View>
        </Section>

        <Section title="Mufti Management">
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
              Assign or revoke Mufti status for administrators. Muftis can answer fatawa questions
              privately and submit audio rulings.
            </Text>

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>
              Username to assign as Mufti
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.foreground,
                    flex: 1,
                  },
                ]}
                value={muftiUsername}
                onChangeText={setMuftiUsername}
                placeholder="e.g. sheikh_ali"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[
                  styles.assignBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: assigning || !muftiUsername.trim() ? 0.6 : 1,
                  },
                ]}
                onPress={handleAssignMufti}
                disabled={assigning || !muftiUsername.trim()}
              >
                {assigning ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <FeatherIcon name="award" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Section>

        <Section title="Fatawa Queue">
          <View
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
              Members' questions awaiting a mufti's answer. Open the full web panel for
              detailed management.
            </Text>
            <TouchableOpacity
              style={[styles.webLink, { borderColor: colors.primary }]}
              onPress={() => {
                const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";
                const webUrl = BASE.replace("/api", "") + "/admin";
                if (Platform.OS !== "web") {
                  const { Linking } = require("react-native");
                  Linking.openURL(webUrl);
                }
              }}
            >
              <FeatherIcon name="external-link" size={14} color={colors.primary} />
              <Text style={[styles.webLinkText, { color: colors.primary }]}>
                Open Full Admin Panel
              </Text>
            </TouchableOpacity>
          </View>
        </Section>
      </ScrollView>
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
  content: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    flex: 1,
    minWidth: "40%",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 12, fontWeight: "500" },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardDesc: { fontSize: 13, lineHeight: 20 },
  inputLabel: { fontSize: 13, fontWeight: "600" },
  inputRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  assignBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  webLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  webLinkText: { fontSize: 14, fontWeight: "600" },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
