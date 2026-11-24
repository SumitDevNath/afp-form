/** Local-only ORI API; independent of the AFP investigation API. */

import { AFPApiError } from "./afpApi";

export interface ORILocalRecord<T> {
  id: string;
  createdAt: string;
  updatedAt: string;
  persistenceScope: "local_ori";
  data: T;
}

const ORI_API_PATH = "/api/v1/ori/records";
const TIMEOUT_MS = 15_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractFieldErrors(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};

  const result: Record<string, string> = {};

  for (const [field, message] of Object.entries(value)) {
    if (/^[A-Za-z0-9_.-]{1,300}$/.test(field) && typeof message === "string") {
      result[field] = message;
    }
  }

  return result;
}

async function requestORI<T>(
  method: "POST" | "PUT" | "GET",
  suffix: string,
  payload?: T,
): Promise<ORILocalRecord<T>> {
  const controller = new AbortController();

  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response: Response;

    try {
      response = await fetch(`${ORI_API_PATH}${suffix}`, {
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
          "The ORI request timed out. The record may already " +
            "have been saved; check PostgreSQL before retrying POST.",
        );
      }

      throw new AFPApiError(
        "Cannot contact the local ORI backend. " +
          "Check FastAPI and the Vite /api proxy.",
      );
    }

    const body: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const fieldErrors = isRecord(body) ? extractFieldErrors(body.errors) : {};

      const message =
        isRecord(body) && typeof body.message === "string"
          ? body.message
          : response.status === 422
            ? "The ORI backend rejected one or more fields."
            : `ORI API request failed (HTTP ${response.status}).`;

      throw new AFPApiError(message, response.status, fieldErrors);
    }

    if (
      !isRecord(body) ||
      typeof body.id !== "string" ||
      body.persistenceScope !== "local_ori" ||
      !isRecord(body.data)
    ) {
      throw new AFPApiError(
        "Unexpected ORI API response; " +
          "check the local ORI backend contract.",
      );
    }

    return body as unknown as ORILocalRecord<T>;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function createORIRecord<T>(payload: T): Promise<ORILocalRecord<T>> {
  return requestORI("POST", "", payload);
}

export function updateORIRecord<T>(
  id: string,
  payload: T,
): Promise<ORILocalRecord<T>> {
  return requestORI("PUT", `/${encodeURIComponent(id)}`, payload);
}

export function getORIRecord<T>(id: string): Promise<ORILocalRecord<T>> {
  return requestORI<T>("GET", `/${encodeURIComponent(id)}`);
}
