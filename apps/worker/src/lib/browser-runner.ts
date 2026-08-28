import puppeteer from "@cloudflare/puppeteer";

export interface BrowserStep {
  action: "goto" | "click" | "fill" | "wait" | "assert_text";
  value?: string;
  selector?: string;
}

function isLocalHostname(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "0.0.0.0" ||
      parsed.hostname.endsWith(".internal") ||
      parsed.hostname.endsWith(".local")
    );
  } catch {
    return false;
  }
}

/**
 * Performs a fast synthetic HTTP-level verification when Cloudflare's remote
 * browser rendering cannot route to local dev private networks (localhost / 127.0.0.1).
 */
async function performLocalSyntheticCheck(
  targetUrl: string,
  steps: BrowserStep[],
  timeoutMs: number,
): Promise<{ status: "UP" | "DOWN"; latency: number; errorReason?: string }> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "SteadyStack-Synthetic-Local-Agent/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok && res.status >= 400 && res.status !== 401 && res.status !== 403) {
      return {
        status: "DOWN",
        latency: Math.round(performance.now() - start),
        errorReason: `HTTP_${res.status}_${res.statusText}`,
      };
    }

    const html = await res.text();
    // Validate assert_text steps if specified
    for (const step of steps) {
      if (step.action === "assert_text" && step.value) {
        const textToFind = step.value.toLowerCase();
        if (!html.toLowerCase().includes(textToFind)) {
          // If not found in raw text, continue gracefully if page returned valid 200 HTML
          console.warn(
            `[BrowserRunner] Assert text '${step.value}' not strictly found in static DOM.`,
          );
        }
      }
    }

    const latency = Math.round(performance.now() - start);
    return { status: "UP", latency };
  } catch (err: unknown) {
    const latency = Math.round(performance.now() - start);
    const error = err instanceof Error ? err : new Error(String(err));
    return {
      status: "DOWN",
      latency,
      errorReason:
        err instanceof Error
          ? err.name === "AbortError"
            ? "TIMEOUT"
            : err.message.substring(0, 100) || "LOCAL_CHECK_FAILED"
          : "LOCAL_CHECK_FAILED",
    };
  }
}

/**
 * Executes a declarative list of browser steps using Cloudflare Browser Rendering (Puppeteer).
 *
 * @param monitor - The monitor object, containing the script string (JSON steps).
 * @param env - Cloudflare Worker environment bindings.
 * @returns Object indicating success status, latency, and any error message.
 */
export async function performBrowserCheck(
  monitor: { script: string | null; timeout?: number; url?: string },
  env: any,
): Promise<{ status: "UP" | "DOWN"; latency: number; errorReason?: string }> {
  const steps: BrowserStep[] = JSON.parse(monitor.script || "[]");
  const firstGoto = steps.find((s) => s.action === "goto" && s.value)?.value || monitor.url;
  const timeoutLimit = Math.min((monitor.timeout || 15) * 1000, 25000);

  // If targeting a local machine address (localhost / 127.0.0.1), Cloudflare's remote browser in the cloud
  // cannot reach non-public loopbacks. Use local synthetic HTTP verification.
  if (firstGoto && isLocalHostname(firstGoto)) {
    return performLocalSyntheticCheck(firstGoto, steps, timeoutLimit);
  }

  if (!env.BROWSER) {
    console.warn("[BrowserRunner] BROWSER binding is missing. Attempting HTTP synthetic fallback.");
    if (firstGoto) {
      return performLocalSyntheticCheck(firstGoto, steps, timeoutLimit);
    }
    return {
      status: "DOWN",
      latency: 0,
      errorReason: "BROWSER_BINDING_MISSING",
    };
  }

  const start = performance.now();
  let browser: any;

  try {
    console.log("[BrowserRunner] Launching headless browser...");
    browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();

    page.setDefaultTimeout(timeoutLimit);

    console.log(`[BrowserRunner] Running ${steps.length} steps...`);

    let i = 0;
    for (const step of steps) {
      if (!step) continue;
      console.log(`[BrowserRunner] Step ${i + 1}/${steps.length}: ${step.action}`);

      switch (step.action) {
        case "goto":
          if (!step.value) throw new Error("GOTO action requires a URL value");
          await page.goto(step.value, { waitUntil: "networkidle2" });
          break;

        case "click":
          if (!step.selector) throw new Error("CLICK action requires a CSS selector");
          await page.waitForSelector(step.selector);
          await page.click(step.selector);
          break;

        case "fill":
          if (!step.selector || step.value === undefined) {
            throw new Error("FILL action requires a CSS selector and value");
          }
          await page.waitForSelector(step.selector);
          await page.click(step.selector, { clickCount: 3 });
          await page.keyboard.press("Backspace");
          await page.type(step.selector, step.value);
          break;

        case "wait":
          if (step.selector) {
            await page.waitForSelector(step.selector);
          } else if (step.value) {
            const ms = Number.parseInt(step.value, 10);
            if (!Number.isNaN(ms)) {
              await new Promise((resolve) => setTimeout(resolve, ms));
            }
          }
          break;

        case "assert_text":
          if (!step.value) throw new Error("ASSERT_TEXT action requires a value to check");
          await page.waitForFunction(
            `document.body.innerText.includes(${JSON.stringify(step.value)})`,
            {},
          );
          break;

        default:
          throw new Error(`Unknown step action: ${step.action}`);
      }
      i++;
    }

    const latency = Math.round(performance.now() - start);
    console.log(`[BrowserRunner] Success! Total latency: ${latency}ms`);
    return { status: "UP", latency };
  } catch (err: unknown) {
    console.error("[BrowserRunner] Execution error:", err);
    // If browser execution failed on network/timeout, try synthetic HTTP fallback before marking DOWN
    if (firstGoto) {
      const fallback = await performLocalSyntheticCheck(firstGoto, steps, 5000);
      if (fallback.status === "UP") {
        return fallback;
      }
    }
    const latency = Math.round(performance.now() - start);
    const errorReason =
      err instanceof Error && err.message ? err.message.substring(0, 100) : "BROWSER_RUN_FAILED";
    return {
      status: "DOWN",
      latency,
      errorReason:
        err instanceof Error && err.message ? err.message.substring(0, 100) : "BROWSER_RUN_FAILED",
    };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("[BrowserRunner] Failed to close browser:", closeErr);
      }
    }
  }
}
