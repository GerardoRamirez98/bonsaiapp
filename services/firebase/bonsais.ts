import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/services/firebase/config";
import {
  deleteAllBonsaiPhotos,
  listBonsaiPhotos,
  uploadBonsaiPhoto,
} from "@/services/firebase/photos";
import { removeUndefinedValues } from "@/services/firebase/utils";
import type { Bonsai, PhotoHistoryEntry } from "@/types/bonsai";

const usersCollection = "users";
const bonsaisCollection = "bonsais";

export function bonsaisRef(userId: string) {
  return collection(db, usersCollection, userId, bonsaisCollection);
}

export function bonsaiDocRef(userId: string, bonsaiId: string) {
  return doc(db, usersCollection, userId, bonsaisCollection, bonsaiId);
}

type LightweightBonsai = Omit<
  Bonsai,
  "allPhotos" | "photoHistory" | "scanHistory"
>;

type FirestoreBonsai = LightweightBonsai & {
  name: string;
  photoCount: number;
};

export function normalizeBonsaiFromFirestore(
  id: string,
  data: Record<string, unknown>,
) {
  const { photoCount, ...rest } = data;
  void photoCount;

  return {
    ...(rest as Omit<Bonsai, "id" | "allPhotos" | "photoHistory" | "scanHistory">),
    id,
    allPhotos: [],
    photoHistory: [],
    scanHistory: [],
  } as Bonsai;
}

export function prepareBonsaiForFirestore(bonsai: Bonsai): FirestoreBonsai {
  const { allPhotos, photoHistory, scanHistory, ...bonsaiData } = bonsai;

  return removeUndefinedValues({
    ...bonsaiData,
    name: bonsai.nickname,
    photoCount: photoHistory?.length ?? allPhotos?.length ?? 0,
    updatedAt: serverTimestamp(),
  });
}

function photosToScanHistory(photos: PhotoHistoryEntry[]) {
  const grouped = photos.reduce<Record<string, string[]>>((acc, photo) => {
    const scanId = photo.scanId ?? "ungrouped";
    acc[scanId] = [...(acc[scanId] ?? []), photo.downloadUrl ?? photo.uri];
    return acc;
  }, {});

  return Object.values(grouped);
}

function getMigrationPhotos(bonsai: Bonsai): PhotoHistoryEntry[] {
  if (bonsai.photoHistory?.length) {
    return bonsai.photoHistory;
  }

  return (bonsai.allPhotos ?? []).map((uri, index) => ({
    id: `${bonsai.id}-migration-${index}`,
    uri,
    capturedAt: bonsai.dateAdded,
    label: "Foto migrada",
    isHero: uri === bonsai.heroPhoto,
  }));
}

async function attachPhotos(userId: string, bonsai: Bonsai): Promise<Bonsai> {
  const photos = await listBonsaiPhotos(userId, bonsai.id);
  const sortedPhotos = photos.sort(
    (left, right) =>
      new Date(left.capturedAt).getTime() - new Date(right.capturedAt).getTime(),
  );
  const allPhotos = sortedPhotos.map((photo) => photo.downloadUrl ?? photo.uri);
  const heroPhoto =
    sortedPhotos.find((photo) => photo.isHero)?.downloadUrl ??
    sortedPhotos.find((photo) => photo.isHero)?.uri ??
    bonsai.heroPhoto ??
    allPhotos[0];

  return {
    ...bonsai,
    allPhotos,
    photoHistory: sortedPhotos,
    scanHistory: photosToScanHistory(sortedPhotos),
    heroPhoto,
  };
}

export function subscribeToUserBonsais(
  userId: string,
  onData: (bonsais: Bonsai[]) => void,
  onError: (error: Error) => void,
) {
  const bonsaisQuery = query(bonsaisRef(userId), orderBy("dateAdded", "asc"));

  return onSnapshot(
    bonsaisQuery,
    (snapshot) => {
      void Promise.all(
        snapshot.docs.map((entry) =>
          attachPhotos(
            userId,
            normalizeBonsaiFromFirestore(entry.id, entry.data()),
          ),
        ),
      )
        .then(onData)
        .catch(onError);
    },
    onError,
  );
}

export async function getUserBonsais(userId: string) {
  const snapshot = await getDocs(
    query(bonsaisRef(userId), orderBy("dateAdded", "asc")),
  );

  return Promise.all(
    snapshot.docs.map((entry) =>
      attachPhotos(
        userId,
        normalizeBonsaiFromFirestore(entry.id, entry.data()),
      ),
    ),
  );
}

export async function upsertBonsai(userId: string, bonsai: Bonsai) {
  await setDoc(
    bonsaiDocRef(userId, bonsai.id),
    prepareBonsaiForFirestore(bonsai),
    { merge: true },
  );
}

export async function deleteBonsai(userId: string, bonsaiId: string) {
  await deleteAllBonsaiPhotos(userId, bonsaiId);
  await deleteDoc(bonsaiDocRef(userId, bonsaiId));
}

export async function replaceUserBonsais(userId: string, bonsais: Bonsai[]) {
  const batch = writeBatch(db);

  bonsais.forEach((bonsai) => {
    batch.set(
      bonsaiDocRef(userId, bonsai.id),
      prepareBonsaiForFirestore(bonsai),
      { merge: true },
    );
  });

  await batch.commit();

  await Promise.all(
    bonsais.flatMap((bonsai) =>
      getMigrationPhotos(bonsai).map((photo) =>
        uploadBonsaiPhoto({
          userId,
          bonsaiId: bonsai.id,
          photoId: photo.id,
          uri: photo.downloadUrl ?? photo.uri,
          label: photo.label,
          scanId: photo.scanId,
          isHero: photo.isHero ?? photo.uri === bonsai.heroPhoto,
        }),
      ),
    ),
  );
}
