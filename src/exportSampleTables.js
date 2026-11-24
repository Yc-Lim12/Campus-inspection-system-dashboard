function csvCell(value) {
  const cell = value.trim();
  const plainText = /^[=+\-@\t\r\n]/.test(cell) ? "'" + cell : cell;
  return '"' + plainText.replaceAll('"', '""') + '"';
}

export function exportSampleTables(event, filename) {
  const tables = event.currentTarget.closest('main').querySelectorAll('table');
  const lines = [];
  for (const table of tables) {
    if (table.caption) lines.push(csvCell(table.caption.textContent));
    for (const row of table.rows) {
      if (!row.hidden) lines.push(Array.from(row.cells, (cell) => csvCell(cell.textContent)).join(','));
    }
    lines.push('');
  }
  const file = new Blob(['\uFEFF', lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
