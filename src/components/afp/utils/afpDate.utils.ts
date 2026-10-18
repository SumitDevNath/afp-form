const DISPLAY_DATE_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/;

export function isValidDateFormat(value: string): boolean {
  return DISPLAY_DATE_PATTERN.test(value);
}

export function isValidCalendarDate(value: string): boolean {
  if (!isValidDateFormat(value)) {
    return false;
  }

  const match = DISPLAY_DATE_PATTERN.exec(value);

  if (!match) {
    return false;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function parseDisplayDate(value: string): Date | null {
  if (!isValidCalendarDate(value)) {
    return null;
  }

  const [day, month, year] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function isFutureDate(value: string): boolean {
  const date = parseDisplayDate(value);

  if (!date) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date > today;
}

export function convertNativeDateToDisplay(value: string): string {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}-${month}-${year}`;
}

export function convertDisplayDateToNative(value: string): string {
  if (!isValidCalendarDate(value)) {
    return "";
  }

  const [day, month, year] = value.split("-");

  return `${year}-${month}-${day}`;
}
