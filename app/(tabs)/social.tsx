import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEME } from "@/constants/theme";
import { useBonsaiStore } from "@/store/bonsaiStore";
import { getCollectionStats } from "@/utils/bonsaiInsights";

export default function SocialScreen() {
  const { bonsais, activeUserId, isSyncing, syncError } = useBonsaiStore();
  const stats = getCollectionStats(bonsais);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.eyebrow}>Comunidad</Text>
        <Text style={styles.title}>Social</Text>

        <View style={styles.accountCard}>
          <View style={styles.accountIcon}>
            <Ionicons
              name={activeUserId ? "cloud-done-outline" : "cloud-offline-outline"}
              size={28}
              color={THEME.colors.primary}
            />
          </View>
          <View style={styles.accountCopy}>
            <Text style={styles.accountTitle}>
              {activeUserId ? "Cuenta sincronizada" : "Conecta tu cuenta"}
            </Text>
            <Text style={[styles.accountText, syncError ? styles.errorText : null]}>
              {syncError
                ? syncError
                : isSyncing
                  ? "Sincronizando cambios..."
                  : activeUserId
                    ? `${stats.bonsaiCount} bonsáis disponibles en Firebase.`
                    : "Activa Firebase para preparar funciones multiusuario."}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.accountButton}
            onPress={() => router.push("/profile")}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={THEME.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Preparado para compartir</Text>
          <Text style={styles.panelText}>
            Esta sección queda lista para publicar avances, consultar galerías
            compartidas y recibir consejos cuando activemos el módulo social.
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Ionicons
              name="leaf-outline"
              size={24}
              color={THEME.colors.primary}
            />
            <Text style={styles.metricValue}>{stats.bonsaiCount}</Text>
            <Text style={styles.metricLabel}>bonsáis</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons
              name="images-outline"
              size={24}
              color={THEME.colors.primary}
            />
            <Text style={styles.metricValue}>{stats.photoCount}</Text>
            <Text style={styles.metricLabel}>fotos</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 140,
  },
  eyebrow: {
    color: THEME.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  title: {
    color: THEME.colors.text,
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 18,
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    marginBottom: 14,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F0E9",
    marginRight: 12,
  },
  accountCopy: {
    flex: 1,
  },
  accountTitle: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  accountText: {
    color: THEME.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: THEME.colors.danger,
  },
  accountButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  panel: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    padding: 18,
    marginBottom: 14,
  },
  panelTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  panelText: {
    color: "rgba(255,255,255,0.88)",
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 16,
  },
  metricValue: {
    color: THEME.colors.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 12,
  },
  metricLabel: {
    color: THEME.colors.muted,
    fontWeight: "700",
    marginTop: 3,
  },
});
