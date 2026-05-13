import type { BonsaiTimelineEvent } from "@/types/bonsai";
import { getLocalDateString, getLocalTimeString } from "@/utils/dateTime";

const generateTimelineId = () =>
  `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function normalizeTimelineEvent(
  event: Partial<BonsaiTimelineEvent> &
    Pick<BonsaiTimelineEvent, "type" | "title">,
): BonsaiTimelineEvent {
  const now = new Date();

  return {
    id: event.id ?? generateTimelineId(),
    date: event.date ?? getLocalDateString(now),
    time: event.time ?? getLocalTimeString(now),
    type: event.type,
    title: event.title,
    description: event.description,
  };
}

export function createTimelineEvent(
  type: BonsaiTimelineEvent["type"],
  title: string,
  description?: string,
  date = getLocalDateString(),
  time = getLocalTimeString(),
): BonsaiTimelineEvent {
  return normalizeTimelineEvent({
    date,
    time,
    type,
    title,
    description,
  });
}

export function appendTimelineEvent(
  timeline: BonsaiTimelineEvent[] | undefined,
  event: Partial<BonsaiTimelineEvent> &
    Pick<BonsaiTimelineEvent, "type" | "title">,
) {
  return [...(timeline ?? []), normalizeTimelineEvent(event)];
}
