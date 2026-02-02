export const secondsToDate = (seconds?: number | null): Date | null => {
  if (seconds === null || seconds === undefined) return null;
  if (!Number.isFinite(seconds)) return null;
  return new Date(seconds * 1000);
};

export const formatDateSeconds = (seconds?: number | null): string | null => {
  const date = secondsToDate(seconds);
  if (!date) return null;
  return date.toLocaleDateString();
};

export const formatDateTimeSeconds = (seconds?: number | null): string | null => {
  const date = secondsToDate(seconds);
  if (!date) return null;
  return date.toLocaleString();
};

export const formatNumber = (value?: number | null): string | null => {
  if (value === null || value === undefined) return null;
  if (!Number.isFinite(value)) return null;
  return new Intl.NumberFormat().format(value);
};

// Expects an <input type="date"> value: YYYY-MM-DD
// Returns unix seconds at 00:00:00 UTC for that day.
export const parseDateInputToUtcSeconds = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(trimmed);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  const ms = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  return Math.floor(ms / 1000);
};

export const utcSecondsToDateInputValue = (seconds?: number | null): string => {
  const date = secondsToDate(seconds);
  if (!date) return '';

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
