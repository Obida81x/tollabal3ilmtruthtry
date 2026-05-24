import React, { useState } from "react";
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
  useGetTest,
  useSubmitTestAttempt,
  getGetTestQueryKey,
} from "@workspace/api-client-react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

export default function TestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const testId = parseInt(id ?? "0", 10);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);

  const { data: test, isLoading } = useGetTest(testId, {
    query: { queryKey: getGetTestQueryKey(testId), enabled: testId > 0 },
  });

  const submit = useSubmitTestAttempt();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 20;

  function selectAnswer(questionId: number, optionIndex: number) {
    if (result) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function handleSubmit() {
    if (!test) return;
    const answersArray = (test as any).questions.map((q: any) => ({
      questionId: q.id,
      selectedOptionIndex: answers[q.id] ?? 0,
    }));
    submit.mutate(
      { id: testId, data: { answers: answersArray } },
      {
        onSuccess: (data) => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setResult(data);
        },
      }
    );
  }

  const questions = (test as any)?.questions ?? [];
  const allAnswered = questions.length > 0 && questions.every((q: any) => answers[q.id] !== undefined);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
            {(test as any)?.title ?? "Test"}
          </Text>
        </View>
      </View>

      {result ? (
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: botPad }}>
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.resultIcon, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="award" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.resultTitle, { color: colors.foreground }]}>Test Complete!</Text>
            <Text style={[styles.resultScore, { color: colors.primary }]}>
              {result.score ?? 0} / {result.totalQuestions ?? questions.length}
            </Text>
            <Text style={[styles.resultPct, { color: colors.mutedForeground }]}>
              {result.percentage != null ? `${Math.round(result.percentage)}%` : ""}
            </Text>
            {result.isPassed != null && (
              <View style={[styles.passBadge, { backgroundColor: result.isPassed ? "#246B3C18" : "#B8333318", borderColor: result.isPassed ? "#246B3C40" : "#B8333340" }]}>
                <Text style={[styles.passBadgeText, { color: result.isPassed ? colors.primary : colors.destructive }]}>
                  {result.isPassed ? "Passed ✓" : "Not Passed"}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.doneBtnText, { color: colors.primaryForeground }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: botPad }}>
          {(test as any)?.description && (
            <Text style={[styles.desc, { color: colors.mutedForeground }]}>{(test as any).description}</Text>
          )}

          {questions.map((q: any, qi: number) => (
            <View key={q.id} style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.questionNum, { color: colors.mutedForeground }]}>Question {qi + 1}</Text>
              <Text style={[styles.questionText, { color: colors.foreground }]}>{q.text}</Text>
              <View style={{ gap: 8, marginTop: 12 }}>
                {(q.options ?? []).map((opt: string, oi: number) => {
                  const selected = answers[q.id] === oi;
                  return (
                    <TouchableOpacity
                      key={oi}
                      style={[
                        styles.optionBtn,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.primary + "12" : colors.background,
                        },
                      ]}
                      onPress={() => selectAnswer(q.id, oi)}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.optionCircle,
                        {
                          borderColor: selected ? colors.primary : colors.border,
                          backgroundColor: selected ? colors.primary : "transparent",
                        },
                      ]}>
                        {selected && <View style={styles.optionDot} />}
                      </View>
                      <Text style={[styles.optionText, { color: selected ? colors.primary : colors.foreground }]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {questions.length > 0 && (
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: allAnswered ? 1 : 0.5 }]}
              onPress={handleSubmit}
              disabled={!allAnswered || submit.isPending}
              activeOpacity={0.85}
            >
              {submit.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
                  Submit Answers
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 4,
  },
  backBtn: { padding: 4, marginTop: 4 },
  title: { fontSize: 20, fontWeight: "700" as const },
  desc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  questionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  questionNum: { fontSize: 12, fontWeight: "500" as const, marginBottom: 6 },
  questionText: { fontSize: 15, fontWeight: "600" as const, lineHeight: 22 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  optionText: { fontSize: 14, flex: 1 },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: { fontSize: 16, fontWeight: "600" as const },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  resultTitle: { fontSize: 22, fontWeight: "700" as const },
  resultScore: { fontSize: 36, fontWeight: "700" as const },
  resultPct: { fontSize: 16 },
  passBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  passBadgeText: { fontSize: 14, fontWeight: "600" as const },
  doneBtn: {
    borderRadius: 10,
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginTop: 8,
  },
  doneBtnText: { fontSize: 16, fontWeight: "600" as const },
});
