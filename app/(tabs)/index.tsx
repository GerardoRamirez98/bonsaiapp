import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEME } from "@/constants/theme";
import { getWeather, type WeatherSnapshot } from "@/services/weather";
import { useBonsaiStore } from "@/store/bonsaiStore";
import { getCareRecommendation } from "@/utils/careIntelligence";
import { getBonsaiHealthScore } from "@/utils/bonsaiHealthScore";
import {
  formatLastWatering,
  getCollectionCareTasks,
  getCollectionStats,
  getUniquePhotoCount,
  type BonsaiCareTask,
} from "@/utils/bonsaiInsights";

const TASK_ICON: Record<BonsaiCareTask["type"], keyof typeof Ionicons.glyphMap> = {
  health: "pulse-outline",
  photos: "images-outline",
  species: "scan-outline",
  water: "water-outline",
};

const TASK_ACTION: Record<BonsaiCareTask["type"], string> = {
  health: "Revisar",
  photos: "Agregar",
  species: "Escanear",
  water: "Registrar",
};

type CollectionFilter = "all" | "needsWater" | "needsPhoto" | "needsSpecies" | "atRisk";

const FILTER_LABELS: Record<CollectionFilter, string> = {
  all: "Todos",
  needsWater: "Riego",
  needsPhoto: "Fotos",
  needsSpecies: "Especie",
  atRisk: "Riesgo",
};

