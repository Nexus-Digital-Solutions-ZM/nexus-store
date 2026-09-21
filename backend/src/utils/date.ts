export function formatDateForStorage(date: Date = new Date()): string {
  return date.toISOString();
}
