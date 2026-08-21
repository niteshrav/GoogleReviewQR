export type DayBucket = {
  date: string;
  count: number;
};

export function countEntriesByDay(
  items: Array<{ createdAt: Date }>,
  days = 12,
  now = new Date(),
): DayBucket[] {
  const buckets: DayBucket[] = [];
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(startOfToday);
    day.setDate(day.getDate() - offset);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const count = items.filter((item) => item.createdAt >= day && item.createdAt < next).length;
    buckets.push({
      date: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`,
      count,
    });
  }

  return buckets;
}
