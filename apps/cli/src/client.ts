import chalk from "chalk";
import { getApiKey, getBaseUrl } from "./config.js";
import { t } from "./i18n.js";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const apiKey = getApiKey();
  const baseUrl = getBaseUrl();

  if (!apiKey) {
    console.error(
      chalk.red(t("client.notLoggedIn") + " ") +
        chalk.bold("pulse auth login --key <API_KEY>") +
        chalk.dim(" " + t("client.orExport")),
    );
    process.exit(1);
  }

  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "steadystack-cli/0.1.0",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      msg = data.error || msg;
    } catch (_) {}
    throw new ApiError(res.status, msg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  /** Long-lived GET for the wait endpoint */
  waitGet: async (path: string, timeout: number) => {
    const apiKey = getApiKey()!;
    const baseUrl = getBaseUrl();
    return fetch(`${baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "steadystack-cli/0.1.0",
      },
      signal: AbortSignal.timeout((timeout + 30) * 1000),
    });
  },
};