export default function CollectionScreen() {
  const {
    bonsais,
    setCurrentBonsai,
    water,
    loadFromStorage,
    isSyncing,
    syncError,
    activeUserId,
  } = useBonsaiStore();

  const [isLoading, setIsLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>("all");

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadFromStorage();
      } catch (error) {
        console.error("Error loading current bonsai:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initialize();
  }, [loadFromStorage]);

  useEffect(() => {
    void getWeather()
      .then(setWeather)
      .catch(() => setWeather(null));
  }, []);

  const tasks = useMemo(() => getCollectionCareTasks(bonsais).slice(0, 5), [bonsais]);
  const stats = useMemo(() => getCollectionStats(bonsais), [bonsais]);
  const focusBonsai = useMemo(
    () =>
      bonsais.find((bonsai) => bonsai.id === tasks[0]?.bonsaiId) ?? bonsais[0],
    [bonsais, tasks],
  );
  const careRecommendation = useMemo(
    () => (focusBonsai ? getCareRecommendation(focusBonsai, weather) : null),
    [focusBonsai, weather],
  );
  const filteredBonsais = useMemo(() => {
    if (activeFilter === "all") return bonsais;

    return bonsais.filter((bonsai) => {
      const health = getBonsaiHealthScore({
        wateringHistory: bonsai.wateringHistory ?? [],
        lastWatering: bonsai.lastWatering,
      });
      const photoCount = getUniquePhotoCount(bonsai);
      const bonsaiTasks = getCollectionCareTasks([bonsai]);

      if (activeFilter === "needsWater") {
        return bonsaiTasks.some((task) => task.type === "water");
      }

      if (activeFilter === "needsPhoto") {
        return photoCount < 4;
      }

      if (activeFilter === "needsSpecies") {
        return !bonsai.species;
      }

      return health.status === "critical" || health.status === "warning";
    });
  }, [activeFilter, bonsais]);

  const handleTaskPress = (task: BonsaiCareTask) => {
    setCurrentBonsai(task.bonsaiId);

    if (task.type === "water") {
      water(task.bonsaiId);
      return;
    }

    if (task.type === "health") {
      router.push("/bonsai");
      return;
    }

    router.push("/bonsai-scan");
  };

  const syncStatus = syncError
    ? syncError
    : isSyncing
      ? "Sincronizando con Firebase..."
      : activeUserId
        ? "Sincronizado con Firebase"
        : "Inicia sesión para activar sincronización";

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Cargando colección...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Mi Bonsái</Text>
            <Text style={styles.title}>Colección</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Abrir perfil"
            style={styles.iconButton}
            onPress={() => router.push("/profile")}
          >
            <Ionicons
              name="person-circle-outline"
              size={28}
              color={THEME.colors.primary}
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.syncStatus, syncError ? styles.syncError : null]}>
          {syncStatus}
        </Text>

        {bonsais.length > 0 ? (
          <>
            <View style={styles.metricsStrip}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{stats.averageHealth}</Text>
                <Text style={styles.metricLabel}>Salud</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{stats.photoCount}</Text>
                <Text style={styles.metricLabel}>Fotos</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{stats.pendingTasks}</Text>
                <Text style={styles.metricLabel}>Pendientes</Text>
              </View>
            </View>

            {focusBonsai && careRecommendation ? (
              <TouchableOpacity
                style={[
                  styles.careCard,
                  careRecommendation.urgency === "high" && styles.careCardHigh,
                ]}
                onPress={() => {
                  setCurrentBonsai(focusBonsai.id);
                  router.push("/bonsai");
                }}
              >
                <View style={styles.careIcon}>
                  <Ionicons
                    name={
                      careRecommendation.urgency === "high"
                        ? "alert-circle-outline"
                        : "sparkles-outline"
                    }
                    size={22}
                    color={THEME.colors.primary}
                  />
                </View>
                <View style={styles.careBody}>
                  <Text style={styles.careKicker}>{focusBonsai.nickname}</Text>
                  <Text style={styles.careTitle}>
                    {careRecommendation.title}
                  </Text>
                  <Text style={styles.careText}>
                    {careRecommendation.nextWateringLabel}
                  </Text>
                  {weather ? (
                    <Text style={styles.careWeather}>
                      {Math.round(weather.temperature)}°C · {weather.humidity}%
                      humedad · {weather.rainProbability}% lluvia
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.careScore}>{careRecommendation.score}</Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actividades por hacer</Text>
          <Text style={styles.sectionMeta}>{tasks.length} pendientes</Text>
        </View>

        <View style={styles.taskList}>
          {tasks.length === 0 ? (
            <View style={styles.doneCard}>
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color={THEME.colors.success}
              />
              <View style={styles.doneContent}>
                <Text style={styles.doneTitle}>Todo al día</Text>
                <Text style={styles.doneText}>
                  Tu colección no tiene tareas urgentes por ahora.
                </Text>
              </View>
            </View>
          ) : (
            tasks.map((task) => (
              <Pressable key={task.id} style={styles.taskCard}>
                <View style={styles.taskIcon}>
                  <Ionicons
                    name={TASK_ICON[task.type]}
                    size={22}
                    color={THEME.colors.primary}
                  />
                </View>
                <View style={styles.taskBody}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                </View>
                <TouchableOpacity
                  style={styles.taskAction}
                  onPress={() => handleTaskPress(task)}
                >
                  <Text style={styles.taskActionText}>
                    {TASK_ACTION[task.type]}
                  </Text>
                </TouchableOpacity>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus bonsáis</Text>
          <Text style={styles.sectionMeta}>
            {filteredBonsais.length} de {bonsais.length}
          </Text>
        </View>

        {bonsais.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {(Object.keys(FILTER_LABELS) as CollectionFilter[]).map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {FILTER_LABELS[filter]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        {bonsais.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="leaf-outline" size={42} color="#7C947F" />
            </View>
            <Text style={styles.emptyTitle}>Aún no hay bonsáis</Text>
            <Text style={styles.emptyText}>
              Agrega el primero para empezar con historial, galería y
              recordatorios.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/bonsai-scan")}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Agregar bonsái</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.collectionList}>
            {filteredBonsais.length === 0 ? (
              <View style={styles.doneCard}>
                <Ionicons
                  name="filter-outline"
                  size={24}
                  color={THEME.colors.primary}
                />
                <View style={styles.doneContent}>
                  <Text style={styles.doneTitle}>Sin resultados</Text>
                  <Text style={styles.doneText}>
                    No hay bonsáis dentro de este filtro.
                  </Text>
                </View>
              </View>
            ) : null}

            {filteredBonsais.map((bonsai) => {
              const health = getBonsaiHealthScore({
                wateringHistory: bonsai.wateringHistory ?? [],
                lastWatering: bonsai.lastWatering,
              });
              const photoCount = getUniquePhotoCount(bonsai);

              return (
                <TouchableOpacity
                  key={bonsai.id}
                  style={styles.bonsaiCard}
                  onPress={() => {
                    setCurrentBonsai(bonsai.id);
                    router.push("/bonsai");
                  }}
                >
                  {bonsai.heroPhoto ? (
                    <Image
                      source={{ uri: bonsai.heroPhoto }}
                      style={styles.bonsaiImage}
                    />
                  ) : (
                    <View style={styles.bonsaiImagePlaceholder}>
                      <Ionicons name="image-outline" size={28} color="#7C947F" />
                    </View>
                  )}

                  <View style={styles.bonsaiInfo}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.bonsaiName} numberOfLines={1}>
                        {bonsai.nickname}
                      </Text>
                      <View style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>{health.score}</Text>
                      </View>
                    </View>
                    <Text style={styles.bonsaiSpecies} numberOfLines={1}>
                      {bonsai.species ?? "Especie pendiente"}
                    </Text>

                    <View style={styles.bonsaiStats}>
                      <View style={styles.statPill}>
                        <Ionicons
                          name="water-outline"
                          size={15}
                          color={THEME.colors.primary}
                        />
                        <Text style={styles.statText}>
                          {formatLastWatering(bonsai.lastWatering)}
                        </Text>
                      </View>
                      <View style={styles.statPill}>
                        <Ionicons
                          name="images-outline"
                          size={15}
                          color={THEME.colors.primary}
                        />
                        <Text style={styles.statText}>{photoCount} fotos</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        accessibilityLabel="Agregar bonsái"
        style={styles.fab}
        onPress={() => router.push("/bonsai-scan")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
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
    paddingBottom: 150,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: THEME.colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
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
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.surface,
  },
  syncStatus: {
    color: THEME.colors.muted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 18,
  },
  syncError: {
    color: THEME.colors.danger,
  },
  metricsStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#102A24",
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  metricLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  careCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    marginBottom: 18,
  },
  careCardHigh: {
    borderColor: "rgba(231,111,81,0.35)",
    backgroundColor: "#FFF7F3",
  },
  careIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F0E9",
    marginRight: 12,
  },
  careBody: {
    flex: 1,
  },
  careKicker: {
    color: THEME.colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 2,
  },
  careTitle: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  careText: {
    color: THEME.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  careWeather: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 5,
  },
  careScore: {
    color: THEME.colors.primary,
    fontSize: 24,
    fontWeight: "900",
    marginLeft: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: THEME.colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
  sectionMeta: {
    color: THEME.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  taskList: {
    gap: 10,
    marginBottom: 18,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 12,
  },
  taskIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F0E9",
    marginRight: 12,
  },
  taskBody: {
    flex: 1,
    paddingRight: 8,
  },
  taskTitle: {
    color: THEME.colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },
  taskDescription: {
    color: THEME.colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  taskAction: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  taskActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  doneCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  doneContent: {
    marginLeft: 12,
    flex: 1,
  },
  doneTitle: {
    color: THEME.colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  doneText: {
    marginTop: 3,
    color: THEME.colors.muted,
    lineHeight: 19,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F0E9",
    marginBottom: 16,
  },
  emptyTitle: {
    color: THEME.colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyText: {
    color: THEME.colors.muted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
  },
  collectionList: {
    gap: 12,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterChipText: {
    color: THEME.colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  bonsaiCard: {
    flexDirection: "row",
    backgroundColor: THEME.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 10,
  },
  bonsaiImage: {
    width: 92,
    height: 104,
    borderRadius: 8,
  },
  bonsaiImagePlaceholder: {
    width: 92,
    height: 104,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F0E9",
  },
  bonsaiInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "space-between",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bonsaiName: {
    flex: 1,
    color: THEME.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  bonsaiSpecies: {
    color: THEME.colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  scoreBadge: {
    minWidth: 36,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F0E9",
  },
  scoreText: {
    color: THEME.colors.primary,
    fontWeight: "900",
  },
  bonsaiStats: {
    gap: 7,
    marginTop: 10,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    color: THEME.colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 126,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
});
