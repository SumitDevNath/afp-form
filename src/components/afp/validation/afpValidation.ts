export type AFPValidationErrors = Record<string, string>;
export type AFPValidator<T> = (data: T) => AFPValidationErrors;

export function isAFPValueMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false; // 0, false, and deliberately selected answers are valid.
}

export function requireAFPField(
  errors: AFPValidationErrors,
  fieldId: string,
  value: unknown,
  label: string,
): void {
  if (isAFPValueMissing(value)) {
    errors[fieldId] = `${label} is not filled in.`;
  }
}

export function combineAFPValidators<T>(
  ...validators: AFPValidator<T>[]
): AFPValidator<T> {
  return (data) =>
    Object.assign({}, ...validators.map((validate) => validate(data)));
}

export function scrollToFirstAFPError(errors: AFPValidationErrors): void {
  // DOM order, not object key order, decides which visible field is first.
  const fields = document.querySelectorAll<HTMLElement>("[data-afp-field]");
  for (const field of fields) {
    const id = field.dataset.afpField;
    if (!id || !errors[id] || field.getClientRects().length === 0) continue;
    field.scrollIntoView({ behavior: "smooth", block: "center" });
    const control = field.querySelector<HTMLElement>(
      'input:not([disabled]):not([aria-hidden="true"]), textarea:not([disabled]), [role="combobox"], button:not([disabled])',
    );
    control?.focus({ preventScroll: true });
    return;
  }
}
