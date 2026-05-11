import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import BonsaiDashboard from "../../components/BonsaiDashboard";
import WeatherCard from "../../components/WeatherCard";
import { useBonsaiStore } from "../../store/bonsaiStore";
import { getBonsaiRecommendation } from "../../utils/bonsaiEngine";
import { getBonsaiHealthScore } from "../../utils/bonsaiHealthScore";
import { getSpeciesCareTips } from "../../utils/careTips";
import { getSeason } from "../../utils/season";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const {
    bonsais,
    getCurrentBonsai,
    setCurrentBonsai,
    water,
    undoLastWatering,
    loadFromStorage,
  } = useBonsaiStore();

  const [isLoading, setIsLoading] = useState(true);
  const [weather, setWeatherData] = useState<any>(null);
  const [showSelector, setShowSelector] = useState(false);
  const contentWidth = width - 40;
  const metricCardWidth = (contentWidth - 12) / 2;
  const bonsaiCardWidth = (contentWidth - 14) / 2;

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadFromStorage();
      } catch (error) {
        console.error("Error loading from storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [loadFromStorage]);

  useFocusEffect(
    useCallback(() => {
      // Recompute or update UI when returning to Home.
    }, []),
  );

  const currentBonsai = getCurrentBonsai();
  const season = getSeason();
  const careTips = currentBonsai?.species
    ? getSpeciesCareTips(currentBonsai.species)
    : null;
  const lastWateringDate = currentBonsai?.lastWatering
    ? new Date(currentBonsai.lastWatering)
    : null;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B4332" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (bonsais.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.logo}>Mi Bonsái</Text>

          <View style={styles.emptyState}>
            <View style={styles.emptyPlaceholder}>
              <Text style={styles.placeholderIcon}>🌿</Text>
            </View>
            <Text style={styles.emptyTitle}>Sin bonsáis aún</Text>
            <Text style={styles.emptyText}>
              Comienza escaneando tu primer bonsái para iniciar el seguimiento
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.push("../bonsai-scan")}
          >
            <Text style={[styles.actionText, { color: "#fff" }]}>
              Escanear mi primer bonsái
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!currentBonsai) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.logo}>Mi Bonsái</Text>

          <View style={styles.selectorCard}>
            <Text style={styles.selectorTitle}>Selecciona un bonsái</Text>

            {bonsais.map((bonsai) => (
              <TouchableOpacity
                key={bonsai.id}
                style={styles.bonsaiOption}
                onPress={() => setCurrentBonsai(bonsai.id)}
              >
                {bonsai.heroPhoto && (
                  <Image
                    source={{ uri: bonsai.heroPhoto }}
                    style={styles.bonsaiOptionImage}
                  />
                )}
                <View style={styles.bonsaiOptionInfo}>
                  <Text style={styles.bonsaiOptionName}>{bonsai.nickname}</Text>
                  {bonsai.species && (
                    <Text style={styles.bonsaiOptionSpecies}>
                      {bonsai.species}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.primaryAction}
              onPress={() => router.push("../bonsai-scan")}
            >
              <Text style={[styles.actionText, { color: "#fff" }]}>
                Agregar otro bonsái
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const daysAgo = lastWateringDate
    ? Math.floor(
        (Date.now() - lastWateringDate.getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;

  const formattedDate = lastWateringDate
    ? lastWateringDate.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Nunca";

  const recommendation = getBonsaiRecommendation({
    wateringHistory: currentBonsai.wateringHistory ?? [],
    lastWatering: currentBonsai.lastWatering,
    daily: currentBonsai.daily,
    monthly: currentBonsai.monthly,
    season,
    temperature: weather?.temperature_2m ?? 25,
  });

  const health = getBonsaiHealthScore({
    wateringHistory: currentBonsai.wateringHistory ?? [],
    lastWatering: currentBonsai.lastWatering,
    temperature: weather?.temperature_2m ?? 25,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.logo, styles.headerLogo]}>Mi Bonsái</Text>
          {bonsais.length > 1 && (
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => setShowSelector(!showSelector)}
            >
              <Text style={styles.selectorButtonText}>
                {currentBonsai.nickname}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showSelector && bonsais.length > 1 && (
          <View style={styles.selectorCard}>
            <Text style={styles.selectorTitle}>Selecciona un bonsái</Text>
            {bonsais.map((bonsai) => (
              <TouchableOpacity
                key={bonsai.id}
                style={styles.bonsaiOption}
                onPress={() => {
                  setCurrentBonsai(bonsai.id);
                  setShowSelector(false);
                }}
              >
                {bonsai.heroPhoto && (
                  <Image
                    source={{ uri: bonsai.heroPhoto }}
                    style={styles.bonsaiOptionImage}
                  />
                )}
                <View style={styles.bonsaiOptionInfo}>
                  <Text style={styles.bonsaiOptionName}>{bonsai.nickname}</Text>
                  {bonsai.species && (
                    <Text style={styles.bonsaiOptionSpecies}>
                      {bonsai.species}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.hero}>
          {currentBonsai.heroPhoto ? (
            <Image
              source={{ uri: currentBonsai.heroPhoto }}
              style={styles.image}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.placeholderText}>Portada no disponible</Text>
            </View>
          )}

          <BonsaiDashboard
            health={health.score}
            recommendation={health.message}
            status={health.status}
          />

          <View style={styles.heroActions}>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => water(currentBonsai.id)}
            >
              <Text style={styles.heroButtonText}>💧 Regar</Text>
            </TouchableOpacity>
            {currentBonsai.lastWatering && (
              <TouchableOpacity
                style={[styles.heroButton, styles.secondaryHeroButton]}
                onPress={() => undoLastWatering(currentBonsai.id)}
              >
                <Text style={[styles.heroButtonText, { color: "#1B4332" }]}>
                  ↶ Deshacer
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.aiCard}>
            <Text style={styles.label}>Recomendación del sistema</Text>
            <Text style={[styles.tip, { color: recommendation.color }]}>
              {recommendation.message}
            </Text>
          </View>
        </View>

        <View style={styles.weatherSection}>
          <WeatherCard onWeather={setWeatherData} />
          <View style={styles.seasonCard}>
            <Text style={styles.label}>Estación actual</Text>
            <Text style={styles.seasonText}>{season}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.smallCard, { width: metricCardWidth }]}>
            <Text style={styles.label}>Último riego</Text>
            <Text style={styles.big}>
              {daysAgo === null
                ? "--"
                : daysAgo === 0
                  ? "Hoy"
                  : `${daysAgo} ${daysAgo === 1 ? "día" : "días"}`}
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          <View style={[styles.smallCard, { width: metricCardWidth }]}>
            <Text style={styles.label}>Fotos</Text>
            <Text style={styles.big}>
              {currentBonsai.photoHistory?.length || 0}
            </Text>
            <Text style={styles.date}>Total de imágenes</Text>
          </View>

          <View style={[styles.smallCard, { width: metricCardWidth }]}>
            <Text style={styles.label}>Riegos este mes</Text>
            <Text style={styles.big}>{currentBonsai.monthly}</Text>
            <Text style={styles.date}>Resumen mensual</Text>
          </View>

          <View style={[styles.smallCard, { width: metricCardWidth }]}>
            <Text style={styles.label}>Salud actual</Text>
            <Text style={styles.big}>{health.score}</Text>
            <Text style={styles.date}>{health.status}</Text>
          </View>
        </View>

        <View style={styles.careSection}>
          <Text style={styles.sectionTitle}>Plan de cuidados</Text>
          <Text style={styles.sectionText}>
            {currentBonsai.species
              ? `Consejos adaptados para ${currentBonsai.species}.`
              : "Registra la especie para obtener recomendaciones adaptadas."}
          </Text>
          {careTips ? (
            <View style={styles.tipCard}>
              <Text style={styles.tipCardTitle}>Riego</Text>
              <Text style={styles.tipCardText}>
                {careTips.wateringFrequency.spring}
              </Text>
              <Text style={styles.tipCardTitle}>Luz</Text>
              <Text style={styles.tipCardText}>{careTips.sunlight}</Text>
            </View>
          ) : null}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Tus bonsáis</Text>
        <View style={styles.cardGrid}>
          {bonsais.map((bonsai) => (
            <TouchableOpacity
              key={bonsai.id}
              style={[styles.cardItem, { width: bonsaiCardWidth }]}
              onPress={() => setCurrentBonsai(bonsai.id)}
            >
              {bonsai.heroPhoto ? (
                <Image
                  source={{ uri: bonsai.heroPhoto }}
                  style={styles.cardImage}
                />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <Text style={styles.cardImageText}>Foto</Text>
                </View>
              )}
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{bonsai.nickname}</Text>
                <Text style={styles.cardSubtitle}>
                  {bonsai.species ?? "Especie desconocida"}
                </Text>
                <Text style={styles.cardMeta}>
                  {bonsai.photoHistory?.length ?? 0} fotos
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => router.push("../bonsai-scan")}
          >
            <Text style={styles.actionText}>Escanear nuevo bonsái</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => router.push("/bonsai")}
          >
            <Text style={[styles.actionText, { color: "#1B4332" }]}>
              Ver detalles
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F2",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#1B4332",
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    marginVertical: 40,
  },
  emptyPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E9F5EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  placeholderIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B4332",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1B4332",
    marginBottom: 22,
  },
  headerLogo: {
    flex: 1,
    marginBottom: 0,
    marginRight: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  selectorButton: {
    backgroundColor: "#D9E8DE",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    maxWidth: "45%",
  },
  selectorButtonText: {
    color: "#1B4332",
    fontWeight: "700",
    textAlign: "center",
  },
  hero: {
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 260,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroPlaceholder: {
    width: "100%",
    height: 260,
    borderRadius: 20,
    backgroundColor: "#D9E8DE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderText: {
    color: "#4B6354",
    fontWeight: "700",
  },
  heroActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  heroButton: {
    flex: 1,
    backgroundColor: "#1B4332",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryHeroButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1B4332",
  },
  heroButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  aiCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B4332",
    marginBottom: 10,
  },
  tip: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  weatherSection: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  seasonCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    justifyContent: "center",
  },
  seasonText: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "700",
    color: "#1B4332",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  smallCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
  },
  big: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1B4332",
    marginVertical: 10,
  },
  date: {
    color: "#4B6354",
    fontSize: 13,
  },
  careSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B4332",
    marginBottom: 8,
  },
  sectionText: {
    color: "#4B6354",
    lineHeight: 22,
  },
  tipCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
  },
  tipCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B4332",
    marginBottom: 6,
  },
  tipCardText: {
    color: "#4B6354",
    lineHeight: 20,
    marginBottom: 8,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  cardItem: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
  },
  cardImage: {
    width: "100%",
    height: 140,
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 140,
    backgroundColor: "#D9E8DE",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImageText: {
    color: "#4B6354",
    fontWeight: "700",
  },
  cardInfo: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1B4332",
  },
  cardSubtitle: {
    marginTop: 6,
    color: "#4B6354",
    fontSize: 13,
  },
  cardMeta: {
    marginTop: 10,
    color: "#999",
    fontSize: 12,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryAction: {
    backgroundColor: "#1B4332",
  },
  secondaryAction: {
    backgroundColor: "#F7FAF6",
    borderColor: "#1B4332",
    borderWidth: 1,
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
  },
  selectorCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    gap: 12,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B4332",
    marginBottom: 12,
  },
  bonsaiOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  bonsaiOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
  },
  bonsaiOptionInfo: {
    flex: 1,
  },
  bonsaiOptionName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B4332",
  },
  bonsaiOptionSpecies: {
    color: "#4B6354",
    fontSize: 13,
  },
});
