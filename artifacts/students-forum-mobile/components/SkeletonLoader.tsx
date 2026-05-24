import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = "100%", height = 16, borderRadius = 6, style }: SkeletonBoxProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, backgroundColor: colors.muted, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <View style={styles.headerText}>
          <SkeletonBox width={120} height={14} />
          <SkeletonBox width={80} height={11} style={{ marginTop: 5 }} />
        </View>
      </View>
      <SkeletonBox height={14} style={{ marginHorizontal: 14, marginBottom: 8 }} />
      <SkeletonBox height={14} width="70%" style={{ marginHorizontal: 14, marginBottom: 14 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  headerText: {
    flex: 1,
    gap: 5,
  },
});
