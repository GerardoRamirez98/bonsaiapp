import { create } from "zustand";
import {
    Bonsai,
    BonsaiStoreState,
    BonsaiTimelineEvent,
    PhotoHistoryEntry,
    SunExposureEvent,
    WateringEvent,
} from "../types/bonsai";
import {
    getCurrentBonsaiIdFromStorage,
    loadBonsaisFromStorage,
    saveBonsaisToStorage,
    saveCurrentBonsaiIdToStorage,
} from "../utils/storageService";

const generateId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const emptyBonsaiState = {
  wateringHistory: [],
  scanHistory: [],
  allPhotos: [],
  photoHistory: [],
  sunExposureHistory: [],
  timeline: [],
  daily: 0,
  monthly: 0,
  yearly: 0,
};

function createTimelineEvent(
  type: BonsaiTimelineEvent["type"],
  title: string,
  description?: string,
): BonsaiTimelineEvent {
  const now = new Date();
  return {
    id: generateId(),
    date: now.toISOString().split("T")[0],
    time: now.toISOString().slice(11, 16),
    type,
    title,
    description,
  };
}

function toWateringTimestamp(date: string, time?: string) {
  const parsed = new Date(time ? `${date}T${time}:00` : date);

  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString();
}

export const useBonsaiStore = create<BonsaiStoreState>((set, get) => ({
  // =====================
  // STATE
  // =====================

  bonsais: [],
  currentBonsaiId: null,

  // =====================
  // CORE
  // =====================

  addBonsai: (bonsaiData) => {
    const id = generateId();

    const newBonsai: Bonsai = {
      ...emptyBonsaiState,
      ...bonsaiData,
      id,
      dateAdded: new Date().toISOString(),
    };

    set((state) => {
      const updated = [...state.bonsais, newBonsai];
      const current = state.currentBonsaiId || id;

      saveBonsaisToStorage(updated);
      saveCurrentBonsaiIdToStorage(current);

      return {
        bonsais: updated,
        currentBonsaiId: current,
      };
    });

    return id;
  },

  removeBonsai: (id) => {
    set((state) => {
      const updated = state.bonsais.filter((b) => b.id !== id);

      const current =
        state.currentBonsaiId === id
          ? (updated[0]?.id ?? null)
          : state.currentBonsaiId;

      saveBonsaisToStorage(updated);
      saveCurrentBonsaiIdToStorage(current);

      return {
        bonsais: updated,
        currentBonsaiId: current,
      };
    });
  },

  updateBonsai: (id, updates) => {
    set((state) => {
      const updated = state.bonsais.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      );

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  setCurrentBonsai: (id) => {
    saveCurrentBonsaiIdToStorage(id);
    set({ currentBonsaiId: id });
  },

  selectBonsai: (id: string) => {
    set(() => {
      saveCurrentBonsaiIdToStorage(id);
      return { currentBonsaiId: id };
    });
  },

  getCurrentBonsai: () => {
    const state = get();
    return state.bonsais.find((b) => b.id === state.currentBonsaiId) || null;
  },

  // =====================
  // PHOTOS
  // =====================

  addPhoto: (bonsaiId, photoUri) => {
    set((state) => {
      const updated = state.bonsais.map((b) => {
        if (b.id !== bonsaiId) return b;

        return {
          ...b,
          allPhotos: [...(b.allPhotos ?? []), photoUri],
          photoHistory: [
            ...(b.photoHistory ?? []),
            {
              id: generateId(),
              uri: photoUri,
              capturedAt: new Date().toISOString(),
            },
          ],
        };
      });

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  setHeroPhoto: (bonsaiId, photoUri) => {
    set((state) => {
      const updated = state.bonsais.map((b) =>
        b.id === bonsaiId ? { ...b, heroPhoto: photoUri } : b,
      );

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  addScan: (bonsaiId, photoUris) => {
    set((state) => {
      const flat = Array.from(
        new Set(Array.isArray(photoUris) ? photoUris.flat() : [photoUris]),
      );
      const scanId = generateId();

      const photoEntries: PhotoHistoryEntry[] = flat.map((uri, index) => ({
        id: generateId(),
        uri,
        capturedAt: new Date().toISOString(),
        label: `Foto ${index + 1}`,
        scanId,
      }));

      const updated = state.bonsais.map((b) => {
        if (b.id !== bonsaiId) return b;

        const timelineEntry = createTimelineEvent(
          "scan",
          "Nuevo escaneo de fotos",
          `${flat.length} imagenes añadidas al historial de fotos.`,
        );

        return {
          ...b,
          scanHistory: [...(b.scanHistory ?? []), flat],
          allPhotos: [...(b.allPhotos ?? []), ...flat],
          photoHistory: [...(b.photoHistory ?? []), ...photoEntries],
          heroPhoto: b.heroPhoto ?? flat[0],
          timeline: [...(b.timeline ?? []), timelineEntry],
        };
      });

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  deletePhoto: (bonsaiId, photoId) => {
    set((state) => {
      const updated = state.bonsais.map((b) => {
        if (b.id !== bonsaiId) return b;

        const updatedPhotoHistory = (b.photoHistory ?? []).filter(
          (photo) => photo.id !== photoId,
        );

        const uriToRemove = b.photoHistory?.find(
          (photo) => photo.id === photoId,
        )?.uri;
        const updatedAllPhotos = (b.allPhotos ?? []).filter(
          (uri) => uri !== uriToRemove,
        );

        const updatedScanHistory = (b.scanHistory ?? [])
          .map((scan) => scan.filter((uri) => uri !== uriToRemove))
          .filter((scan) => scan.length > 0);

        const updatedHeroPhoto =
          b.heroPhoto === uriToRemove
            ? (updatedAllPhotos[0] ?? undefined)
            : b.heroPhoto;

        return {
          ...b,
          photoHistory: updatedPhotoHistory,
          allPhotos: updatedAllPhotos,
          scanHistory: updatedScanHistory,
          heroPhoto: updatedHeroPhoto,
        };
      });

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  deletePhotos: (bonsaiId, photoIds) => {
    set((state) => {
      const updated = state.bonsais.map((b) => {
        if (b.id !== bonsaiId) return b;

        const idsToDelete = new Set(photoIds);
        const updatedPhotoHistory = (b.photoHistory ?? []).filter(
          (photo) => !idsToDelete.has(photo.id),
        );

        const urisToDelete = new Set(
          (b.photoHistory ?? [])
            .filter((photo) => idsToDelete.has(photo.id))
            .map((photo) => photo.uri),
        );

        const updatedAllPhotos = (b.allPhotos ?? []).filter(
          (uri) => !urisToDelete.has(uri),
        );

        const updatedScanHistory = (b.scanHistory ?? [])
          .map((scan) => scan.filter((uri) => !urisToDelete.has(uri)))
          .filter((scan) => scan.length > 0);

        const updatedHeroPhoto = urisToDelete.has(b.heroPhoto ?? "")
          ? (updatedAllPhotos[0] ?? undefined)
          : b.heroPhoto;

        return {
          ...b,
          photoHistory: updatedPhotoHistory,
          allPhotos: updatedAllPhotos,
          scanHistory: updatedScanHistory,
          heroPhoto: updatedHeroPhoto,
        };
      });

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  addTimelineEvent: (bonsaiId, event) => {
    set((state) => {
      const newEvent: BonsaiTimelineEvent = {
        id: generateId(),
        date: event.date,
        time: event.time,
        type: event.type,
        title: event.title,
        description: event.description,
      };

      const updated = state.bonsais.map((b) =>
        b.id === bonsaiId
          ? { ...b, timeline: [...(b.timeline ?? []), newEvent] }
          : b,
      );

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  addSunExposureEvent: (bonsaiId, exposure) => {
    set((state) => {
      const exposureEvent: SunExposureEvent = {
        id: generateId(),
        date: exposure.date,
        startTime: exposure.startTime,
        endTime: exposure.endTime,
        durationMinutes: exposure.durationMinutes,
        temperature: exposure.temperature,
        notes: exposure.notes,
      };

      const timelineEntry = {
        id: generateId(),
        date: exposure.date,
        time: exposure.startTime,
        type: "sunExposure" as const,
        title: "Exposición solar registrada",
        description:
          exposure.notes || `Exposición de ${exposure.durationMinutes} min`,
      };

      const updated = state.bonsais.map((b) =>
        b.id === bonsaiId
          ? {
              ...b,
              sunExposureHistory: [
                ...(b.sunExposureHistory ?? []),
                exposureEvent,
              ],
              timeline: [...(b.timeline ?? []), timelineEntry],
            }
          : b,
      );

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  // =====================
  // WATERING
  // =====================

  water: (bonsaiId, intensity = 1) => {
    set((state) => {
      const today = new Date().toISOString().split("T")[0];

      const updated = state.bonsais.map((b) => {
        if (b.id !== bonsaiId) return b;

        const history: WateringEvent[] = b.wateringHistory ?? [];

        const already = history.some(
          (w) => w.date === today && w.type === "water",
        );

        if (already) return b;

        const newEvent: WateringEvent = {
          date: today,
          type: "water",
          intensity,
          time: new Date().toISOString().slice(11, 16),
        };

        const timelineEvent = createTimelineEvent(
          "water",
          "Riego registrado",
          `Riego con intensidad ${intensity}`,
        );

        return {
          ...b,
          lastWatering: toWateringTimestamp(newEvent.date, newEvent.time),
          daily: (b.daily ?? 0) + 1,
          monthly: (b.monthly ?? 0) + 1,
          yearly: (b.yearly ?? 0) + 1,
          wateringHistory: [...history, newEvent],
          timeline: [...(b.timeline ?? []), timelineEvent],
        };
      });

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  recordWateringEvent: (bonsaiId, event) => {
    set((state) => {
      if (!event || !event.date || !event.type) {
        console.warn("Evento inválido:", event);
        return state;
      }

      const updated = state.bonsais.map((b) => {
        if (b.id !== bonsaiId) return b;

        const history = b.wateringHistory ?? [];

        const newEvent: WateringEvent = {
          date: event.date,
          type: event.type,
          intensity: event.intensity,
          notes: event.notes,
          time: event.time,
        };

        const timelineEvent = {
          id: generateId(),
          date: event.date,
          time: event.time ?? new Date().toISOString().slice(11, 16),
          type: event.type,
          title:
            event.type === "water" ? "Riego registrado" : `Evento: ${event.type}`,
          description: event.notes,
        };

        return {
          ...b,
          wateringHistory: [...history, newEvent],
          lastWatering:
            event.type === "water"
              ? toWateringTimestamp(event.date, timelineEvent.time)
              : b.lastWatering,
          timeline: [...(b.timeline ?? []), timelineEvent],
        };
      });

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  undoLastWatering: (bonsaiId) => {
    set((state) => {
      const updated = state.bonsais.map((b) => {
        if (b.id !== bonsaiId) return b;

        const history = b.wateringHistory ?? [];
        const mostRecentIndex = [...history]
          .reverse()
          .findIndex((event) => event.type === "water");

        if (mostRecentIndex === -1) return b;

        const removeIndex = history.length - 1 - mostRecentIndex;
        const newHistory = [...history];
        newHistory.splice(removeIndex, 1);

        const today = new Date().toISOString().split("T")[0];
        const dailyCount = newHistory.filter(
          (event) => event.type === "water" && event.date === today,
        ).length;
        const monthlyCount = newHistory.filter(
          (event) =>
            event.type === "water" &&
            event.date.slice(0, 7) === today.slice(0, 7),
        ).length;
        const yearlyCount = newHistory.filter(
          (event) =>
            event.type === "water" &&
            event.date.slice(0, 4) === today.slice(0, 4),
        ).length;

        const lastWateringEvent = [...newHistory]
          .reverse()
          .find((event) => event.type === "water");

        const timelineEntry = createTimelineEvent(
          "note",
          "Riego deshecho",
          "Se ha eliminado el último riego registrado.",
        );

        return {
          ...b,
          wateringHistory: newHistory,
          lastWatering: lastWateringEvent
            ? toWateringTimestamp(lastWateringEvent.date, lastWateringEvent.time)
            : null,
          daily: dailyCount,
          monthly: monthlyCount,
          yearly: yearlyCount,
          timeline: [...(b.timeline ?? []), timelineEntry],
        };
      });

      saveBonsaisToStorage(updated);

      return { bonsais: updated };
    });
  },

  // =====================
  // STORAGE
  // =====================

  loadFromStorage: async () => {
    try {
      const [bonsais, current] = await Promise.all([
        loadBonsaisFromStorage(),
        getCurrentBonsaiIdFromStorage(),
      ]);

      let valid = current;

      if (current && !bonsais.find((b) => b.id === current)) {
        valid = null;
      }

      if (bonsais.length && !valid) {
        valid = bonsais[0].id;
        await saveCurrentBonsaiIdToStorage(valid);
      }

      set({
        bonsais,
        currentBonsaiId: valid,
      });
    } catch (e) {
      console.error("loadFromStorage error:", e);
      set({ bonsais: [], currentBonsaiId: null });
    }
  },

  importBonsais: (bonsais) => {
    set((state) => {
      const current = bonsais[0]?.id ?? state.currentBonsaiId;

      saveBonsaisToStorage(bonsais);
      saveCurrentBonsaiIdToStorage(current);

      return {
        bonsais,
        currentBonsaiId: current,
      };
    });
  },

  saveToStorage: async () => {
    try {
      const state = get();

      await Promise.all([
        saveBonsaisToStorage(state.bonsais),
        saveCurrentBonsaiIdToStorage(state.currentBonsaiId),
      ]);
    } catch (e) {
      console.error("saveToStorage error:", e);
    }
  },
}));
