import { BonsaiHealthInput, HealthScoreResult } from "../types/bonsai";

export function getBonsaiHealthScore(
  input: BonsaiHealthInput,
): HealthScoreResult {
  const { wateringHistory, lastWatering, temperature = 25 } = input;

  let score = 100;

  const today = new Date();

  // =========================
  // 1. DÍAS SIN RIEGO
  // =========================
  let daysSinceWater = 999;

  if (lastWatering) {
    const lastWateringDate =
      lastWatering instanceof Date ? lastWatering : new Date(lastWatering);

    if (!isNaN(lastWateringDate.getTime())) {
      const diff = today.getTime() - lastWateringDate.getTime();

      daysSinceWater = Math.floor(diff / (1000 * 60 * 60 * 24));
    }
  }

  // 💧 sequía
  if (daysSinceWater >= 4 && temperature > 28) {
    score -= 40;
  } else if (daysSinceWater >= 3) {
    score -= 20;
  } else if (daysSinceWater <= 1) {
    score += 5;
  }

  // =========================
  // 2. EXCESO DE RIEGO
  // =========================
  const recentWaterings = wateringHistory.slice(-5);

  const waterCount = recentWaterings.filter((e) => e.type === "water").length;

  if (waterCount >= 4) {
    score -= 30;
  } else if (waterCount >= 3) {
    score -= 15;
  }

  // =========================
  // 3. ESTABILIDAD GENERAL
  // =========================
  if (wateringHistory.length < 3) {
    score -= 10;
  }

  // =========================
  // 4. NORMALIZAR SCORE
  // =========================
  if (score > 100) score = 100;
  if (score < 0) score = 0;

  // =========================
  // 5. STATUS
  // =========================
  let status: "critical" | "warning" | "stable" | "excellent";

  if (score <= 40) status = "critical";
  else if (score <= 65) status = "warning";
  else if (score <= 85) status = "stable";
  else status = "excellent";

  // =========================
  // 6. MENSAJE
  // =========================
  const messageMap = {
    critical: "Tu bonsái está en riesgo. Requiere atención inmediata.",
    warning: "Hay señales de estrés. Ajusta riego y observa.",
    stable: "Estado estable. Mantén el cuidado actual.",
    excellent: "Tu bonsái está en excelente salud.",
  };

  return {
    score,
    status,
    message: messageMap[status],
  };
}
