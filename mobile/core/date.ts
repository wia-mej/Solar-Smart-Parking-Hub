/**
 * Le backend attend un LocalDateTime Java, c'est-à-dire une date sans fuseau
 * horaire (« 2026-08-20T16:30:00 »). `toISOString()` produit au contraire une
 * date UTC suffixée par « Z », que Spring refuse de convertir.
 */
export function toLocalIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

export function formatDateHeure(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}