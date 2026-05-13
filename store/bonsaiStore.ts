import { create } from "zustand";

import { auth } from "@/services/firebase";
import {
  deleteBonsai as deleteRemoteBonsai,
  upsertBonsai,
} from "@/services/firebase/bonsais";
import {
  deleteBonsaiPhoto,
  setHeroPhotoMetadata,
  uploadBonsaiPhoto,
} from "@/services/firebase/photos";
import { updateUserSettings } from "@/services/firebase/users";
import {
  handleFirebaseError,
  handleStorageError,
} from "@/services/firebase/utils";
import { updateBonsaiById } from "@/store/actions/helpers";
import {
  getCurrentBonsaiIdFromStorage,
  saveCurrentBonsaiIdToStorage,
} from "@/utils/storageService";
import {
  getLocalDateString,
  getLocalTimeString,
  toLocalDateTimeIso,
} from "@/utils/dateTime";
import { appendTimelineEvent, createTimelineEvent } from "@/utils/timeline";
import type {
  Bonsai,
  BonsaiStoreState,
  PhotoHistoryEntry,
  SunExposureEvent,
  WateringEvent,
} from "../types/bonsai";

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

function getAuthenticatedUserId(stateUserId?: string | null) {
  return stateUserId ?? auth.currentUser?.uid ?? null;
}

function getWateringCounters(history: WateringEvent[]) {
  const today = getLocalDateString();

  return {
    daily: history.filter(
      (event) => event.type === "water" && event.date === today,
    ).length,
    monthly: history.filter(
      (event) =>
        event.type === "water" && event.date.slice(0, 7) === today.slice(0, 7),
    ).length,
    yearly: history.filter(
      (event) =>
        event.type === "water" && event.date.slice(0, 4) === today.slice(0, 4),
    ).length,
  };
}

