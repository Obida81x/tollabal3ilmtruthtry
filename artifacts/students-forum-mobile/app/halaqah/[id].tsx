import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useGetChatGroup,
  useListChatMessages,
  usePostChatMessage,
  getListChatMessagesQueryKey,
  getGetChatGroupQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { KeyboardAvoidingView as KAV } from "react-native-keyboard-controller";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { isArabic, rtlStyle } from "@/utils/rtl";

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function HalaqahRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const groupId = parseInt(id ?? "0", 10);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const flatRef = useRef<FlatList>(null);

  const { data: group } = useGetChatGroup(groupId, {
    query: { queryKey: getGetChatGroupQueryKey(groupId), enabled: groupId > 0 },
  });

  const { data: messages, isLoading } = useListChatMessages(groupId, {
    query: {
      queryKey: getListChatMessagesQueryKey(groupId),
      enabled: groupId > 0,
      refetchInterval: 5000,
    },
  });

  const sendMessage = usePostChatMessage();

  function handleSend() {
    const content = text.trim();
    if (!content) return;
    setText("");
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage.mutate(
      { id: groupId, data: { content } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListChatMessagesQueryKey(groupId) });
        },
      }
    );
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const reversed = [...(messages ?? [])].reverse();

  return (
    <KAV
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {(group as any)?.name ?? "Ḥalaqah"}
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {(group as any)?.gender === "male" ? "Brothers" : "Sisters"}
          </Text>
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={reversed}
          keyExtractor={(item: any) => String(item.id)}
          inverted
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Feather name="message-circle" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyChatText, { color: colors.mutedForeground }]}>
                Start the conversation with bismillah
              </Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => {
            const isMe = user?.id === item.authorId;
            const authorName = item.author?.displayName ?? "Member";
            return (
              <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
                {!isMe && (
                  <Avatar displayName={authorName} userId={item.authorId} size={30} />
                )}
                <View
                  style={[
                    styles.bubble,
                    isMe
                      ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                      : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 4 },
                  ]}
                >
                  {!isMe && (
                    <Text style={[styles.bubbleName, { color: colors.secondary }]}>{authorName}</Text>
                  )}
                  <Text
                    style={[
                      styles.bubbleText,
                      { color: isMe ? colors.primaryForeground : colors.foreground },
                      isArabic(item.content) && rtlStyle,
                    ]}
                  >
                    {item.content}
                  </Text>
                  <Text style={[styles.bubbleTime, { color: isMe ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input */}
      <View style={[styles.inputArea, { borderTopColor: colors.border, backgroundColor: colors.card, paddingBottom: botPad + 8 }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.muted }]}
          onPress={handleSend}
          disabled={!text.trim() || sendMessage.isPending}
          activeOpacity={0.8}
        >
          {sendMessage.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="send" size={18} color={text.trim() ? "#fff" : colors.mutedForeground} />
          )}
        </TouchableOpacity>
      </View>
    </KAV>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "700" as const },
  headerSub: { fontSize: 12, marginTop: 1 },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyChat: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyChatText: { fontSize: 14, textAlign: "center", paddingHorizontal: 24 },
  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 10,
  },
  msgRowMe: { flexDirection: "row-reverse" },
  bubble: {
    maxWidth: "76%",
    borderRadius: 16,
    padding: 10,
  },
  bubbleName: { fontSize: 12, fontWeight: "600" as const, marginBottom: 3 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginTop: 4, textAlign: "right" },
  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
