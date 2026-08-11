export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Monday as the first day of the week.
export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ISO-week key like "2026-W33" for a given week-start date.
export function weekKey(weekStart: Date): string {
  const d = new Date(weekStart);
  d.setHours(0, 0, 0, 0);
  // Thursday of this week determines the ISO year/week.
  const thursday = addDays(d, 3);
  const year = thursday.getFullYear();
  const firstThursday = (() => {
    const jan1 = new Date(year, 0, 1);
    const offset = (4 - ((jan1.getDay() + 6) % 7) + 7) % 7;
    return addDays(jan1, offset);
  })();
  const week =
    1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${year}-W${String(week).padStart(2, "0")}`;
}

// Days (Mon..Sun) for the week containing/based on weekStart.
export function weekDays(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => ymd(addDays(weekStart, i)));
}
