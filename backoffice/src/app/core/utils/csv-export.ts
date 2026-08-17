export function exportToCsv(filename: string, rows: object[]): void {
  if (rows.length === 0) {
    alert('Aucune donnée à exporter.');
    return;
  }

  const headers = Object.keys(rows[0]);

  const escapeCell = (value: unknown): string => {
    const str = value === null || value === undefined ? '' : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => escapeCell((row as Record<string, unknown>)[h])).join(','),
    ),
  ];

  const csvContent = csvLines.join('\r\n');
  // Le "\uFEFF" (BOM) au début force Excel à reconnaître l'encodage UTF-8,
  // sinon les accents (é, è...) s'affichent mal à l'ouverture.
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}