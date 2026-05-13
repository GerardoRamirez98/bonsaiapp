import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/services/firebase/config";
import { removeUndefinedValues } from "@/services/firebase/utils";

export type ReminderInput = {
  id: string;
  title: string;
  dueDate: string;
  bonsaiId?: string;
  completed?: boolean;
};

export async function upsertReminder(userId: string, reminder: ReminderInput) {
  await setDoc(
    doc(collection(db, "users", userId, "reminders"), reminder.id),
    removeUndefinedValues({
      ...reminder,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}
