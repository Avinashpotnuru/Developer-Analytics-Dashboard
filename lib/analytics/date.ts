const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function toDate(iso: string): Date {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date: ${iso}`);
  }
  return date;
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfWeek(date: Date): Date {
  const result = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const day = result.getDay();
  const difference = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + difference);
  return result;
}

export function weekKey(date: Date): string {
  return localDateKey(startOfWeek(date));
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatWeekLabel(key: string): string {
  const parts = key.split("-").map(Number);
  const month = parts[1];
  const day = parts[2];
  if (!month || !day) return key;
  const index = month - 1;
  if (index < 0 || index > 11) return key;
  return `${MONTHS[index]} ${String(day).padStart(2, "0")}`;
}

export function formatMonthLabel(key: string): string {
  const parts = key.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  if (!year || !month) return key;
  const index = month - 1;
  if (index < 0 || index > 11) return key;
  return `${MONTHS[index]} ${String(year).slice(2)}`;
}
