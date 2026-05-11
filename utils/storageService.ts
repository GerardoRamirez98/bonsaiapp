import { Platform } from "react-native";
import { Bonsai } from "../types/bonsai";

type StorageModule = {
  loadBonsaisFromStorage(): Promise<Bonsai[]>;
  saveBonsaisToStorage(bonsais: Bonsai[]): Promise<void>;
  getCurrentBonsaiIdFromStorage(): Promise<string | null>;
  saveCurrentBonsaiIdToStorage(id: string | null): Promise<void>;
  clearAllStorage(): Promise<void>;
};

export async function loadPlatformStorage(): Promise<StorageModule> {
  if (Platform.OS === "web") {
    return await import("./storageService.web");
  }

  return await import("./storageService.native");
}

export async function loadBonsaisFromStorage(): Promise<Bonsai[]> {
  const module = await loadPlatformStorage();
  return module.loadBonsaisFromStorage();
}

export async function saveBonsaisToStorage(bonsais: Bonsai[]): Promise<void> {
  const module = await loadPlatformStorage();
  return module.saveBonsaisToStorage(bonsais);
}

export async function getCurrentBonsaiIdFromStorage(): Promise<string | null> {
  const module = await loadPlatformStorage();
  return module.getCurrentBonsaiIdFromStorage();
}

export async function saveCurrentBonsaiIdToStorage(
  id: string | null,
): Promise<void> {
  const module = await loadPlatformStorage();
  return module.saveCurrentBonsaiIdToStorage(id);
}

export async function clearAllStorage(): Promise<void> {
  const module = await loadPlatformStorage();
  return module.clearAllStorage();
}
