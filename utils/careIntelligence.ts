import type { WeatherSnapshot } from "@/services/weather";
import type { Bonsai } from "@/types/bonsai";
import { getBonsaiHealthScore } from "@/utils/bonsaiHealthScore";
import { getDaysSince } from "@/utils/bonsaiInsights";

export type CareUrgency = "low" | "medium" | "high";

export type CareRecommendation = {
  score: number;
  urgency: CareUrgency;
  title: string;
  summary: string;
  nextAction: string;
  nextWateringLabel: string;
  riskFactors: string[];
};

function getCurrentSeason(date = new Date()) {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return "Primavera";
  if (month >= 5 && month <= 7) return "Verano";
  if (month >= 8 && month <= 10) return "Otoño";
  return "Invierno";
}

function getSpeciesWateringBias(bonsai: Bonsai) {
  const species = `${bonsai.species ?? ""} ${bonsai.commonName ?? ""}`.toLowerCase();

  if (species.includes("ficus") || species.includes("tropical")) return 1;
  if (species.includes("juniper") || species.includes("juniperus")) return 0;
  if (species.includes("pinus") || species.includes("pine")) return -1;
  return 0;
}

function getBaseWateringWindow(bonsai: Bonsai) {
  const season = getCurrentSeason();
  const speciesBias = getSpeciesWateringBias(bonsai);
  const seasonalWindow =
    season === "Verano" ? 2 : season === "Invierno" ? 5 : 3;

  return Math.max(1, seasonalWindow - speciesBias);
}

export function getCareRecommendation(
  bonsai: Bonsai,
  weather?: WeatherSnapshot | null,
): CareRecommendation {
  const daysSinceWater = getDaysSince(bonsai.lastWatering);
  const health = getBonsaiHealthScore({
    wateringHistory: bonsai.wateringHistory ?? [],
    lastWatering: bonsai.lastWatering,
    temperature: weather?.temperature,
  });
  const riskFactors: string[] = [];
  const wateringWindow = getBaseWateringWindow(bonsai);

  let score = health.score;
  let weatherPressure = 0;

  if (weather) {
    if (weather.maxTemperature !== undefined && weather.maxTemperature >= 32) {
      riskFactors.push("Calor alto hoy");
      weatherPressure += 1;
      score -= 8;
    }

    if (weather.humidity <= 35) {
      riskFactors.push("Ambiente seco");
      weatherPressure += 1;
      score -= 6;
    }

    if ((weather.uvIndex ?? 0) >= 8) {
      riskFactors.push("UV fuerte");
      score -= 4;
    }

    if (weather.rainProbability >= 65 || weather.rain >= 1) {
      riskFactors.push("Lluvia probable");
      weatherPressure -= 1;
      score += 4;
    }
  }

  const adjustedWindow = Math.max(1, wateringWindow - weatherPressure);
  const shouldWater =
    daysSinceWater === null || daysSinceWater >= adjustedWindow;
  const urgency: CareUrgency =
    shouldWater && (daysSinceWater === null || daysSinceWater >= adjustedWindow + 2)
      ? "high"
      : shouldWater
        ? "medium"
        : riskFactors.length >= 2
          ? "medium"
          : "low";

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    urgency,
    title:
      urgency === "high"
        ? "Atención hoy"
        : urgency === "medium"
          ? "Revisión recomendada"
          : "Condiciones estables",
    summary:
      daysSinceWater === null
        ? "Aún no hay riego registrado para calcular un patrón."
        : `Último riego hace ${daysSinceWater} día(s). Ventana sugerida: ${adjustedWindow} día(s).`,
    nextAction: shouldWater
      ? "Revisa el sustrato y registra riego si está seco."
      : "Mantén observación visual y evita cambios innecesarios.",
    nextWateringLabel: shouldWater
      ? "Revisar riego hoy"
      : `Próxima revisión en ${Math.max(1, adjustedWindow - (daysSinceWater ?? 0))} día(s)`,
    riskFactors,
  };
}
