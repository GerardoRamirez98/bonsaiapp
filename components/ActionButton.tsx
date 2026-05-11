import {
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

export default function ActionButton({
    title,
    onPress,
}: any) {
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Text style={styles.text}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#2D6A4F",

        paddingVertical: 12,
        borderRadius: 16,
        marginBottom: 10,

        alignItems: "center",
        justifyContent: "center",

        elevation: 3,
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },

    text: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
});