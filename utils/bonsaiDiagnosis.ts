import type { Bonsai } from "@/types/bonsai";
import { getDaysSince } from "@/utils/bonsaiInsights";

export type DiagnosisSymptom =
  | "yellowLeaves"
  | "dryTips"
  | "leafDrop"
  | "wetSoil"
  | "drySoil"
  | "pests"
  | "weakGrowth";

export type DiagnosisOption = {
  id: DiagnosisSymptom;
  label: string;
};

export type DiagnosisResult = {
  severity: "low" | "medium" | "high";
  title: string;
  summary: string;
  actions: string[];
};

export const DIAGNOSIS_OPTIONS: DiagnosisOption[] = [
  { id: "yellowLeaves", label: "Hojas amarillas" },
  { id: "dryTips", label: "Puntas secas" },
  { id: "leafDrop", label: "Caída de hojas" },
  { id: "wetSoil", label: "Sustrato húmedo" },
  { id: "drySoil", label: "Sustrato seco" },
  { id: "pests", label: "Plagas visibles" },
  { id: "weakGrowth", label: "Crecimiento débil" },
];

export function diagnoseBonsai(
  bonsai: Bonsai,
  symptoms: DiagnosisSymptom[],
): DiagnosisResult | null {
  if (!symptoms.length) return null;

  const selected = new Set(symptoms);
  const actions = new Set<string>();
  let score = 0;

  if (selected.has("pests")) {
    score += 3;
    actions.add("Aísla el bonsái y revisa envés de hojas, ramas y sustrato.");
    actions.add("Limpia manualmente y considera tratamiento suave como jabón potásico.");
  }

  if (selected.has("wetSoil") && selected.has("yellowLeaves")) {
    score += 3;
    actions.add("Reduce riego y revisa drenaje; puede haber exceso de humedad.");
  }

  if (selected.has("drySoil") || selected.has("dryTips")) {
    score += 2;
    actions.add("Comprueba humedad profunda antes de regar; no te guíes solo por la superficie.");
  }

  if (selected.has("leafDrop")) {
    score += 2;
    actions.add("Evita moverlo de ubicación durante unos días y revisa cambios de luz/temperatura.");
  }

  if (selected.has("weakGrowth")) {
    score += 1;
    actions.add("Revisa luz, temporada y fertilización antes de podar más.");
  }

  const daysSinceWater = getDaysSince(bonsai.lastWatering);
  if (daysSinceWater !== null && daysSinceWater >= 5 && selected.has("drySoil")) {
    score += 2;
    actions.add("Registra un riego profundo si el sustrato está seco también por dentro.");
  }

  if (actions.size === 0) {
    actions.add("Registra una nota y toma foto para comparar en 48 horas.");
  }

  const severity =
    score >= 5 ? "high" : score >= 3 ? "medium" : "low";

  return {
    severity,
    title:
      severity === "high"
        ? "Revisión urgente"
        : severity === "medium"
          ? "Posible estrés"
          : "Observación ligera",
    summary: `${bonsai.nickname} muestra ${symptoms.length} señal(es). Usa esto como guía inicial, no diagnóstico definitivo.`,
    actions: Array.from(actions).slice(0, 4),
  };
}
