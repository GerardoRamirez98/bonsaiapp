import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/services/firebase/config";
import { removeUndefinedValues } from "@/services/firebase/utils";

export type UserSettings = {
  currentBonsaiId?: string | null;
};

export async function upsertUserProfile(
  userId: string,
  profile: { email?: string | null; displayName?: string | null },
) {
  await setDoc(
    doc(db, "users", userId),
    removeUndefinedValues({
      email: profile.email ?? null,
      displayName: profile.displayName ?? null,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}

export async function updateUserSettings(
  userId: string,
  settings: UserSettings,
) {
  await setDoc(
    doc(db, "users", userId),
    removeUndefinedValues({
      settings,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}
