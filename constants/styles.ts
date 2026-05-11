import { StyleSheet } from "react-native";
import { THEME } from "./theme";

export const GLOBAL_STYLES = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: THEME.colors.background,
        padding: THEME.spacing.lg,
    },

    card: {
        backgroundColor: THEME.colors.surface,

        borderRadius: THEME.radius.md,

        padding: THEME.spacing.md,

        borderWidth: 1,
        borderColor: THEME.colors.border,

        ...THEME.shadows?.card,
    },

    section: {
        marginBottom: THEME.spacing.lg,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
    },

    rowBetween: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    title: {
        ...THEME.typography.h1,
        color: THEME.colors.text,
    },

    subtitle: {
        ...THEME.typography.body,
        color: THEME.colors.muted,
    },
});