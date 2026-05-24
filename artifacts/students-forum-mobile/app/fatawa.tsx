import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useListFatawa,
  useCreateFatwa,
  getListFatawaQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useColors } from "@/hooks/useColors";

const STATUS_COLOR: Record<string, string> = {
  pending: "#B5832D",
  assigned: "#246B3C",
  answered: "#246B3C",
  closed: "#888",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Awaiting review",
  assigned: "Under review",
  answered: "Answered",
  closed: "Closed",
};

function timeAgo(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function FatawaScreen() {
  const router = useRouter();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { data: fatawa, isLoading } = useListFatawa({
    query: { queryKey: getListFatawaQueryKey() },
  });
  const create = useCreateFatwa();

  const [modalVisible, setModalVisible] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = () => {
    if (!question.trim()) return;
    create.mutate(
      { data: { question: question.trim(), category: category.trim() || undefined } },
      {
        onSuccess: () => {
          setModalVisible(false);
          setQuestion("");
          setCategory("");
          queryClient.invalidateQueries({ queryKey: getListFatawaQueryKey() });
        },
      },
    );
  };

  const s = styles(colors);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Fatawa</Text>
          <Text style={s.headerAr}>الفتاوى</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={s.askBtn}>
          <Feather name="plus" size={18} color="#fff" />
          <Text style={s.askBtnText}>Ask</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={s.centerContent}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !fatawa || fatawa.length === 0 ? (
        <View style={s.centerContent}>
          <Feather name="message-circle" size={36} color={colors.mutedForeground} />
          <Text style={s.emptyText}>No fatawa yet. Be the first to ask.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {fatawa.map((f) => {
            const statusColor = STATUS_COLOR[f.status as string] ?? "#888";
            const statusLabel = STATUS_LABEL[f.status as string] ?? f.status;
            return (
              <View key={f.id} style={s.card}>
                <View style={s.cardHeader}>
                  <Text style={s.questionText} numberOfLines={4}>
                    {f.question}
                  </Text>
                  <View style={[s.statusBadge, { borderColor: statusColor }]}>
                    <Text style={[s.statusText, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>
                {f.category ? (
                  <View style={s.categoryBadge}>
                    <Text style={s.categoryText}>{f.category}</Text>
                  </View>
                ) : null}
                {f.answer ? (
                  <View style={s.answerBox}>
                    <Text style={s.answerLabel}>Ruling</Text>
                    <Text style={s.answerText}>{f.answer}</Text>
                  </View>
                ) : null}
                <Text style={s.timeText}>{timeAgo(f.createdAt as string)}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle={Platform.OS === "ios" ? "formSheet" : "overFullScreen"}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={s.modalSafe}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Ask a Question</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="x" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={s.label}>Your question *</Text>
            <TextInput
              style={s.textarea}
              multiline
              numberOfLines={6}
              value={question}
              onChangeText={setQuestion}
              placeholder="Describe your question in detail…"
              placeholderTextColor={colors.mutedForeground}
              textAlignVertical="top"
            />
            <Text style={[s.label, { marginTop: 16 }]}>Category (optional)</Text>
            <TextInput
              style={s.input}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Fiqh, Aqeedah"
              placeholderTextColor={colors.mutedForeground}
            />
            <TouchableOpacity
              style={[s.submitBtn, (!question.trim() || create.isPending) && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!question.trim() || create.isPending}
            >
              {create.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitBtnText}>Submit question</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function styles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { padding: 4 },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.foreground,
    },
    headerAr: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "serif",
    },
    askBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    askBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
    centerContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 32,
    },
    emptyText: { color: colors.mutedForeground, textAlign: "center", fontSize: 15 },
    list: { padding: 16, gap: 12 },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    cardHeader: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
    questionText: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
      lineHeight: 22,
      fontWeight: "500",
    },
    statusBadge: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    statusText: { fontSize: 11, fontWeight: "600" },
    categoryBadge: {
      alignSelf: "flex-start",
      backgroundColor: colors.mutedForeground + "20",
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    categoryText: { fontSize: 12, color: colors.mutedForeground },
    answerBox: {
      backgroundColor: colors.primary + "10",
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    answerLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    answerText: { fontSize: 14, color: colors.foreground, lineHeight: 20 },
    timeText: { fontSize: 12, color: colors.mutedForeground },
    modalSafe: { flex: 1, backgroundColor: colors.background },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: colors.foreground },
    modalBody: { flex: 1, padding: 20 },
    label: { fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 6 },
    textarea: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: colors.foreground,
      backgroundColor: colors.card,
      minHeight: 130,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: colors.foreground,
      backgroundColor: colors.card,
    },
    submitBtn: {
      marginTop: 24,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  });
}
