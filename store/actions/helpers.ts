import type { Bonsai } from "@/types/bonsai";

export function updateBonsaiById(
  bonsais: Bonsai[],
  bonsaiId: string,
  updater: (bonsai: Bonsai) => Bonsai,
) {
  let updatedBonsai: Bonsai | null = null;

  const updatedBonsais = bonsais.map((bonsai) => {
    if (bonsai.id !== bonsaiId) return bonsai;
    updatedBonsai = updater(bonsai);
    return updatedBonsai;
  });

  return { bonsais: updatedBonsais, updatedBonsai };
}

export function getNextCurrentBonsaiId(
  bonsais: Bonsai[],
  removedId: string,
  currentBonsaiId: string | null,
) {
  if (currentBonsaiId !== removedId) return currentBonsaiId;

  return bonsais[0]?.id ?? null;
}
