import { Platform } from "react-native";

export const THEME = {
  colors: {
    // Base
    background: "#F5F3EE",
    surface: "#FCFAF7",

    // Brand
    primary: "#2D6A4F",
    secondary: "#84A98C",

    // Text
    text: "#0F172A",
    muted: "#64748B",

    // UI
    border: "rgba(15, 23, 42, 0.06)",

    // States
    success: "#5BAE6D",
    warning: "#E9C46A",
    danger: "#E76F51",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },

  radius: {
    sm: 12,
    md: 20,
    lg: 28,
    full: 999,
  },

  typography: {
    h1: {
      fontSize: 34,
      fontWeight: "700" as const,
      lineHeight: 40,
    },

    h2: {
      fontSize: 24,
      fontWeight: "700" as const,
      lineHeight: 30,
    },

    h3: {
      fontSize: 18,
      fontWeight: "600" as const,
      lineHeight: 24,
    },

    body: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 22,
    },

    caption: {
      fontSize: 13,
      fontWeight: "500" as const,
      lineHeight: 18,
    },

    small: {
      fontSize: 12,
      fontWeight: "400" as const,
      lineHeight: 16,
    },
  },

  shadows: Platform.select({
    web: {
      card: {
        boxShadow: "0px 6px 18px rgba(0,0,0,0.05)",
      },
    },

    default: {
      card: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 5,
      },
    },
  }),

  fonts: Platform.select({
    ios: {
      sans: "System",
    },

    android: {
      sans: "Roboto",
    },

    web: {
      sans: "Inter, system-ui, sans-serif",
    },

    default: {
      sans: "sans-serif",
    },
  }),
};