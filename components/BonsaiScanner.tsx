import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useBonsaiStore } from "../store/bonsaiStore";

const SIDES = ["Frontal", "Derecha", "Izquierda", "Trasera"];

type Mode = "camera" | "gallery";

interface BonsaiScannerProps {
  bonsaiId?: string;
}

export default function BonsaiScanner({ bonsaiId }: BonsaiScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();

  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<{ uri: string; base64?: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<Mode>("camera");

  const [maxSteps, setMaxSteps] = useState(4);

  const cameraRef = useRef<any>(null);

  const {
    bonsais,
    currentBonsaiId,
    addScan,
    addBonsai,
    setHeroPhoto,
  } = useBonsaiStore();

  // ✅ FIX: activo seguro
  const activeBonsaiId = useMemo(() => {
    return bonsaiId || currentBonsaiId || bonsais[0]?.id || null;
  }, [bonsaiId, currentBonsaiId, bonsais]);

  useEffect(() => {
    setPhotos([]);
    setStep(0);
  }, [activeBonsaiId]);

  // permisos galería
  useEffect(() => {
    (async () => {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  if (!permission?.granted) {
    return (
      <TouchableOpacity
        style={styles.permissionButton}
        onPress={requestPermission}
      >
        <Text>Permitir cámara</Text>
      </TouchableOpacity>
    );
  }

  // 🧠 crear bonsai si no existe
  function ensureBonsaiExists(): string {
    if (activeBonsaiId) return activeBonsaiId;

    return addBonsai({
      nickname: "Mi primer bonsái",
      dateAdded: new Date().toISOString(),
      lastWatering: null,
      wateringHistory: [],
      scanHistory: [],
      allPhotos: [],
      photoHistory: [],
      sunExposureHistory: [],
      timeline: [],
      daily: 0,
      monthly: 0,
      yearly: 0,
    });
  }

  // 📸 cámara
  async function captureFromCamera() {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      if (!photo?.uri) return;

      const updated = [...photos, { uri: photo.uri, base64: photo.base64 }];
      setPhotos(updated);

      const id = ensureBonsaiExists();

      nextStep(updated, id);
    } finally {
      setIsProcessing(false);
    }
  }

  // 🖼️ galería FIXED
  async function pickFromGallery() {
    try {
      setIsProcessing(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images", // ✅ FIX expo moderno
        allowsMultipleSelection: true,
        selectionLimit: maxSteps - photos.length,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const newPhotos = result.assets.map((a) => ({
        uri: a.uri,
        base64: a.base64 ?? undefined,
      }));
      const updated = [...photos, ...newPhotos];
      setPhotos(updated);

      const id = ensureBonsaiExists();

      nextStep(updated, id);
    } finally {
      setIsProcessing(false);
    }
  }

  function nextStep(
    updatedPhotos: { uri: string; base64?: string }[],
    id?: string,
  ) {
    const bonsaiId = id || activeBonsaiId;

    if (!bonsaiId) return;

    const isLast = step + 1 >= maxSteps;

    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }

    addScan(
      bonsaiId,
      updatedPhotos.map((photo) => photo.uri),
    );

    if (updatedPhotos.length > 0) {
      setHeroPhoto(bonsaiId, updatedPhotos[0].uri);
    }

    router.push({
      pathname: "/bonsai-result",
      params: { bonsaiId, newPhotos: JSON.stringify(updatedPhotos) },
    });
  }

  return (
    <View style={{ flex: 1 }}>
      {mode === "camera" ? (
        <CameraView ref={cameraRef} style={{ flex: 1 }} />
      ) : (
        <View style={styles.galleryPlaceholder}>
          <Text style={{ color: "#fff" }}>
            Selecciona fotos desde la galería
          </Text>
        </View>
      )}

      {/* MODE SWITCH */}
      <View style={styles.modeSwitch}>
        <TouchableOpacity onPress={() => setMode("camera")}>
          <Text style={mode === "camera" ? styles.active : styles.inactive}>
            Cámara
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode("gallery")}>
          <Text style={mode === "gallery" ? styles.active : styles.inactive}>
            Galería
          </Text>
        </TouchableOpacity>
      </View>

      {/* UI */}
      <View style={styles.overlay}>
        <Text style={styles.title}>
          Foto {step + 1}/{maxSteps}
        </Text>

        <Text style={styles.side}>{SIDES[step] ?? "N/A"}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={mode === "camera" ? captureFromCamera : pickFromGallery}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing
              ? "Procesando..."
              : mode === "camera"
                ? "Capturar"
                : "Seleccionar fotos"}
          </Text>
        </TouchableOpacity>

        {/* MODE FLEX */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <TouchableOpacity
            onPress={() => {
              setMaxSteps(1);
              setPhotos([]);
              setStep(0);
            }}
          >
            <Text style={{ color: "white" }}>1 foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMaxSteps(4);
              setPhotos([]);
              setStep(0);
            }}
          >
            <Text style={{ color: "white" }}>4 fotos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    bottom: 60,
    width: "100%",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  side: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1B4332",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modeSwitch: {
    position: "absolute",
    top: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  active: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  inactive: {
    color: "#aaa",
    fontSize: 16,
  },
  galleryPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
