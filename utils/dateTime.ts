export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLocalTimeString(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function toLocalDateTimeIso(date: string, time?: string) {
  const parsed = new Date(time ? `${date}T${time}:00` : `${date}T00:00:00`);

  return Number.isNaN(parsed.getTime()) ? date : parsed.toISOString();
}

export function isDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isTimeString(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}
