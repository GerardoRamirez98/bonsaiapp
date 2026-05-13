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

import { db } from "@/services/firebase";
import { removeUndefinedValues } from "@/services/firebaseUtils";
import type { Bonsai } from "@/types/bonsai";

const usersCollection = "users";
const bonsaisCollection = "bonsais";

function bonsaisRef(userId: string) {
  return collection(db, usersCollection, userId, bonsaisCollection);
}

function bonsaiDocRef(userId: string, bonsaiId: string) {
  return doc(db, usersCollection, userId, bonsaisCollection, bonsaiId);
}

type FirestoreBonsai = Omit<Bonsai, "scanHistory"> & {
  name: string;
  scanHistoryRecords: {
    id: string;
    urisByIndex: Record<string, string>;
  }[];
};

function encodeScanHistory(scanHistory: string[][]) {
  return scanHistory.map((uris, scanIndex) => ({
    id: `scan-${scanIndex}`,
    urisByIndex: Object.fromEntries(
      uris.map((uri, uriIndex) => [String(uriIndex), uri]),
    ),
  }));
}

function decodeScanHistory(data: Record<string, unknown>) {
  const records = data.scanHistoryRecords;

  if (!Array.isArray(records)) {
    return [];
  }

  return records.map((record) => {
    if (!record || typeof record !== "object") {
      return [];
    }

    const urisByIndex = (record as { urisByIndex?: Record<string, string> })
      .urisByIndex;

    if (!urisByIndex) {
      return [];
    }

    return Object.entries(urisByIndex)
      .sort(([left], [right]) => Number(left) - Number(right))
      .map(([, uri]) => uri);
  });
}

function normalizeBonsaiFromFirestore(id: string, data: Record<string, unknown>) {
  const { scanHistoryRecords, ...rest } = data;
  void scanHistoryRecords;

  return {
    ...(rest as Omit<Bonsai, "id" | "scanHistory">),
    id,
    scanHistory: decodeScanHistory(data),
  } as Bonsai;
}

function prepareBonsaiForFirestore(bonsai: Bonsai): FirestoreBonsai {
  const { scanHistory, ...bonsaiData } = bonsai;

  return removeUndefinedValues({
    ...bonsaiData,
    name: bonsai.nickname,
    scanHistoryRecords: encodeScanHistory(scanHistory ?? []),
    updatedAt: serverTimestamp(),
  });
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
      const bonsais = snapshot.docs.map((entry) =>
        normalizeBonsaiFromFirestore(entry.id, entry.data()),
      );

      onData(bonsais);
    },
    onError,
  );
}

export async function getUserBonsais(userId: string) {
  const snapshot = await getDocs(query(bonsaisRef(userId), orderBy("dateAdded", "asc")));

  return snapshot.docs.map((entry) =>
    normalizeBonsaiFromFirestore(entry.id, entry.data()),
  );
}

export async function upsertBonsai(userId: string, bonsai: Bonsai) {
  await setDoc(bonsaiDocRef(userId, bonsai.id), prepareBonsaiForFirestore(bonsai), {
    merge: true,
  });
}

export async function deleteBonsai(userId: string, bonsaiId: string) {
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
}
