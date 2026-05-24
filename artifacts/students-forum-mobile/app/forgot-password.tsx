import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const BASE = process.env.EXPO_PUBLIC_API_URL ?? "";
      const res = await fetch(`${BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok || res.status === 200) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
          <Text style={[styles.title, { color: colors.foreground }]}>
            Forgot Password
          </Text>
          <Text style={[styles.arabicTitle, { color: colors.secondary }]}>
            نسيت كلمة المرور
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {sent ? (
          <View style={styles.successBox}>
            <Feather name="check-circle" size={48} color={colors.primary} />
            <Text style={[styles.successTitle, { color: colors.foreground }]}>
              Email Sent
            </Text>
            <Text style={[styles.successText, { color: colors.mutedForeground }]}>
              If an account exists with that email, you will receive a password
              reset link shortly. Check your inbox.
            </Text>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.btnText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              Enter the email address associated with your account and we will
              send you a link to reset your password.
            </Text>

            {!!error && (
              <View
                style={[styles.errorBox, { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }]}
              >
                <Feather name="alert-circle" size={14} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={[styles.label, { color: colors.foreground }]}>
              Email Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />

            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
              <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
                Remember your password?{" "}
              </Text>
              <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  content: { padding: 24 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 24 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: { color: "#dc2626", fontSize: 13, flex: 1 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 20,
  },
  btn: {
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  linkText: { fontSize: 14 },
  successBox: { alignItems: "center", paddingTop: 32, gap: 12 },
  successTitle: { fontSize: 22, fontWeight: "700", marginTop: 8 },
  successText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
  },
});
