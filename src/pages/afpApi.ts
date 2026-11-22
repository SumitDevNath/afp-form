/** Local-only AFP API client. Never use with production NDSS credentials. */

export interface AFPLocalRecord<T> {
  id: string;
  createdAt: string;
  updatedAt: string;
  persistenceScope: "local_full_form";
  notPersistedSections: string[];
  data: T;
}

export class AFPApiError extends Error {
  readonly status: number | null;
  readonly fieldErrors: Record<string, string>;

  constructor(
    message: string,
    status: number | null = null,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);

    this.name = "AFPApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const API_PATH = "/api/v1/afp/investigations";
const TIMEOUT_MS = 15_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractFieldErrors(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};

  const errors: Record<string, string> = {};

  for (const [key, message] of Object.entries(value)) {
    if (/^[A-Za-z0-9_.-]{1,300}$/.test(key) && typeof message === "string") {
      errors[key] = message;
    }
  }

  return errors;
}

async function requestAFP<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  payload?: T,
): Promise<AFPLocalRecord<T>> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response: Response;

    try {
      response = await fetch(`${API_PATH}${path}`, {
        method,
        credentials: "omit",
        cache: "no-store",
        headers: {
          "X-AFP-Local-Dev": "true",
          ...(payload === undefined
            ? {}
            : { "Content-Type": "application/json" }),
        },
        ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted) {
        throw new AFPApiError(
          "Local AFP server timed out. Check whether the save " +
            "succeeded before submitting again.",
        );
      }

      throw new AFPApiError(
        "Cannot contact the local AFP backend. " +
          "Check FastAPI and Vite's /api proxy.",
      );
    }

    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        isRecord(body) && typeof body.message === "string"
          ? body.message
          : response.status === 422
            ? "Please correct the fields rejected by the backend."
            : `Local AFP request failed (HTTP ${response.status}).`;

      const errors = isRecord(body) ? extractFieldErrors(body.errors) : {};

      throw new AFPApiError(message, response.status, errors);
    }

    if (
      !isRecord(body) ||
      typeof body.id !== "string" ||
      body.persistenceScope !== "local_full_form" ||
      !isRecord(body.data)
    ) {
      throw new AFPApiError(
        "The local backend returned an unexpected response. " +
          "Check the Phase 8 API contract.",
      );
    }

    return body as unknown as AFPLocalRecord<T>;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function createAFPInvestigation<T>(
  payload: T,
): Promise<AFPLocalRecord<T>> {
  return requestAFP("POST", "", payload);
}

export function updateAFPInvestigation<T>(
  id: string,
  payload: T,
): Promise<AFPLocalRecord<T>> {
  return requestAFP("PUT", `/${encodeURIComponent(id)}`, payload);
}

export function getAFPInvestigation<T>(id: string): Promise<AFPLocalRecord<T>> {
  return requestAFP<T>("GET", `/${encodeURIComponent(id)}`);
}

/** Key-order-independent comparison; does not change the JSON preview. */
export function stableAFPJson(value: unknown): string {
  const normalized = (input: unknown): unknown => {
    if (Array.isArray(input)) {
      return input.map(normalized);
    }

    if (isRecord(input)) {
      return Object.fromEntries(
        Object.keys(input)
          .sort()
          .map((key) => [key, normalized(input[key])]),
      );
    }

    return input;
  };

  return JSON.stringify(normalized(value));
}
