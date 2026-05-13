import type { Bonsai, WateringEventType } from "@/types/bonsai";
import { getSpeciesCareTips } from "@/utils/careTips";

export type CareSeason = "Primavera" | "Verano" | "Otoño" | "Invierno";

export type SeasonalCareActivity = {
  id: string;
  type: WateringEventType | "photo" | "protection";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  months: number[];
};

export function getCareSeason(date = new Date()): CareSeason {
  const month = date.getMonth() + 1;

  if (month >= 3 && month <= 5) return "Primavera";
  if (month >= 6 && month <= 8) return "Verano";
  if (month >= 9 && month <= 11) return "Otoño";
  return "Invierno";
}

function isTropical(bonsai: Bonsai) {
  const species = `${bonsai.species ?? ""} ${bonsai.commonName ?? ""}`.toLowerCase();
  return species.includes("ficus") || species.includes("tropical");
}

function isConifer(bonsai: Bonsai) {
  const species = `${bonsai.species ?? ""} ${bonsai.commonName ?? ""}`.toLowerCase();
  return (
    species.includes("juniper") ||
    species.includes("juniperus") ||
    species.includes("pinus") ||
    species.includes("pine")
  );
}

export function getSeasonalCarePlan(
  bonsai: Bonsai,
  date = new Date(),
): SeasonalCareActivity[] {
  const month = date.getMonth() + 1;
  const season = getCareSeason(date);
  const tips = getSpeciesCareTips(bonsai.species ?? bonsai.commonName ?? "Bonsai");
  const activities: SeasonalCareActivity[] = [
    {
      id: "seasonal-photo",
      type: "photo",
      title: "Foto estacional",
      description: "Toma una foto consistente para comparar evolución.",
      priority: "medium",
      months: [3, 6, 9, 12],
    },
    {
      id: "fertilizer-growth",
      type: "fertilizer",
      title: "Fertilización de crecimiento",
      description: `Frecuencia sugerida: ${
        tips.fertilizationSchedule[0]?.frequency ?? "semanal o quincenal"
      }.`,
      priority: season === "Primavera" || season === "Verano" ? "high" : "low",
      months: [3, 4, 5, 6, 7, 8],
    },
    {
      id: "prune-shape",
      type: "prune",
      title: "Poda de mantenimiento",
      description: "Recorta brotes largos para mantener silueta y ramificación.",
      priority: "medium",
      months: [3, 4, 5, 6, 7, 8, 9],
    },
    {
      id: "repot-window",
      type: "repot",
      title: "Ventana de trasplante",
      description: "Revisa raíces y sustrato; trasplanta solo si el árbol lo necesita.",
      priority: "medium",
      months: isTropical(bonsai) ? [5, 6, 7] : [2, 3, 4],
    },
    {
      id: "wire-check",
      type: "wire",
      title: "Revisión de alambrado",
      description: "Comprueba que el alambre no esté marcando la corteza.",
      priority: "medium",
      months: [4, 5, 6, 7, 8, 9],
    },
    {
      id: "heat-protection",
      type: "protection",
      title: "Protección por calor",
      description: isConifer(bonsai)
        ? "Mantén sol fuerte con riego vigilado; protege solo en calor extremo."
        : "Evita sol directo fuerte de tarde y vigila evaporación.",
      priority: "high",
      months: [6, 7, 8],
    },
    {
      id: "winter-protection",
      type: "protection",
      title: "Protección invernal",
      description: isTropical(bonsai)
        ? "Protege de frío y corrientes; no debe pasar heladas."
        : "Permite dormancia fría, evitando heladas fuertes en raíces.",
      priority: "high",
      months: [12, 1, 2],
    },
  ];

  return activities
    .filter((activity) => activity.months.includes(month))
    .sort((left, right) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[left.priority] - rank[right.priority];
    });
}
