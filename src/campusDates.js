const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function campusDayLabel(day) {
  if (!day) return '';
  const [year, month, date] = day.split('-');
  return Number(date) + ' ' + months[Number(month) - 1] + ' ' + year;
}

export function parseCampusDay(input) {
  const text = input.trim();
  const iso = /^\d{4}-\d{2}-\d{2}$/.exec(text)?.[0];
  const parts = /^(\d{1,2})\s+([a-z]{3})\s+(\d{4})$/i.exec(text);
  const month = parts && months.findIndex(name => name.toLowerCase() === parts[2].toLowerCase()) + 1;
  const day = iso || (month ? parts[3] + '-' + String(month).padStart(2, '0') + '-' + parts[1].padStart(2, '0') : '');
  if (!day) return '';
  const date = new Date(day + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === day ? day : '';
}
