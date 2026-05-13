import type { Bonsai, PhotoHistoryEntry } from "@/types/bonsai";

export type VisualEvolution = {
  photos: PhotoHistoryEntry[];
  firstPhoto?: PhotoHistoryEntry;
  latestPhoto?: PhotoHistoryEntry;
  daysTracked: number;
  milestoneCount: number;
};

export function getVisualEvolution(bonsai: Bonsai): VisualEvolution {
  const uniquePhotos = new Map<string, PhotoHistoryEntry>();

  for (const photo of bonsai.photoHistory ?? []) {
    const key = photo.downloadUrl ?? photo.uri;

    if (!uniquePhotos.has(key)) {
      uniquePhotos.set(key, photo);
    }
  }

  const photos = Array.from(uniquePhotos.values()).sort(
    (left, right) =>
      new Date(left.capturedAt).getTime() - new Date(right.capturedAt).getTime(),
  );
  const firstPhoto = photos[0];
  const latestPhoto = photos[photos.length - 1];
  const daysTracked =
    firstPhoto && latestPhoto
      ? Math.max(
          0,
          Math.floor(
            (new Date(latestPhoto.capturedAt).getTime() -
              new Date(firstPhoto.capturedAt).getTime()) /
              86400000,
          ),
        )
      : 0;

  return {
    photos,
    firstPhoto,
    latestPhoto,
    daysTracked,
    milestoneCount: photos.length,
  };
}
