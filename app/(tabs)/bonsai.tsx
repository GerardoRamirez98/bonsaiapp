import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEME } from "@/constants/theme";
import { useBonsaiStore } from "@/store/bonsaiStore";
import {
  getLocalDateString,
  getLocalTimeString,
  isDateString,
  isTimeString,
} from "@/utils/dateTime";

const EVENT_LABELS: Record<string, string> = {
  water: "Riego",
  fertilizer: "Fertilizante",
  prune: "Poda",
  repot: "Trasplante",
  wire: "Alambrado",
  scan: "Escaneo",
  sunExposure: "Sol",
  note: "Nota",
};

function getTodayDate() {
  return getLocalDateString();
}

function getCurrentTime() {
  return getLocalTimeString();
}

function formatDate(value?: string | null) {
  if (!value) return "Sin registro";

  return new Date(value).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "Sin registro";

  return new Date(value).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BonsaiScreen() {
  const currentBonsai = useBonsaiStore((state) =>
    state.bonsais.find((b) => b.id === state.currentBonsaiId),
  );
  const deletePhotos = useBonsaiStore((state) => state.deletePhotos);
  const setHeroPhoto = useBonsaiStore((state) => state.setHeroPhoto);
  const undoLastWatering = useBonsaiStore((state) => state.undoLastWatering);
  const recordWateringEvent = useBonsaiStore(
    (state) => state.recordWateringEvent,
  );
  const addSunExposureEvent = useBonsaiStore(
    (state) => state.addSunExposureEvent,
  );

  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [waterDate, setWaterDate] = useState(getTodayDate());
  const [waterTime, setWaterTime] = useState(getCurrentTime());
  const [waterNotes, setWaterNotes] = useState("");

  const totalEvents = useMemo(
    () => currentBonsai?.timeline?.length ?? 0,
    [currentBonsai],
  );

  const latestEvent = useMemo(
    () => currentBonsai?.timeline?.slice().reverse()[0] ?? null,
    [currentBonsai],
  );

  const galleryPhotos = useMemo(() => {
    const grouped = new Map<
      string,
      {
        uri: string;
        ids: string[];
        label: string;
        capturedAt: string;
      }
    >();

    for (const photo of currentBonsai?.photoHistory ?? []) {
      const existing = grouped.get(photo.uri);

      if (existing) {
        existing.ids.push(photo.id);
      } else {
        grouped.set(photo.uri, {
          uri: photo.uri,
          ids: [photo.id],
          label: photo.label || "Foto",
          capturedAt: photo.capturedAt,
        });
      }
    }

    return Array.from(grouped.values());
  }, [currentBonsai]);

  if (!currentBonsai) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.heading}>Mi Bonsái</Text>
          <Text style={styles.emptyText}>
            Selecciona o agrega un bonsái desde Inicio.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedPhotoUris = galleryPhotos
    .filter((photo) => photo.ids.some((id) => selectedPhotos.includes(id)))
    .map((photo) => photo.uri);

  const togglePhotoSelection = (photoIds: string[]) => {
    setSelectedPhotos((current) => {
      const isSelected = photoIds.every((id) => current.includes(id));

      if (isSelected) {
        return current.filter((id) => !photoIds.includes(id));
      }

      return Array.from(new Set([...current, ...photoIds]));
    });
  };

  const confirmDeletePhotos = () => {
    if (!selectedPhotos.length) return;

    Alert.alert(
      "Eliminar fotos",
      `¿Eliminar ${selectedPhotos.length} registro(s) de foto?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deletePhotos(currentBonsai.id, selectedPhotos);
            setSelectedPhotos([]);
          },
        },
      ],
    );
  };

  const handleSetCoverPhoto = () => {
    const [firstSelectedPhoto] = selectedPhotoUris;
    if (!firstSelectedPhoto) return;

    setHeroPhoto(currentBonsai.id, firstSelectedPhoto);
    setSelectedPhotos([]);
  };

  const fillCurrentWateringTime = () => {
    setWaterDate(getTodayDate());
    setWaterTime(getCurrentTime());
  };

  const registerManualWatering = () => {
    if (!isDateString(waterDate)) {
      Alert.alert("Fecha inválida", "Usa el formato AAAA-MM-DD.");
      return;
    }

    if (!isTimeString(waterTime)) {
      Alert.alert("Hora inválida", "Usa el formato HH:mm.");
      return;
    }

    recordWateringEvent(currentBonsai.id, {
      date: waterDate,
      time: waterTime,
      type: "water",
      intensity: 1,
      notes: waterNotes.trim() || undefined,
    });

    setWaterNotes("");
    Alert.alert("Riego registrado", `Guardado para ${waterDate} a las ${waterTime}.`);
  };

  const registerSunExposure = () => {
    const now = new Date();
    const start = new Date(now.getTime() - 60 * 60 * 1000);

    addSunExposureEvent(currentBonsai.id, {
      date: getLocalDateString(now),
      startTime: getLocalTimeString(start),
      endTime: getLocalTimeString(now),
      durationMinutes: 60,
      temperature: undefined,
      notes: "Registro rápido de sol",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>{currentBonsai.nickname}</Text>

        <View style={styles.heroCard}>
          {currentBonsai.heroPhoto ? (
            <Image
              source={{ uri: currentBonsai.heroPhoto }}
              style={styles.heroImage}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderText}>Sin portada</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Fotos</Text>
              <Text style={styles.statValue}>{galleryPhotos.length}</Text>
              {currentBonsai.photoHistory?.length !== galleryPhotos.length ? (
                <Text style={styles.statHint}>
                  {currentBonsai.photoHistory?.length ?? 0} registros
                </Text>
              ) : null}
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Eventos</Text>
              <Text style={styles.statValue}>{totalEvents}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Sol</Text>
              <Text style={styles.statValue}>
                {currentBonsai.sunExposureHistory?.length ?? 0}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Especie</Text>
            <Text style={styles.infoValue}>
              {currentBonsai.species || currentBonsai.commonName || "Pendiente"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Último riego</Text>
            <Text style={styles.infoValue}>
              {formatDateTime(currentBonsai.lastWatering)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Último evento</Text>
            <Text style={styles.infoValue}>
              {latestEvent
                ? `${EVENT_LABELS[latestEvent.type] ?? latestEvent.title} · ${
                    latestEvent.date
                  } ${latestEvent.time}`
                : "Sin actividad"}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Registrar riego manual</Text>
          <Text style={styles.sectionHelp}>
            Guarda la fecha y hora exactas en las que lo regaste.
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha</Text>
              <TextInput
                style={styles.input}
                value={waterDate}
                onChangeText={setWaterDate}
                placeholder="AAAA-MM-DD"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hora</Text>
              <TextInput
                style={styles.input}
                value={waterTime}
                onChangeText={setWaterTime}
                placeholder="HH:mm"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Notas</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={waterNotes}
            onChangeText={setWaterNotes}
            placeholder="Ej. riego profundo, sustrato seco..."
            multiline
          />

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={fillCurrentWateringTime}
            >
              <Text style={styles.secondaryButtonText}>Usar ahora</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryInlineButton}
              onPress={registerManualWatering}
            >
              <Text style={styles.primaryButtonText}>Guardar riego</Text>
            </TouchableOpacity>
          </View>

          {currentBonsai.lastWatering ? (
            <TouchableOpacity
              style={styles.quietButton}
              onPress={() => undoLastWatering(currentBonsai.id)}
            >
              <Text style={styles.quietButtonText}>Deshacer último riego</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={registerSunExposure}
          >
            <Text style={styles.secondaryButtonText}>Registrar sol</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("../bonsai-scan")}
          >
            <Text style={styles.secondaryButtonText}>Tomar foto</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push("../bonsai-scan")}
        >
          <Text style={styles.scanButtonText}>Escanear bonsái completo</Text>
        </TouchableOpacity>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Galería de revisión</Text>
              <Text style={styles.sectionHelp}>
                Toca fotos para marcarlas y decidir si conservarlas o eliminarlas.
              </Text>
            </View>
            {selectedPhotos.length > 0 ? (
              <Text style={styles.selectedCount}>
                {selectedPhotos.length} registro(s)
              </Text>
            ) : null}
          </View>

          {selectedPhotos.length > 0 ? (
            <View style={styles.selectionBar}>
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={handleSetCoverPhoto}
              >
                <Text style={styles.selectionButtonText}>Usar portada</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={() => setSelectedPhotos([])}
              >
                <Text style={styles.selectionButtonText}>Conservar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectionButton, styles.dangerSelectionButton]}
                onPress={confirmDeletePhotos}
              >
                <Text style={styles.dangerSelectionText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {!galleryPhotos.length ? (
            <Text style={styles.emptyText}>
              No tienes fotos registradas aún.
            </Text>
          ) : (
            <View style={styles.galleryGrid}>
              {galleryPhotos.map((photo) => {
                const isSelected = photo.ids.some((id) =>
                  selectedPhotos.includes(id),
                );

                return (
                  <TouchableOpacity
                    key={photo.uri}
                    style={[
                      styles.galleryItem,
                      isSelected && styles.galleryItemSelected,
                    ]}
                    onPress={() => togglePhotoSelection(photo.ids)}
                  >
                    <Image source={{ uri: photo.uri }} style={styles.galleryImage} />
                    <View style={styles.galleryMeta}>
                      <Text style={styles.photoLabel}>{photo.label}</Text>
                      <Text style={styles.photoDate}>
                        {formatDate(photo.capturedAt)}
                      </Text>
                    </View>
                    {photo.ids.length > 1 ? (
                      <Text style={styles.duplicateBadge}>
                        {photo.ids.length} registros
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Línea de tiempo</Text>
          {currentBonsai.timeline?.length ? (
            currentBonsai.timeline
              .slice()
              .reverse()
              .map((event) => (
                <View key={event.id} style={styles.timelineRow}>
                  <Text style={styles.timelineTitle}>
                    {EVENT_LABELS[event.type] ?? event.title}
                  </Text>
                  <Text style={styles.timelineTime}>
                    {event.date} · {event.time}
                  </Text>
                  {event.description ? (
                    <Text style={styles.timelineDescription}>
                      {event.description}
                    </Text>
                  ) : null}
                </View>
              ))
          ) : (
            <Text style={styles.emptyText}>
              Aún no hay eventos para este bonsái.
            </Text>
          )}
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
  emptyContainer: {
    padding: THEME.spacing.lg,
  },
  content: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: THEME.colors.text,
    marginBottom: THEME.spacing.lg,
  },
  heroCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    overflow: "hidden",
    marginBottom: THEME.spacing.lg,
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  heroPlaceholder: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5EB",
  },
  heroPlaceholderText: {
    color: THEME.colors.muted,
    fontSize: 16,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    padding: THEME.spacing.md,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  statLabel: {
    color: THEME.colors.muted,
    fontSize: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
  },
  statHint: {
    color: THEME.colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
  },
  infoLabel: {
    color: THEME.colors.muted,
    fontWeight: "600",
  },
  infoValue: {
    flex: 1,
    color: THEME.colors.text,
    fontWeight: "700",
    textAlign: "right",
  },
  sectionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  sectionHelp: {
    color: THEME.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: THEME.spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    gap: THEME.spacing.sm,
    marginTop: THEME.spacing.md,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    color: THEME.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: THEME.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.sm,
    color: THEME.colors.text,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: "#fff",
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: THEME.spacing.md,
  },
  primaryInlineButton: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.md,
    borderRadius: THEME.radius.md,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    padding: THEME.spacing.md,
    borderRadius: THEME.radius.md,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: THEME.colors.primary,
    fontWeight: "700",
    textAlign: "center",
  },
  quietButton: {
    alignItems: "center",
    paddingVertical: THEME.spacing.sm,
    marginTop: THEME.spacing.xs,
  },
  quietButtonText: {
    color: THEME.colors.muted,
    fontWeight: "700",
  },
  scanButton: {
    alignItems: "center",
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  scanButtonText: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  selectedCount: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  selectionBar: {
    flexDirection: "row",
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  selectionButton: {
    flex: 1,
    minWidth: 0,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: THEME.spacing.sm,
    alignItems: "center",
  },
  selectionButtonText: {
    color: THEME.colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  dangerSelectionButton: {
    borderColor: THEME.colors.danger,
  },
  dangerSelectionText: {
    color: THEME.colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: THEME.spacing.sm,
  },
  galleryItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: "hidden",
  },
  galleryItemSelected: {
    borderColor: THEME.colors.primary,
    borderWidth: 2,
  },
  galleryImage: {
    width: "100%",
    height: 130,
  },
  galleryMeta: {
    padding: THEME.spacing.sm,
  },
  photoLabel: {
    fontWeight: "700",
    color: THEME.colors.text,
  },
  photoDate: {
    color: THEME.colors.muted,
    marginTop: THEME.spacing.xs,
    fontSize: 12,
  },
  duplicateBadge: {
    position: "absolute",
    top: THEME.spacing.sm,
    right: THEME.spacing.sm,
    overflow: "hidden",
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.primary,
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 2,
  },
  timelineRow: {
    marginBottom: THEME.spacing.md,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  timelineTime: {
    color: THEME.colors.muted,
    marginTop: THEME.spacing.xs,
  },
  timelineDescription: {
    marginTop: THEME.spacing.xs,
    color: THEME.colors.muted,
  },
  emptyText: {
    color: THEME.colors.muted,
    lineHeight: 22,
  },
});
