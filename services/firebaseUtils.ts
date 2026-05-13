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
