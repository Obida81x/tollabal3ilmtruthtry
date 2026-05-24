import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

const AVATAR_COLORS = [
  "#246B3C", "#B5832D", "#2D5BB5", "#8B2DB5", "#B52D2D",
  "#2DB58B", "#5B8B2D", "#2D7AB5", "#B52D8B", "#8B5B2D",
];

function getAvatarColor(seed: number | string): string {
  const n = typeof seed === "number" ? seed : seed.charCodeAt(0);
  return AVATAR_COLORS[Math.abs(n) % AVATAR_COLORS.length];
}

interface AvatarProps {
  displayName: string;
  userId?: number;
  size?: number;
}

export function Avatar({ displayName, userId = 0, size = 40 }: AvatarProps) {
  const colors = useColors();
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const bg = getAvatarColor(userId);
  const fontSize = Math.floor(size * 0.4);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.initials, { fontSize, color: colors.primaryForeground }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
});
