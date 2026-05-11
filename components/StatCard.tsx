import { StyleSheet, Text, View } from "react-native";

import { GLOBAL_STYLES } from "@/constants/styles";
import { THEME } from "@/constants/theme";

interface Props {
    value: string;
    label: string;
}

export default function StatCard({
    value,
    label,
}: Props) {
    return (
        <View style={[GLOBAL_STYLES.card, styles.card]}>
            <Text style={styles.value}>{value}</Text>

            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "48%",

        minHeight: 120,

        justifyContent: "space-between",

        padding: THEME.spacing.lg,

        borderRadius: THEME.radius.md,
    },

    value: {
        fontSize: 34,
        fontWeight: "700",

        color: THEME.colors.text,
    },

    label: {
        marginTop: THEME.spacing.sm,

        fontSize: 15,
        fontWeight: "500",

        color: THEME.colors.muted,
    },
});