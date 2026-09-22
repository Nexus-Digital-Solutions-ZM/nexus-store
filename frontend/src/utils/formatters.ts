export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-ZM").format(value);
}

export function formatDate(value: string | number | Date): string {
  return new Intl.DateTimeFormat("en-ZM", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}