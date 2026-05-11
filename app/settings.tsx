import { StyleSheet, Text, View } from "react-native";

export default function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Configuración
            </Text>

            <Text style={styles.subtitle}>
                Próximamente
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
    },

    subtitle: {
        marginTop: 12,
        fontSize: 16,
        color: "#666",
    },
});