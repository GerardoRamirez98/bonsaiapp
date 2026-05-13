import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useBonsaiStore } from "../store/bonsaiStore";
import { getLocalDateString } from "../utils/dateTime";
import {
    detectBonsaiSpecies,
    extractBase64FromUri,
    isValidImageBase64,
} from "../utils/detectSpecies";

export default function Result() {
  const { bonsaiId, newPhotos: newPhotosParam } = useLocalSearchParams();
  const {
    bonsais,
    getCurrentBonsai,
    setCurrentBonsai,
    setHeroPhoto,
    updateBonsai,
    addBonsai,
    addScan,
  } = useBonsaiStore();

  type PhotoPayload = {
    uri: string;
    base64?: string | null;
  };

  const parsePhotoPayloads = useCallback((value: unknown): PhotoPayload[] => {
    if (!value || typeof value !== "string") return [];

    try {
      const parsed = JSON.parse(value);

      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (photo): photo is PhotoPayload =>
          Boolean(photo) &&
          typeof photo === "object" &&
          typeof photo.uri === "string",
      );
    } catch (error) {
      console.error("Error parsing scan photos:", error);
      return [];
    }
  }, []);

  // Parse newPhotos from params if provided
  const newPhotos: PhotoPayload[] = useMemo(
    () => parsePhotoPayloads(newPhotosParam),
    [newPhotosParam, parsePhotoPayloads],
  );

  // Get existing bonsai or prepare to create new one
  const currentBonsai = bonsaiId
    ? bonsais.find((b) => b.id === bonsaiId)
    : getCurrentBonsai();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedSpecies, setDetectedSpecies] = useState<string | null>(null);
  const [speciesConfidence, setSpeciesConfidence] = useState(0);
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);
  const [nickname, setNickname] = useState(currentBonsai?.nickname || "");
  const [isSaving, setIsSaving] = useState(false);
  const hasProcessedInitialPhotos = useRef(false);

  const detectSpeciesFromPhoto = useCallback(
    async (
      photo: {
        uri: string;
        base64?: string | null;
      },
      targetBonsaiId = currentBonsai?.id,
    ) => {
      try {
        setIsDetecting(true);

        const base64 = photo.base64
          ? photo.base64
          : extractBase64FromUri(photo.uri);

        if (!isValidImageBase64(base64)) {
          setDetectionMessage(
            "No se pudo analizar esta foto. Toma una foto nueva o selecciónala de nuevo desde la galería.",
          );
          return;
        }

        const result = await detectBonsaiSpecies(base64);

        setDetectedSpecies(result.species);
        setSpeciesConfidence(result.confidence);
        setDetectionMessage(result.description ?? null);

        if (targetBonsaiId && result.species !== "Desconocido") {
          updateBonsai(targetBonsaiId, {
            species: result.species,
            commonName: result.commonName,
            speciesConfidence: result.confidence,
            originalName: result.species,
          });
        }
      } catch (error) {
        console.error("Error detecting species:", error);
      } finally {
        setIsDetecting(false);
      }
    },
    [currentBonsai?.id, updateBonsai],
  );

  // If no bonsai exists yet, create one with the new photos
  useEffect(() => {
    if (hasProcessedInitialPhotos.current) {
      return;
    }

    if (!currentBonsai && newPhotos.length > 0) {
      hasProcessedInitialPhotos.current = true;

      // Create new bonsai with the captured photos
      const newBonsaiId = addBonsai({
        nickname: "Nuevo Bonsai",
        originalName: "",
        species: "",
        commonName: "",
        speciesConfidence: 0,
        substrate: [],
        isInPot: true,
        potType: "",
        lastRepotDate: "",
        dateAdded: getLocalDateString(),
        lastWatering: null,
        wateringHistory: [],
        scanHistory: [],
        allPhotos: [],
        heroPhoto: newPhotos[0]?.uri,
        photoHistory: [],
        sunExposureHistory: [],
        timeline: [],
        daily: 0,
        monthly: 0,
        yearly: 0,
        lastHealthScore: 0,
        lastHealthStatus: "stable",
        notes: "",
      });

      setNickname("Nuevo Bonsai");

      if (!detectedSpecies) {
        detectSpeciesFromPhoto(newPhotos[0], newBonsaiId);
      }

      // Save scan to the newly created bonsai
      if (newBonsaiId) {
        addScan(
          newBonsaiId,
          newPhotos.map((photo) => photo.uri),
        );
      }
    } else if (
      currentBonsai?.allPhotos &&
      currentBonsai.allPhotos.length > 0 &&
      !detectedSpecies
    ) {
      hasProcessedInitialPhotos.current = true;

      // If bonsai exists, auto-detect from its first photo if we have a payload
      if (newPhotos.length > 0) {
        detectSpeciesFromPhoto(newPhotos[0], currentBonsai.id);
      } else {
        detectSpeciesFromPhoto(
          { uri: currentBonsai.allPhotos[0] },
          currentBonsai.id,
        );
      }
    }
  }, [
    addBonsai,
    addScan,
    currentBonsai,
    detectSpeciesFromPhoto,
    detectedSpecies,
    newPhotos,
  ]);

  async function handleSave() {
    if (!currentBonsai) return;

    try {
      setIsSaving(true);

      // Update hero photo and nickname
      if (selectedPhoto) {
        setHeroPhoto(currentBonsai.id, selectedPhoto);
      }

      if (nickname !== currentBonsai.nickname) {
        updateBonsai(currentBonsai.id, {
          nickname,
        });
      }

      // Set as current bonsai
      setCurrentBonsai(currentBonsai.id);

      // Navigate back
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  }

  if (!currentBonsai) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No bonsai found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const photos = currentBonsai.allPhotos || [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configure tu Bonsai</Text>

      {/* Nickname Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apodo del Bonsai</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Mi Junípero"
          value={nickname}
          onChangeText={setNickname}
          placeholderTextColor="#999"
        />
      </View>

      {/* Species Detection Section */}
      {isDetecting && (
        <View style={styles.detectingSection}>
          <ActivityIndicator size="large" color="#1B4332" />
          <Text style={styles.detectingText}>Detectando especie...</Text>
        </View>
      )}

      {detectedSpecies && detectedSpecies !== "Desconocido" && (
        <View style={styles.speciesSection}>
          <Text style={styles.sectionTitle}>Especie Detectada</Text>
          <View style={styles.speciesCard}>
            <Text style={styles.speciesName}>{detectedSpecies}</Text>
            <Text style={styles.confidence}>
              Confianza: {(speciesConfidence * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      )}

      {detectionMessage && !isDetecting ? (
        <Text style={styles.detectionMessage}>{detectionMessage}</Text>
      ) : null}

      {/* Photo Selection */}
      <View style={styles.photosSection}>
        <Text style={styles.sectionTitle}>Selecciona la portada</Text>

        {photos.length === 0 ? (
          <Text style={styles.noPhotosText}>No photos captured</Text>
        ) : (
          photos.map((photo, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.photoWrapper,
                selectedPhoto === photo && styles.photoSelected,
              ]}
              onPress={() => setSelectedPhoto(photo)}
            >
              <Image source={{ uri: photo }} style={styles.image} />
              <Text style={styles.photoLabel}>
                {["Frontal", "Derecha", "Izquierda", "Trasera"][i]}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar Bonsai</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F5EF",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: "#1B4332",
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B4332",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D4A574",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },

  detectingSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
  },

  detectingText: {
    marginTop: 10,
    color: "#1B4332",
    fontWeight: "600",
  },

  speciesSection: {
    marginBottom: 20,
  },

  speciesCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#1B4332",
  },

  speciesName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B4332",
    marginBottom: 5,
  },

  confidence: {
    fontSize: 14,
    color: "#666",
  },

  detectionMessage: {
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },

  photosSection: {
    marginBottom: 20,
  },

  noPhotosText: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },

  photoWrapper: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },

  photoSelected: {
    borderColor: "#1B4332",
    backgroundColor: "rgba(27, 67, 50, 0.1)",
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 6,
  },

  photoLabel: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: "600",
  },

  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },

  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },

  saveButton: {
    backgroundColor: "#1B4332",
  },

  cancelButton: {
    backgroundColor: "#999",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
