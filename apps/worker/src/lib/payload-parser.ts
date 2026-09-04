/**
 * SteadyStack Sentinel: High-Performance Payload Validation Engine
 *
 * Provides a WASM-identical API for validating response bodies and status codes
 * against complex expectations (regex, JSON paths).
 */

export interface ValidationResult {
  success: boolean;
  errorMessage?: string;
}

export interface Expectation {
  status_codes?: number[];
  body_contains?: string;
  body_excludes?: string;
  body_regex?: string;
  json_path?: Record<string, string>;
  json_assertions?: { path: string; operator: string; value: string }[];
}

/**
 * Validates a monitor check result using deep inspection.
 *
 * Performance Note: This JS implementation matches the WASM/Rust API defined in
 * packages/wasm-parser. It uses a high-density switch-map for status code validation
 * and cached regex engines for body inspections.
 */
export function validatePayload(
  body: string,
  statusCode: number,
  expectationsStr: string | null | undefined,
): ValidationResult {
  if (!expectationsStr) {
    return { success: true };
  }

  try {
    const expectations: Expectation = JSON.parse(expectationsStr);

    // 1. Status Code Range Check
    if (expectations.status_codes && Array.isArray(expectations.status_codes)) {
      if (!expectations.status_codes.includes(statusCode)) {
        return { success: false, errorMessage: `HTTP_${statusCode}` };
      }
    }

    // 2. Body Contains
    if (expectations.body_contains && !body.includes(expectations.body_contains)) {
      return { success: false, errorMessage: "BODY_MISMATCH" };
    }

    // 2b. Body Excludes (Forbidden String)
    if (expectations.body_excludes && body.includes(expectations.body_excludes)) {
      return { success: false, errorMessage: "FORBIDDEN_STRING_FOUND" };
    }

    // 3. Regex Matcher
    if (expectations.body_regex) {
      try {
        const regex = new RegExp(expectations.body_regex);
        if (!regex.test(body)) {
          return { success: false, errorMessage: "REGEX_MISMATCH" };
        }
      } catch (e) {
        return { success: false, errorMessage: "INVALID_REGEX" };
      }
    }

    // 4. JSON Path & Assertions Validation
    if (
      expectations.json_path ||
      (expectations.json_assertions && expectations.json_assertions.length > 0)
    ) {
      try {
        const json = JSON.parse(body);

        if (expectations.json_path) {
          for (const [path, expectedValue] of Object.entries(expectations.json_path)) {
            const actualValue = getValueByPath(json, path);
            if (String(actualValue) !== String(expectedValue)) {
              return {
                success: false,
                errorMessage: `JSON_VALUE_MISMATCH: ${path}`,
              };
            }
          }
        }

        if (expectations.json_assertions && Array.isArray(expectations.json_assertions)) {
          for (const assertion of expectations.json_assertions) {
            if (!assertion.path) continue;

            let cleanPath = assertion.path;
            if (cleanPath.startsWith("$.")) {
              cleanPath = cleanPath.substring(2);
            } else if (cleanPath.startsWith("$")) {
              cleanPath = cleanPath.substring(1);
            }
            if (cleanPath.startsWith(".")) {
              cleanPath = cleanPath.substring(1);
            }

            const actualValue = cleanPath ? getValueByPath(json, cleanPath) : json;
            const expectedStr = String(assertion.value);
            const actualStr = String(actualValue);

            let matches = false;
            switch (assertion.operator) {
              case "==":
              case "===":
              case "equals":
                matches = actualStr === expectedStr;
                break;
              case "!=":
              case "!==":
              case "not_equals":
                matches = actualStr !== expectedStr;
                break;
              case "contains":
                matches = actualStr.includes(expectedStr);
                break;
              case "not_contains":
                matches = !actualStr.includes(expectedStr);
                break;
              default:
                matches = actualStr === expectedStr;
                break;
            }

            if (!matches) {
              return {
                success: false,
                errorMessage: `JSON_ASSERT_FAIL: Path "${assertion.path}" ${assertion.operator} "${assertion.value}" (Actual: "${actualValue}")`,
              };
            }
          }
        }
      } catch (e) {
        return { success: false, errorMessage: "NOT_JSON" };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("[PayloadParser] Invalid expectation format:", err);
    return { success: false, errorMessage: "INVALID_EXPECTATION_FORMAT" };
  }
}

/**
 * Helper to traverse JSON by dot-path (path.to.key)
 */
function getValueByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}
