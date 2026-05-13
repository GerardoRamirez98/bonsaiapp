import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import * as FileSystem from "expo-file-system/legacy";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";

import { db, storage } from "@/services/firebase/config";
import {
  handleStorageError,
  removeUndefinedValues,
} from "@/services/firebase/utils";
import type { PhotoHistoryEntry } from "@/types/bonsai";

export type UploadedBonsaiPhoto = PhotoHistoryEntry & {
  storagePath: string;
  downloadUrl: string;
};

function photosCollectionRef(userId: string, bonsaiId: string) {
  return collection(db, "users", userId, "bonsais", bonsaiId, "photos");
}

function photoDocRef(userId: string, bonsaiId: string, photoId: string) {
  return doc(db, "users", userId, "bonsais", bonsaiId, "photos", photoId);
}

function getPhotoStoragePath(userId: string, bonsaiId: string, photoId: string) {
  return `users/${userId}/bonsais/${bonsaiId}/photos/${photoId}.jpg`;
}

async function uriToBase64(uri: string) {
  if (uri.startsWith("data:image")) {
    return uri.split("base64,")[1] ?? "";
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!base64) {
    throw new Error("No se pudo leer la imagen local.");
  }

  return base64;
}

export async function uploadBonsaiPhoto(params: {
  userId: string;
  bonsaiId: string;
  photoId: string;
  uri: string;
  label?: string;
  scanId?: string;
  isHero?: boolean;
}): Promise<UploadedBonsaiPhoto> {
  try {
    const storagePath = getPhotoStoragePath(
      params.userId,
      params.bonsaiId,
      params.photoId,
    );
    const photoRef = ref(storage, storagePath);
    const base64 = await uriToBase64(params.uri);

    await uploadString(photoRef, base64, "base64", {
      contentType: "image/jpeg",
    });

    const downloadUrl = await getDownloadURL(photoRef);
    const photo: UploadedBonsaiPhoto = {
      id: params.photoId,
      uri: downloadUrl,
      downloadUrl,
      storagePath,
      capturedAt: new Date().toISOString(),
      label: params.label,
      scanId: params.scanId,
      isHero: params.isHero,
    };

    await setDoc(
      photoDocRef(params.userId, params.bonsaiId, params.photoId),
      removeUndefinedValues({
        ...photo,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      { merge: true },
    );

    return photo;
  } catch (error) {
    throw new Error(handleStorageError(error));
  }
}

export async function listBonsaiPhotos(userId: string, bonsaiId: string) {
  const snapshot = await getDocs(photosCollectionRef(userId, bonsaiId));

  return snapshot.docs.map((entry) => ({
    id: entry.id,
    ...(entry.data() as Omit<UploadedBonsaiPhoto, "id">),
  }));
}

export async function deleteBonsaiPhoto(
  userId: string,
  bonsaiId: string,
  photo: Pick<PhotoHistoryEntry, "id" | "storagePath">,
) {
  try {
    if (photo.storagePath) {
      await deleteObject(ref(storage, photo.storagePath));
    }

    await deleteDoc(photoDocRef(userId, bonsaiId, photo.id));
  } catch (error) {
    throw new Error(handleStorageError(error, "No se pudo eliminar la foto."));
  }
}

export async function deleteAllBonsaiPhotos(userId: string, bonsaiId: string) {
  const photos = await listBonsaiPhotos(userId, bonsaiId);
  await Promise.all(
    photos.map((photo) => deleteBonsaiPhoto(userId, bonsaiId, photo)),
  );
}

export async function setHeroPhotoMetadata(
  userId: string,
  bonsaiId: string,
  photoId: string,
) {
  const snapshot = await getDocs(photosCollectionRef(userId, bonsaiId));
  const batch = writeBatch(db);

  snapshot.docs.forEach((photo) => {
    batch.set(
      photo.ref,
      { isHero: photo.id === photoId, updatedAt: serverTimestamp() },
      { merge: true },
    );
  });

  if (!snapshot.docs.some((photo) => photo.id === photoId)) {
    batch.set(
      photoDocRef(userId, bonsaiId, photoId),
      { isHero: true, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  await batch.commit();
}
