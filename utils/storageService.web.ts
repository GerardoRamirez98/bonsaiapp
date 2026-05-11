import { Bonsai } from "../types/bonsai";

const BONSAI_STORAGE_KEY = "@bonsaiapp:bonsais";
const CURRENT_BONSAI_KEY = "@bonsaiapp:currentBonsaiId";

export async function loadBonsaisFromStorage(): Promise<Bonsai[]> {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }

    const data = window.localStorage.getItem(BONSAI_STORAGE_KEY);
    if (!data) {
      return [];
    }

    return JSON.parse(data) as Bonsai[];
  } catch (error) {
    console.error("Error loading bonsais from web storage:", error);
    return [];
  }
}

export async function saveBonsaisToStorage(bonsais: Bonsai[]): Promise<void> {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(BONSAI_STORAGE_KEY, JSON.stringify(bonsais));
  } catch (error) {
    console.error("Error saving bonsais to web storage:", error);
  }
}

export async function getCurrentBonsaiIdFromStorage(): Promise<string | null> {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }

    const id = window.localStorage.getItem(CURRENT_BONSAI_KEY);
    return id || null;
  } catch (error) {
    console.error("Error loading current bonsai ID from web storage:", error);
    return null;
  }
}

export async function saveCurrentBonsaiIdToStorage(
  id: string | null,
): Promise<void> {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    if (id) {
      window.localStorage.setItem(CURRENT_BONSAI_KEY, id);
    } else {
      window.localStorage.removeItem(CURRENT_BONSAI_KEY);
    }
  } catch (error) {
    console.error("Error saving current bonsai ID to web storage:", error);
  }
}

export async function clearAllStorage(): Promise<void> {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(BONSAI_STORAGE_KEY);
    window.localStorage.removeItem(CURRENT_BONSAI_KEY);
  } catch (error) {
    console.error("Error clearing web storage:", error);
  }
}
