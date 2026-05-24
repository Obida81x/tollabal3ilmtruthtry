import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router, Link } from "expo-router";
import { useLogin, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const login = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!username.trim() || !password) return;
    setError(null);
    login.mutate(
      { data: { username: username.trim(), password } },
      {
        onSuccess: () => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
          router.replace("/(tabs)");
        },
        onError: (err) => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setError(err instanceof Error ? err.message : "Invalid credentials");
        },
      }
    );
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 40, paddingBottom: botPad + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoAr}>ع</Text>
          </View>
          <Text style={[styles.appTitle, { color: colors.primary }]}>Students of Islamic Law</Text>
          <Text style={[styles.arabicSub, { color: colors.secondary }]}>طلاب الفقه الإسلامي</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Sign In</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>Welcome back</Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "40" }]}>
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Username</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.input, color: colors.foreground }]}
              value={username}
              onChangeText={setUsername}
              placeholder="your_username"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.input }]}>
              <TextInput
                style={[styles.inputInRow, { color: colors.foreground }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, opacity: login.isPending ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={login.isPending}
            activeOpacity={0.85}
          >
            {login.isPending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>New here? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Create account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  logoArea: { alignItems: "center", marginBottom: 36 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logoAr: { fontSize: 32, color: "#fff", fontWeight: "700" as const },
  appTitle: { fontSize: 20, fontWeight: "700" as const, textAlign: "center" },
  arabicSub: { fontSize: 14, marginTop: 4 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 22, fontWeight: "700" as const, marginBottom: 4 },
  cardSub: { fontSize: 14, marginBottom: 20 },
  errorBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 14 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "500" as const, marginBottom: 6 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputRow: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  inputInRow: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  eyeBtn: { paddingHorizontal: 12 },
  btn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { fontSize: 16, fontWeight: "600" as const },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "600" as const },
});
