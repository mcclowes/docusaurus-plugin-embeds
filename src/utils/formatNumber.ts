export default function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  if (value < 1_000) return String(value);
  if (value < 1_000_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
}
