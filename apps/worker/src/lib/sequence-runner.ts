export interface SequenceStep {
  name: string;
  method: string;
  url: string; // Absolute URL or relative path (if relative, prepended with base URL)
  headers?: { key: string; value: string }[];
  body?: string;
  assertions?: {
    type: "status_code" | "body_contains" | "json_path";
    path?: string; // used for json_path
    value: string; // expected value
  }[];
  extractions?: {
    name: string;
    source: "body" | "header";
    path: string; // dot-path for body, header key for header
  }[];
}

/**
 * Traverses an object by a dot-path notation (e.g. "user.profile.id").
 */
function getValueByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Interpolates variables formatted as {{varName}} in a template string.
 */
function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{([^{}]+)\}\}/g, (_, key) => {
    const trimKey = key.trim();
    return variables[trimKey] !== undefined ? variables[trimKey] : `{{${key}}}`;
  });
}

/**
 * Helper to check if a string is a valid absolute URL.
 */
function isAbsoluteUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Executes a sequential series of HTTP/HTTPS requests at the edge.
 *
 * Simulates user flows by passing extracted state between requests. Aborts instantly on any step failure.
 */
export async function performSequenceCheck(
  monitor: { url: string; script: string | null; timeout?: number },
  _env?: any,
): Promise<{ status: "UP" | "DOWN"; latency: number; errorReason?: string }> {
  const steps: SequenceStep[] = JSON.parse(monitor.script || "[]");
  if (steps.length === 0) {
    return { status: "DOWN", latency: 0, errorReason: "NO_STEPS_DEFINED" };
  }

  const variables: Record<string, string> = {};
  let totalLatency = 0;
  const timeoutMs = (monitor.timeout || 15) * 1000;
  const controller = new AbortController();
  const globalTimeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step) continue;
      const stepNum = i + 1;
      const stepLabel = step.name || `Step ${stepNum}`;

      // 1. Resolve URL
      let stepUrl = interpolate(step.url, variables);
      if (!isAbsoluteUrl(stepUrl)) {
        // Prepend base monitor URL
        const base = monitor.url.endsWith("/") ? monitor.url.slice(0, -1) : monitor.url;
        const relative = stepUrl.startsWith("/") ? stepUrl : `/${stepUrl}`;
        stepUrl = `${base}${relative}`;
      }

      // 2. Resolve Headers
      const stepHeaders: Record<string, string> = {
        "User-Agent": "SteadyStack-SequenceMonitor/1.0",
        Accept: "*/*",
      };
      if (step.headers && Array.isArray(step.headers)) {
        for (const header of step.headers) {
          if (header.key) {
            stepHeaders[header.key] = interpolate(header.value, variables);
          }
        }
      }

      // 3. Resolve Request Body
      let stepBody: string | undefined = undefined;
      if (["POST", "PUT", "PATCH", "DELETE"].includes(step.method.toUpperCase()) && step.body) {
        stepBody = interpolate(step.body, variables);
      }

      // 4. Execute Step HTTP request
      const startStep = performance.now();
      let response: Response;
      try {
        response = await fetch(stepUrl, {
          method: step.method.toUpperCase(),
          headers: stepHeaders,
          body: stepBody ?? null,
          signal: controller.signal,
        });
      } catch (err: unknown) {
        const stepLatency = Math.round(performance.now() - startStep);
        totalLatency += stepLatency;
        const errName = err instanceof Error ? err.name : undefined;
        const errMessage = err instanceof Error ? err.message : "";
        const isTimeout = errName === "AbortError" || controller.signal.aborted;
        return {
          status: "DOWN",
          latency: totalLatency,
          errorReason: `${stepLabel} failed: ${isTimeout ? "TIMEOUT" : errMessage || "FETCH_FAILED"}`,
        };
      }

      const bodyText = await response.text();
      const stepLatency = Math.round(performance.now() - startStep);
      totalLatency += stepLatency;

      // 5. Assertions Validation
      const assertions = step.assertions || [];
      // Default assertion if none specified: Status Code 2xx/3xx (response.ok)
      if (assertions.length === 0) {
        if (!response.ok) {
          return {
            status: "DOWN",
            latency: totalLatency,
            errorReason: `${stepLabel} failed: HTTP_${response.status}`,
          };
        }
      } else {
        for (let aIdx = 0; aIdx < assertions.length; aIdx++) {
          const assertion = assertions[aIdx];
          if (!assertion) continue;
          const expectedValue = interpolate(assertion.value, variables);

          if (assertion.type === "status_code") {
            if (String(response.status) !== expectedValue) {
              return {
                status: "DOWN",
                latency: totalLatency,
                errorReason: `${stepLabel} assert status code failed: Expected ${expectedValue}, got ${response.status}`,
              };
            }
          } else if (assertion.type === "body_contains") {
            if (!bodyText.includes(expectedValue)) {
              return {
                status: "DOWN",
                latency: totalLatency,
                errorReason: `${stepLabel} assert body contains failed: Expected text not found`,
              };
            }
          } else if (assertion.type === "json_path") {
            if (!assertion.path) {
              return {
                status: "DOWN",
                latency: totalLatency,
                errorReason: `${stepLabel} assert json path failed: Path parameter missing`,
              };
            }
            try {
              const json = JSON.parse(bodyText);
              const actualValue = getValueByPath(json, assertion.path);
              if (String(actualValue) !== expectedValue) {
                return {
                  status: "DOWN",
                  latency: totalLatency,
                  errorReason: `${stepLabel} assert json path "${assertion.path}" failed: Expected ${expectedValue}, got ${actualValue}`,
                };
              }
            } catch {
              return {
                status: "DOWN",
                latency: totalLatency,
                errorReason: `${stepLabel} assert json path failed: Response is not valid JSON`,
              };
            }
          }
        }
      }

      // 6. Data Extraction
      const extractions = step.extractions || [];
      for (const extraction of extractions) {
        if (!extraction.name || !extraction.path) continue;

        if (extraction.source === "body") {
          try {
            const json = JSON.parse(bodyText);
            const value = getValueByPath(json, extraction.path);
            if (value !== undefined) {
              variables[extraction.name] = String(value);
            }
          } catch {
            console.error(
              `[SequenceRunner] Extraction failed for variable ${extraction.name}: response is not valid JSON`,
            );
          }
        } else if (extraction.source === "header") {
          const value = response.headers.get(extraction.path.toLowerCase());
          if (value !== null) {
            variables[extraction.name] = value;
          }
        }
      }
    }

    return { status: "UP", latency: totalLatency };
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : "";
    return {
      status: "DOWN",
      latency: totalLatency,
      errorReason: errMessage ? errMessage.substring(0, 100) : "SEQUENCE_CHECK_FAILED",
    };
  } finally {
    clearTimeout(globalTimeout);
  }
}
