import { useEffect, useRef } from "react";

import { onAuthStateChangedListener } from "@/services/firebase";
import {
  getUserBonsais,
  replaceUserBonsais,
  subscribeToUserBonsais,
} from "@/services/firebaseBonsaiService";
import { upsertUserProfile } from "@/services/firebaseUserService";
import { useBonsaiStore } from "@/store/bonsaiStore";
import { loadBonsaisFromStorage } from "@/utils/storageService";

export function useFirebaseSync() {
  const unsubscribeBonsaisRef = useRef<null | (() => void)>(null);
  const migratedUsersRef = useRef(new Set<string>());

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChangedListener(async (user) => {
      unsubscribeBonsaisRef.current?.();
      unsubscribeBonsaisRef.current = null;

      if (!user) {
        useBonsaiStore.getState().resetForSignedOutUser();
        return;
      }

      const store = useBonsaiStore.getState();
      store.setSyncState({
        activeUserId: user.uid,
        isSyncing: true,
        syncError: null,
      });

      try {
        await upsertUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
        });

        if (!migratedUsersRef.current.has(user.uid)) {
          migratedUsersRef.current.add(user.uid);

          const [remoteBonsais, localBonsais] = await Promise.all([
            getUserBonsais(user.uid),
            loadBonsaisFromStorage(),
          ]);

          if (remoteBonsais.length === 0 && localBonsais.length > 0) {
            await replaceUserBonsais(user.uid, localBonsais);
          }
        }

        unsubscribeBonsaisRef.current = subscribeToUserBonsais(
          user.uid,
          (bonsais) => {
            useBonsaiStore.getState().hydrateFromRemote(bonsais);
          },
          (error) => {
            console.error("Firestore realtime bonsais error:", error);
            useBonsaiStore.getState().setSyncState({
              isSyncing: false,
              syncError: "No se pudo escuchar cambios en tiempo real.",
            });
          },
        );
      } catch (error) {
        console.error("Firebase sync bootstrap error:", error);
        useBonsaiStore.getState().setSyncState({
          isSyncing: false,
          syncError: "No se pudo inicializar la sincronización.",
        });
      }
    });

    return () => {
      unsubscribeBonsaisRef.current?.();
      unsubscribeAuth();
    };
  }, []);
}
