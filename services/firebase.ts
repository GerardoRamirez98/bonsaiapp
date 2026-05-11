import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

import type { Bonsai } from "@/types/bonsai";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

export let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export const registerWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email.trim(), password);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

export const signOutUser = () => signOut(auth);

export const onAuthStateChangedListener = (
  callback: (user: User | null) => void,
) => onAuthStateChanged(auth, callback);

export const saveUserBonsais = async (userId: string, bonsais: Bonsai[]) => {
  await setDoc(
    doc(db, "users", userId),
    {
      bonsais,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
};

export const loadUserBonsais = async (userId: string): Promise<Bonsai[]> => {
  const snapshot = await getDoc(doc(db, "users", userId));

  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.data();
  return Array.isArray(data.bonsais) ? (data.bonsais as Bonsai[]) : [];
};
