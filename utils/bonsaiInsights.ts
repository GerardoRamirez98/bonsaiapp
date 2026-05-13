import type { Bonsai } from "@/types/bonsai";
import { getBonsaiHealthScore } from "@/utils/bonsaiHealthScore";

export type BonsaiCareTaskType = "water" | "species" | "photos" | "health";

export type BonsaiCareTask = {
  id: string;
  bonsaiId: string;
  type: BonsaiCareTaskType;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
};

export function getDaysSince(value: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return Math.floor((Date.now() - parsed.getTime()) / 86400000);
}

export function formatLastWatering(value: string | null) {
  const days = getDaysSince(value);

  if (days === null) return "Sin riego registrado";
  if (days <= 0) return "Regado hoy";
  if (days === 1) return "Regado ayer";
  return `Regado hace ${days} días`;
}

export function getUniquePhotoCount(bonsai: Bonsai) {
  const photoUris = [
    ...(bonsai.photoHistory ?? []).map((photo) => photo.uri),
    ...(bonsai.allPhotos ?? []),
  ].filter(Boolean);

  return new Set(photoUris).size;
}

export function getBonsaiCareTasks(bonsai: Bonsai): BonsaiCareTask[] {
  const tasks: BonsaiCareTask[] = [];
  const daysSinceWatering = getDaysSince(bonsai.lastWatering);
  const photoCount = getUniquePhotoCount(bonsai);
  const health = getBonsaiHealthScore({
    wateringHistory: bonsai.wateringHistory ?? [],
    lastWatering: bonsai.lastWatering,
  });

  if (daysSinceWatering === null || daysSinceWatering >= 2) {
    tasks.push({
      id: `${bonsai.id}-water`,
      bonsaiId: bonsai.id,
      type: "water",
      title: `Revisar riego de ${bonsai.nickname}`,
      description:
        daysSinceWatering === null
          ? "Todavía no tiene un riego registrado."
          : `Han pasado ${daysSinceWatering} días desde el último riego.`,
      priority: daysSinceWatering === null || daysSinceWatering >= 4 ? "high" : "medium",
    });
  }

  if (health.status === "critical" || health.status === "warning") {
    tasks.push({
      id: `${bonsai.id}-health`,
      bonsaiId: bonsai.id,
      type: "health",
      title: `Revisar salud de ${bonsai.nickname}`,
      description: health.message,
      priority: health.status === "critical" ? "high" : "medium",
    });
  }

  if (!bonsai.species) {
    tasks.push({
      id: `${bonsai.id}-species`,
      bonsaiId: bonsai.id,
      type: "species",
      title: `Identificar ${bonsai.nickname}`,
      description: "Agrega especie para activar cuidados más precisos.",
      priority: "medium",
    });
  }

  if (photoCount < 4) {
    tasks.push({
      id: `${bonsai.id}-photos`,
      bonsaiId: bonsai.id,
      type: "photos",
      title: `Completar galería de ${bonsai.nickname}`,
      description: `Tiene ${photoCount} de 4 fotos base recomendadas.`,
      priority: "low",
    });
  }

  return tasks;
}

export function getCollectionCareTasks(bonsais: Bonsai[]) {
  const priorityRank = { high: 0, medium: 1, low: 2 };

  return bonsais
    .flatMap(getBonsaiCareTasks)
    .sort((left, right) => priorityRank[left.priority] - priorityRank[right.priority]);
}

export function getCollectionStats(bonsais: Bonsai[]) {
  const photoCount = bonsais.reduce(
    (total, bonsai) => total + getUniquePhotoCount(bonsai),
    0,
  );
  const pendingTasks = getCollectionCareTasks(bonsais).length;
  const averageHealth =
    bonsais.length === 0
      ? 0
      : Math.round(
          bonsais.reduce((total, bonsai) => {
            const health = getBonsaiHealthScore({
              wateringHistory: bonsai.wateringHistory ?? [],
              lastWatering: bonsai.lastWatering,
            });

            return total + health.score;
          }, 0) / bonsais.length,
        );

  return {
    bonsaiCount: bonsais.length,
    photoCount,
    pendingTasks,
    averageHealth,
  };
}
