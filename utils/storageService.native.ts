import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bonsai } from "../types/bonsai";

const BONSAI_STORAGE_KEY = "@bonsaiapp:bonsais";
const CURRENT_BONSAI_KEY = "@bonsaiapp:currentBonsaiId";

/**
 * Get all bonsais from storage
 */
export async function loadBonsaisFromStorage(): Promise<Bonsai[]> {
  try {
    const data = await AsyncStorage.getItem(BONSAI_STORAGE_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data) as Bonsai[];
  } catch (error) {
    console.error("Error loading bonsais from storage:", error);
    return [];
  }
}

/**
 * Save all bonsais to storage
 */
export async function saveBonsaisToStorage(bonsais: Bonsai[]): Promise<void> {
  try {
    const data = JSON.stringify(bonsais);
    await AsyncStorage.setItem(BONSAI_STORAGE_KEY, data);
  } catch (error) {
    console.error("Error saving bonsais to storage:", error);
  }
}

/**
 * Get the currently active bonsai ID
 */
export async function getCurrentBonsaiIdFromStorage(): Promise<string | null> {
  try {
    const id = await AsyncStorage.getItem(CURRENT_BONSAI_KEY);
    return id || null;
  } catch (error) {
    console.error("Error loading current bonsai ID:", error);
    return null;
  }
}

/**
 * Save the currently active bonsai ID
 */
export async function saveCurrentBonsaiIdToStorage(
  id: string | null,
): Promise<void> {
  try {
    if (id) {
      await AsyncStorage.setItem(CURRENT_BONSAI_KEY, id);
    } else {
      await AsyncStorage.removeItem(CURRENT_BONSAI_KEY);
    }
  } catch (error) {
    console.error("Error saving current bonsai ID:", error);
  }
}

/**
 * Clear all storage (for testing/reset)
 */
export async function clearAllStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BONSAI_STORAGE_KEY);
    await AsyncStorage.removeItem(CURRENT_BONSAI_KEY);
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
}
