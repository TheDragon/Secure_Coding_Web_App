export function computePeriodRange(date = new Date(), period = 'daily') {
  const d = new Date(date);
  let start, end;
  if (period === 'daily') {
    start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  } else if (period === 'weekly') {
    const day = (d.getDay() + 6) % 7; // ISO week: Monday=0
    start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
    end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
  } else if (period === 'monthly') {
    start = new Date(d.getFullYear(), d.getMonth(), 1);
    end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  } else {
    start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  }
  return { start, end };
}