export const useBonsaiStore = create<BonsaiStoreState>((set, get) => {
  const setSyncError = (message: string | null) => {
    set({ syncError: message });
  };

  const persistBonsai = (bonsai: Bonsai) => {
    const userId = getAuthenticatedUserId(get().activeUserId);

    if (!userId) {
      setSyncError("Inicia sesión para sincronizar con Firebase.");
      return;
    }

    void upsertBonsai(userId, bonsai).catch((error) => {
      setSyncError(
        handleFirebaseError(
          error,
          "No se pudo sincronizar el bonsái con Firebase.",
        ),
      );
    });
  };

  const persistCurrentBonsaiId = (bonsaiId: string | null) => {
    const userId = getAuthenticatedUserId(get().activeUserId);
    void saveCurrentBonsaiIdToStorage(bonsaiId);

    if (!userId) return;

    void updateUserSettings(userId, { currentBonsaiId: bonsaiId }).catch(
      (error) => {
        setSyncError(
          handleFirebaseError(error, "No se pudo guardar la selección actual."),
        );
      },
    );
  };

  const commitBonsaiUpdate = (
    bonsaiId: string,
    updater: (bonsai: Bonsai) => Bonsai,
  ): Bonsai | null => {
    let updatedBonsai: Bonsai | null = null;

    set((state) => {
      const result = updateBonsaiById(state.bonsais, bonsaiId, updater);
      updatedBonsai = result.updatedBonsai;

      return { bonsais: result.bonsais, syncError: null };
    });

    if (updatedBonsai) persistBonsai(updatedBonsai);

    return updatedBonsai;
  };

  const syncUploadedPhotos = (
    bonsaiId: string,
    photos: PhotoHistoryEntry[],
    shouldSetHeroPhoto = false,
  ) => {
    const userId = getAuthenticatedUserId(get().activeUserId);

    if (!userId) return;

    photos.forEach((photo, index) => {
      void uploadBonsaiPhoto({
        userId,
        bonsaiId,
        photoId: photo.id,
        uri: photo.uri,
        label: photo.label,
        scanId: photo.scanId,
        isHero: shouldSetHeroPhoto && index === 0,
      })
        .then((uploadedPhoto) => {
          commitBonsaiUpdate(bonsaiId, (bonsai) => {
            const nextPhotoHistory = (bonsai.photoHistory ?? []).map((entry) =>
              entry.id === photo.id ? { ...entry, ...uploadedPhoto } : entry,
            );
            const nextAllPhotos = (bonsai.allPhotos ?? []).map((uri) =>
              uri === photo.uri ? uploadedPhoto.downloadUrl : uri,
            );
            const nextScanHistory = (bonsai.scanHistory ?? []).map((scan) =>
              scan.map((uri) =>
                uri === photo.uri ? uploadedPhoto.downloadUrl : uri,
              ),
            );
            const nextHeroPhoto =
              bonsai.heroPhoto === photo.uri || uploadedPhoto.isHero
                ? uploadedPhoto.downloadUrl
                : bonsai.heroPhoto;

            return {
              ...bonsai,
              photoHistory: nextPhotoHistory,
              allPhotos: nextAllPhotos,
              scanHistory: nextScanHistory,
              heroPhoto: nextHeroPhoto,
            };
          });
        })
        .catch((error) => {
          setSyncError(handleStorageError(error));
        });
    });
  };

  return {
    bonsais: [],
    currentBonsaiId: null,
    isSyncing: false,
    syncError: null,
    activeUserId: null,

    addBonsai: (bonsaiData) => {
      const id = generateId();
      const newBonsai: Bonsai = {
        ...emptyBonsaiState,
        ...bonsaiData,
        id,
        dateAdded: new Date().toISOString(),
      };

      set((state) => {
        const current = state.currentBonsaiId || id;
        persistCurrentBonsaiId(current);

        return {
          bonsais: [...state.bonsais, newBonsai],
          currentBonsaiId: current,
          syncError: null,
        };
      });

      persistBonsai(newBonsai);
      return id;
    },

    removeBonsai: (id) => {
      const userId = getAuthenticatedUserId(get().activeUserId);

      set((state) => {
        const updated = state.bonsais.filter((b) => b.id !== id);
        const current =
          state.currentBonsaiId === id
            ? (updated[0]?.id ?? null)
            : state.currentBonsaiId;

        persistCurrentBonsaiId(current);

        return {
          bonsais: updated,
          currentBonsaiId: current,
          syncError: null,
        };
      });

      if (!userId) {
        setSyncError("Inicia sesión para eliminar en Firebase.");
        return;
      }

      void deleteRemoteBonsai(userId, id).catch((error) => {
        setSyncError(
          handleFirebaseError(error, "No se pudo eliminar el bonsái en Firebase."),
        );
      });
    },

    updateBonsai: (id, updates) => {
      commitBonsaiUpdate(id, (bonsai) => ({ ...bonsai, ...updates }));
    },

    setCurrentBonsai: (id) => {
      set({ currentBonsaiId: id });
      persistCurrentBonsaiId(id);
    },

    selectBonsai: (id: string) => {
      set({ currentBonsaiId: id });
      persistCurrentBonsaiId(id);
    },

    getCurrentBonsai: () => {
      const state = get();
      return state.bonsais.find((b) => b.id === state.currentBonsaiId) || null;
    },

    addPhoto: (bonsaiId, photoUri) => {
      const photoEntry: PhotoHistoryEntry = {
        id: generateId(),
        uri: photoUri,
        capturedAt: new Date().toISOString(),
      };
      const updatedBonsai = commitBonsaiUpdate(bonsaiId, (bonsai) => {
        const shouldSetHero = !bonsai.heroPhoto;

        return {
          ...bonsai,
          allPhotos: [...(bonsai.allPhotos ?? []), photoUri],
          photoHistory: [...(bonsai.photoHistory ?? []), photoEntry],
          heroPhoto: shouldSetHero ? photoUri : bonsai.heroPhoto,
          timeline: appendTimelineEvent(bonsai.timeline, {
            type: "scan",
            title: "Foto agregada",
            description: "Se agregó una foto al historial.",
          }),
        };
      });

      if (updatedBonsai) {
        syncUploadedPhotos(
          bonsaiId,
          [photoEntry],
          updatedBonsai.heroPhoto === photoEntry.uri,
        );
      }
    },

    setHeroPhoto: (bonsaiId, photoUri) => {
      const updatedBonsai = commitBonsaiUpdate(bonsaiId, (bonsai) => ({
        ...bonsai,
        heroPhoto: photoUri,
        photoHistory: (bonsai.photoHistory ?? []).map((photo) => ({
          ...photo,
          isHero: photo.uri === photoUri || photo.downloadUrl === photoUri,
        })),
      }));

      const userId = getAuthenticatedUserId(get().activeUserId);
      const heroPhoto = updatedBonsai?.photoHistory.find(
        (photo) => photo.uri === photoUri || photo.downloadUrl === photoUri,
      );

      if (userId && heroPhoto) {
        void setHeroPhotoMetadata(userId, bonsaiId, heroPhoto.id).catch(
          (error) => {
            setSyncError(
              handleStorageError(error, "No se pudo marcar la portada."),
            );
          },
        );
      }
    },

    addScan: (bonsaiId, photoUris) => {
      let photoEntriesToUpload: PhotoHistoryEntry[] = [];
      let shouldUploadHero = false;

      const updatedBonsai = commitBonsaiUpdate(bonsaiId, (b) => {
          const flat = Array.from(
            new Set(Array.isArray(photoUris) ? photoUris.flat() : [photoUris]),
          );
          const existingUris = new Set((b.photoHistory ?? []).map((p) => p.uri));
          const newUris = flat.filter((uri) => !existingUris.has(uri));
          const scanId = generateId();
          const photoEntries: PhotoHistoryEntry[] = newUris.map(
            (uri, index) => ({
              id: generateId(),
              uri,
              capturedAt: new Date().toISOString(),
              label: `Foto ${index + 1}`,
              scanId,
            }),
          );

          if (!newUris.length) {
            return b;
          }

          photoEntriesToUpload = photoEntries;
          shouldUploadHero = !b.heroPhoto;
          const timelineEntry = createTimelineEvent(
            "scan",
            "Nuevo escaneo de fotos",
            `${newUris.length} imágenes añadidas al historial de fotos.`,
          );

          return {
            ...b,
            scanHistory: [...(b.scanHistory ?? []), newUris],
            allPhotos: [...(b.allPhotos ?? []), ...newUris],
            photoHistory: [...(b.photoHistory ?? []), ...photoEntries],
            heroPhoto: b.heroPhoto ?? newUris[0],
            timeline: [...(b.timeline ?? []), timelineEntry],
          };
      });

      if (updatedBonsai && photoEntriesToUpload.length) {
        syncUploadedPhotos(bonsaiId, photoEntriesToUpload, shouldUploadHero);
      }
    },

    deletePhoto: (bonsaiId, photoId) => {
      get().deletePhotos(bonsaiId, [photoId]);
    },

    deletePhotos: (bonsaiId, photoIds) => {
      let deletedPhotoEntries: PhotoHistoryEntry[] = [];

      const updatedBonsai = commitBonsaiUpdate(bonsaiId, (b) => {
          const idsToDelete = new Set(photoIds);
          deletedPhotoEntries = (b.photoHistory ?? []).filter((photo) =>
            idsToDelete.has(photo.id),
          );
          const urisToDelete = new Set(
            deletedPhotoEntries.flatMap((photo) =>
              [photo.uri, photo.downloadUrl].filter(Boolean),
            ),
          );
          const updatedPhotoHistory = (b.photoHistory ?? []).filter(
            (photo) => !idsToDelete.has(photo.id),
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
            timeline: appendTimelineEvent(b.timeline, {
              type: "note",
              title: "Fotos eliminadas",
              description: `${photoIds.length} registro(s) de foto eliminados.`,
            }),
          };
      });

      const userId = getAuthenticatedUserId(get().activeUserId);
      if (userId && updatedBonsai) {
        deletedPhotoEntries.forEach((photo) => {
          void deleteBonsaiPhoto(userId, bonsaiId, photo).catch((error) => {
            setSyncError(
              handleStorageError(error, "No se pudo eliminar una foto."),
            );
          });
        });
      }
    },

    addTimelineEvent: (bonsaiId, event) => {
      commitBonsaiUpdate(bonsaiId, (bonsai) => ({
        ...bonsai,
        timeline: appendTimelineEvent(bonsai.timeline, event),
      }));
    },

    addSunExposureEvent: (bonsaiId, exposure) => {
      commitBonsaiUpdate(bonsaiId, (b) => {
        const exposureEvent: SunExposureEvent = {
          id: generateId(),
          date: exposure.date,
          startTime: exposure.startTime,
          endTime: exposure.endTime,
          durationMinutes: exposure.durationMinutes,
          temperature: exposure.temperature,
          notes: exposure.notes,
        };
        const timelineEntry = createTimelineEvent(
          "sunExposure",
          "Exposición solar registrada",
          exposure.notes || `Exposición de ${exposure.durationMinutes} min`,
          exposure.date,
          exposure.startTime,
        );

        return {
          ...b,
          sunExposureHistory: [...(b.sunExposureHistory ?? []), exposureEvent],
          timeline: [...(b.timeline ?? []), timelineEntry],
        };
      });
    },

    water: (bonsaiId, intensity = 1) => {
      const now = new Date();
      const today = getLocalDateString(now);
      const time = getLocalTimeString(now);

      commitBonsaiUpdate(bonsaiId, (b) => {
        const history: WateringEvent[] = b.wateringHistory ?? [];
        const already = history.some(
          (w) => w.date === today && w.type === "water",
        );

        if (already) return b;

        const newEvent: WateringEvent = {
          date: today,
          time,
          type: "water",
          intensity,
        };
        const timelineEvent = createTimelineEvent(
          "water",
          "Riego registrado",
          `Riego con intensidad ${intensity}`,
          today,
          time,
        );

        return {
          ...b,
          lastWatering: toLocalDateTimeIso(newEvent.date, newEvent.time),
          daily: (b.daily ?? 0) + 1,
          monthly: (b.monthly ?? 0) + 1,
          yearly: (b.yearly ?? 0) + 1,
          wateringHistory: [...history, newEvent],
          timeline: [...(b.timeline ?? []), timelineEvent],
        };
      });
    },

    recordWateringEvent: (bonsaiId, event) => {
      commitBonsaiUpdate(bonsaiId, (b) => {
        const history = b.wateringHistory ?? [];
        const eventTime = event.time ?? getLocalTimeString();
        const newEvent: WateringEvent = {
          date: event.date,
          type: event.type,
          intensity: event.intensity,
          notes: event.notes,
          time: eventTime,
        };
        const updatedHistory = [...history, newEvent];
        const counters = getWateringCounters(updatedHistory);
        const timelineEvent = createTimelineEvent(
          event.type,
          event.type === "water" ? "Riego registrado" : `Evento: ${event.type}`,
          event.notes,
          event.date,
          eventTime,
        );

        return {
          ...b,
          wateringHistory: updatedHistory,
          lastWatering:
            event.type === "water"
              ? toLocalDateTimeIso(event.date, eventTime)
              : b.lastWatering,
          ...counters,
          timeline: [...(b.timeline ?? []), timelineEvent],
        };
      });
    },

    undoLastWatering: (bonsaiId) => {
      commitBonsaiUpdate(bonsaiId, (b) => {
        const history = b.wateringHistory ?? [];
        const mostRecentIndex = [...history]
          .reverse()
          .findIndex((event) => event.type === "water");

        if (mostRecentIndex === -1) return b;

        const removeIndex = history.length - 1 - mostRecentIndex;
        const newHistory = [...history];
        newHistory.splice(removeIndex, 1);

        const counters = getWateringCounters(newHistory);
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
            ? toLocalDateTimeIso(
                lastWateringEvent.date,
                lastWateringEvent.time,
              )
            : null,
          ...counters,
          timeline: [...(b.timeline ?? []), timelineEntry],
        };
      });
    },

    importBonsais: (bonsais) => {
      const userId = getAuthenticatedUserId(get().activeUserId);
      const current = bonsais[0]?.id ?? get().currentBonsaiId;

      set({
        bonsais,
        currentBonsaiId: current,
        syncError: null,
      });

      persistCurrentBonsaiId(current);
      if (userId) bonsais.forEach((bonsai) => persistBonsai(bonsai));
    },

    loadFromStorage: async () => {
      const current = await getCurrentBonsaiIdFromStorage();
      set((state) => ({
        currentBonsaiId:
          current && state.bonsais.some((bonsai) => bonsai.id === current)
            ? current
            : state.currentBonsaiId,
      }));
    },

    saveToStorage: async () => {
      await saveCurrentBonsaiIdToStorage(get().currentBonsaiId);
    },

    hydrateFromRemote: (bonsais) => {
      set((state) => {
        const current =
          state.currentBonsaiId && bonsais.some((b) => b.id === state.currentBonsaiId)
            ? state.currentBonsaiId
            : (bonsais[0]?.id ?? null);

        if (current !== state.currentBonsaiId) {
          persistCurrentBonsaiId(current);
        }

        return {
          bonsais,
          currentBonsaiId: current,
          isSyncing: false,
          syncError: null,
        };
      });
    },

    setSyncState: (syncState) => {
      set((state) => ({
        isSyncing: syncState.isSyncing ?? state.isSyncing,
        syncError:
          syncState.syncError === undefined
            ? state.syncError
            : syncState.syncError,
        activeUserId:
          syncState.activeUserId === undefined
            ? state.activeUserId
            : syncState.activeUserId,
      }));
    },

    resetForSignedOutUser: () => {
      set({
        bonsais: [],
        currentBonsaiId: null,
        activeUserId: null,
        isSyncing: false,
        syncError: null,
      });
    },
  };
});
