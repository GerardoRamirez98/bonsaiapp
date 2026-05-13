export function removeUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedValues(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce(
      (cleaned, [key, entry]) => {
        if (entry !== undefined) {
          cleaned[key] = removeUndefinedValues(entry);
        }

        return cleaned;
      },
      {} as Record<string, unknown>,
    ) as T;
  }

  return value;
}

function getFriendlyErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return fallback;
  }

  return fallback;
}

export function handleFirebaseError(error: unknown, fallback = "No se pudo completar la operación en Firebase.") {
  console.error("Firebase error:", error);
  return getFriendlyErrorMessage(error, fallback);
}

export function handleStorageError(error: unknown, fallback = "No se pudo sincronizar la foto.") {
  console.error("Firebase Storage error:", error);
  return getFriendlyErrorMessage(error, fallback);
}

export function handleSyncError(error: unknown, fallback = "No se pudo sincronizar la información.") {
  console.error("Sync error:", error);
  return getFriendlyErrorMessage(error, fallback);
}
