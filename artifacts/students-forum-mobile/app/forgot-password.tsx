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
import {
  useForgotPassword,
  useResetPassword,
} from "@workspace/api-client-react";

type Step = "email" | "code" | "done";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const forgotPassword = useForgotPassword();
  const resetPassword = useResetPassword();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function handleSendCode() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    forgotPassword.mutate(
      { data: { email: email.trim() } },
      {
        onSuccess: () => {
          setStep("code");
        },
        onError: (err) => {
          const msg =
            err instanceof Error ? err.message : "Something went wrong. Please try again.";
          setError(msg);
        },
      }
    );
  }

  function handleResetPassword() {
    if (!code.trim()) {
      setError("Please enter the code from your email.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    resetPassword.mutate(
      { data: { email: email.trim(), code: code.trim(), newPassword } },
      {
        onSuccess: () => {
          setStep("done");
          router.replace("/login");
        },
        onError: (err) => {
          const msg =
            err instanceof Error ? err.message : "Invalid or expired code. Please try again.";
          setError(msg);
        },
      }
    );
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
        {step === "done" ? (
          <View style={styles.successBox}>
            <Feather name="check-circle" size={48} color={colors.primary} />
            <Text style={[styles.successTitle, { color: colors.foreground }]}>
              Password Reset!
            </Text>
            <Text style={[styles.successText, { color: colors.mutedForeground }]}>
              Your password has been updated. You can now sign in with your new
              password.
            </Text>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.btnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : step === "code" ? (
          <>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              We sent a 6-digit code to{" "}
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                {email}
              </Text>
              . Enter it below along with your new password.
            </Text>

            {!!error && (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
                ]}
              >
                <Feather name="alert-circle" size={14} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Text style={[styles.label, { color: colors.foreground }]}>
              Reset Code
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
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            <Text style={[styles.label, { color: colors.foreground }]}>
              New Password
            </Text>
            <View
              style={[
                styles.inputRow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  marginBottom: 20,
                },
              ]}
            >
              <TextInput
                style={[styles.inputInRow, { color: colors.foreground }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: colors.primary,
                  opacity: resetPassword.isPending ? 0.7 : 1,
                },
              ]}
              onPress={handleResetPassword}
              disabled={resetPassword.isPending}
            >
              {resetPassword.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Reset Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setStep("email");
                setCode("");
                setNewPassword("");
                setError("");
              }}
              style={styles.linkRow}
            >
              <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
                Wrong email?{" "}
              </Text>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Go back
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>
              Enter the email address associated with your account and we will
              send you a code to reset your password.
            </Text>

            {!!error && (
              <View
                style={[
                  styles.errorBox,
                  { backgroundColor: "#fee2e2", borderColor: "#fca5a5" },
                ]}
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
              onSubmitEditing={handleSendCode}
            />

            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: colors.primary,
                  opacity: forgotPassword.isPending ? 0.7 : 1,
                },
              ]}
              onPress={handleSendCode}
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Send Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
              <Text style={[styles.linkText, { color: colors.mutedForeground }]}>
                Remember your password?{" "}
              </Text>
              <Text style={[styles.linkText, { color: colors.primary }]}>
                Sign In
              </Text>
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
