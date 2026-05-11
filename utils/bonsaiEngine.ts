import { THEME } from "@/constants/theme";
import { WateringEvent } from "../types/bonsai";

type BonsaiInput = {
  wateringHistory: WateringEvent[];
  lastWatering: string | Date | null;
  daily: number;
  monthly: number;
  season?: "Verano" | "Invierno" | "Primavera" | "Otoño";
  temperature?: number;
};

export function getBonsaiRecommendation(input: BonsaiInput) {
  const { wateringHistory, lastWatering, temperature = 25 } = input;

  const today = new Date();
  const lastWateringDate = lastWatering
    ? lastWatering instanceof Date
      ? lastWatering
      : new Date(lastWatering)
    : null;

  // =========================
  // 1. DÍAS SIN RIEGO
  // =========================
  let daysSinceWater = 999;

  if (lastWateringDate && !isNaN(lastWateringDate.getTime())) {
    const diff = today.getTime() - lastWateringDate.getTime();

    daysSinceWater = Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // =========================
  // 2. CONTADOR DE EVENTOS
  // =========================
  const totalWaterings = wateringHistory.filter(
    (e) => e.type === "water",
  ).length;

  const recentWaterings = wateringHistory.slice(-5);

  const overWatering =
    recentWaterings.filter((e) => e.type === "water").length >= 3;

  // =========================
  // 3. REGLAS INTELIGENTES
  // =========================

  // 🔴 CRÍTICO: sequía
  if (daysSinceWater >= 4 && temperature > 28) {
    return {
      level: "critical",
      message: "Tu bonsái está en estrés hídrico. Riego urgente recomendado.",
      color: "#e74c3c",
    };
  }

  // 🟠 ALERTA: exceso de agua
  if (overWatering) {
    return {
      level: "warning",
      message: "Detecto posible exceso de riego. Deja secar el sustrato.",
      color: "#f39c12",
    };
  }

  // 🟡 ATENCIÓN: sin riego moderado
  if (daysSinceWater >= 3) {
    return {
      level: "attention",
      message: "Han pasado varios días. Revisa humedad del sustrato.",
      color: "#f1c40f",
    };
  }

  // 🟢 NORMAL
  if (daysSinceWater <= 2) {
    return {
      level: "good",
      message: "Tu bonsái está en equilibrio. Mantén el cuidado actual.",
      color: "#2ecc71",
    };
  }

  // fallback
  return {
    level: "info",
    message: "Sin datos suficientes para análisis profundo.",
    color: THEME.colors.primary,
  };
}
