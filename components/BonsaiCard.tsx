import { Image, StyleSheet, Text, View } from "react-native";

import { GLOBAL_STYLES } from "@/constants/styles";
import { THEME } from "@/constants/theme";

export default function BonsaiCard() {
    return (
        <View style={[GLOBAL_STYLES.card, styles.card]}>
            <Image
                source={{
                    uri: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
                }}
                style={styles.image}
            />

            <View style={styles.overlay}>
                <View>
                    <Text style={styles.title}>Juniperus Nana</Text>

                    <Text style={styles.subtitle}>
                        Excelente estado
                    </Text>
                </View>

                <View style={styles.scoreContainer}>
                    <Text style={styles.score}>8</Text>

                    <Text style={styles.scoreLabel}>Health Score</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 0,

        overflow: "hidden",

        borderRadius: THEME.radius.lg,
    },

    image: {
        width: "100%",
        height: 240,
    },

    overlay: {
        padding: THEME.spacing.lg,

        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },

    title: {
        ...THEME.typography.h2,

        color: THEME.colors.text,
    },

    subtitle: {
        marginTop: THEME.spacing.xs,

        color: THEME.colors.primary,

        fontSize: 15,
        fontWeight: "600",
    },

    scoreContainer: {
        alignItems: "center",
    },

    score: {
        fontSize: 42,
        fontWeight: "700",

        color: THEME.colors.text,
    },

    scoreLabel: {
        marginTop: 2,

        fontSize: 12,

        color: THEME.colors.muted,
    },
});