import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEME } from "@/constants/theme";

const LESSONS = [
  {
    icon: "water-outline",
    title: "Riego por temporada",
    description:
      "Ajusta frecuencia e intensidad según calor, humedad y estado del sustrato.",
  },
  {
    icon: "cut-outline",
    title: "Poda y estructura",
    description:
      "Prioriza ramas cruzadas, brotes débiles y mantenimiento de silueta.",
  },
  {
    icon: "sunny-outline",
    title: "Luz y ubicación",
    description:
      "Registra exposición solar para entender cómo responde cada árbol.",
  },
  {
    icon: "scan-outline",
    title: "Identificación por foto",
    description:
      "Usa la especie detectada como punto de partida y confirma con tus notas.",
  },
] as const;

export default function LearnScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.eyebrow}>Biblioteca</Text>
        <Text style={styles.title}>Aprender</Text>

        <View style={styles.featured}>
          <View style={styles.featuredIcon}>
            <Ionicons name="book-outline" size={28} color="#fff" />
          </View>
          <View style={styles.featuredCopy}>
            <Text style={styles.featuredTitle}>Rutina semanal sugerida</Text>
            <Text style={styles.featuredText}>
              Revisa humedad, gira la maceta, inspecciona hojas y actualiza la
              galería para comparar cambios.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Guías rápidas</Text>

        <View style={styles.lessonList}>
          {LESSONS.map((lesson) => (
            <TouchableOpacity key={lesson.title} style={styles.lessonCard}>
              <View style={styles.lessonIcon}>
                <Ionicons
                  name={lesson.icon}
                  size={22}
                  color={THEME.colors.primary}
                />
              </View>
              <View style={styles.lessonCopy}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonDescription}>
                  {lesson.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={THEME.colors.muted}
              />
            </TouchableOpacity>
          ))}
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
  featured: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    padding: 18,
    marginBottom: 22,
  },
  featuredIcon: {
    width: 54,
    height: 54,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginRight: 14,
  },
  featuredCopy: {
    flex: 1,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  featuredText: {
    color: "rgba(255,255,255,0.88)",
    lineHeight: 21,
  },
  sectionTitle: {
    color: THEME.colors.text,
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
  },
  lessonList: {
    gap: 12,
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
  },
  lessonIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F0E9",
    marginRight: 12,
  },
  lessonCopy: {
    flex: 1,
    paddingRight: 10,
  },
  lessonTitle: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  lessonDescription: {
    color: THEME.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
