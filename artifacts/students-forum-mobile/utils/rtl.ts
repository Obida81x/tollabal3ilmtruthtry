import { StyleSheet } from "react-native";

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function isArabic(text: string): boolean {
  return ARABIC_REGEX.test(text);
}

export const rtlStyle = StyleSheet.create({
  rtl: {
    textAlign: "right",
    writingDirection: "rtl",
  },
}).rtl;
