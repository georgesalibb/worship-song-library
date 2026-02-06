/**
 * App color system
 * Neutral modern base + church red accent
 */

import { Platform } from "react-native";

// 🔴 Church red (locked)
const CHURCH_RED = "#8B1E3F";

export const Colors = {
  light: {
    text: "#1C1C1E",
    background: "#FFFFFF",

    // Accent
    tint: CHURCH_RED,

    // Icons
    icon: "#6E6E73",
    tabIconDefault: "#6E6E73",
    tabIconSelected: CHURCH_RED,
  },

  dark: {
    text: "#ECEDEE",
    background: "#151718",

    // Accent stays church red
    tint: CHURCH_RED,

    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: CHURCH_RED,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:
      "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
