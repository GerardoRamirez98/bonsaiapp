import { StyleSheet, Text, View } from "react-native";

type Props = {
    health: number;
    recommendation: string;
    status: "critical" | "warning" | "stable" | "excellent";
};

export default function BonsaiDashboard({
    health,
    recommendation,
    status,
}: Props) {
    const getColor = () => {
        switch (status) {
            case "critical":
                return "#E63946";
            case "warning":
                return "#F4A261";
            case "stable":
                return "#2A9D8F";
            case "excellent":
                return "#1B4332";
        }
    };

    const color = getColor();

    return (
        <View style={[styles.card, { borderLeftColor: color }]}>
            {/* HEADER */}
            <Text style={styles.title}>
                Estado del bonsái
            </Text>

            {/* SCORE */}
            <Text style={[styles.score, { color }]}>
                {health}/100
            </Text>

            {/* BAR VISUAL */}
            <View style={styles.barBackground}>
                <View
                    style={[
                        styles.barFill,
                        {
                            width: `${health}%`,
                            backgroundColor: color,
                        },
                    ]}
                />
            </View>

            {/* STATUS */}
            <Text style={[styles.status, { color }]}>
                {status.toUpperCase()}
            </Text>

            {/* RECOMENDACIÓN */}
            <Text style={styles.message}>
                {recommendation}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        marginVertical: 15,
        borderLeftWidth: 6,
    },

    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
    },

    score: {
        fontSize: 40,
        fontWeight: "800",
        marginTop: 10,
    },

    barBackground: {
        height: 10,
        backgroundColor: "#EAEAEA",
        borderRadius: 20,
        marginTop: 15,
        overflow: "hidden",
    },

    barFill: {
        height: "100%",
        borderRadius: 20,
    },

    status: {
        marginTop: 12,
        fontWeight: "700",
        letterSpacing: 1,
    },

    message: {
        marginTop: 10,
        color: "#555",
        lineHeight: 20,
    },
});