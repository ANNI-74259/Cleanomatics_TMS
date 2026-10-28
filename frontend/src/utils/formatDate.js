// Date helpers. Due dates are "YYYY-MM-DD" strings, so we parse them by hand
// (new Date("2026-11-02") would shift the day in some timezones).
const pad = (n) => String(n).padStart(2, '0');

export function toYMD(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayYMD() {
  return toYMD(new Date());
}

export function parseYMD(text) {
  const [year, month, day] = text.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// "2026-11-02" -> "Nov 2"
export function formatShortDate(text) {
  if (!text) return 'No due date';
  return parseYMD(text).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// "2026-11-02" -> "Nov 2, 2026"
export function formatFullDate(text) {
  if (!text) return 'No due date';
  return parseYMD(text).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ISO timestamp -> "Oct 28, 2026, 9:45 AM"
export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

// Date -> "09:45 AM"
export function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// How many days from today until this date (negative = in the past)
export function daysUntil(text) {
  const today = parseYMD(todayYMD());
  return Math.round((parseYMD(text) - today) / 86400000);
}
