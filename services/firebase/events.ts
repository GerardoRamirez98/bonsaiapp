import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/services/firebase/config";
import { removeUndefinedValues } from "@/services/firebase/utils";
import type { BonsaiTimelineEvent } from "@/types/bonsai";

function bonsaiEventsRef(userId: string, bonsaiId: string) {
  return collection(db, "users", userId, "bonsais", bonsaiId, "events");
}

export async function upsertBonsaiEvent(
  userId: string,
  bonsaiId: string,
  event: BonsaiTimelineEvent,
) {
  await setDoc(
    doc(bonsaiEventsRef(userId, bonsaiId), event.id),
    removeUndefinedValues({
      ...event,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}
