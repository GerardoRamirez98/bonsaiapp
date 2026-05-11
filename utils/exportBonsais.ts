import { Bonsai } from "@/types/bonsai";

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.replace(/"/g, '""');
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value) || typeof value === "object") {
    return JSON.stringify(value).replace(/"/g, '""');
  }

  return String(value);
}

export function generateBonsaisCsv(bonsais: Bonsai[]): string {
  const headers = [
    "id",
    "nickname",
    "species",
    "commonName",
    "speciesConfidence",
    "dateAdded",
    "lastWatering",
    "daily",
    "monthly",
    "yearly",
    "photoCount",
    "timelineCount",
    "sunExposureCount",
    "notes",
  ];

  const rows = bonsais.map((bonsai) => {
    return [
      bonsai.id,
      bonsai.nickname,
      bonsai.species ?? "",
      bonsai.commonName ?? "",
      bonsai.speciesConfidence ?? "",
      bonsai.dateAdded,
      bonsai.lastWatering ?? "",
      bonsai.daily ?? 0,
      bonsai.monthly ?? 0,
      bonsai.yearly ?? 0,
      bonsai.allPhotos?.length ?? 0,
      bonsai.timeline?.length ?? 0,
      bonsai.sunExposureHistory?.length ?? 0,
      bonsai.notes ?? "",
    ]
      .map((value) => `"${normalizeValue(value)}"`)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
