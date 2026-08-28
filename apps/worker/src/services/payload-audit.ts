import { RE2JS } from "re2js";

export async function auditPayload(targetUrl: string, pattern: string) {
  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "SteadyStack-Payload-Scanner/1.0",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const body = await response.text();
    const truncatedBody =
      body.length > 200000
        ? body.substring(0, 200000) + "\n\n...[TRUNCATED BY STEADYSTACK SENTINEL]..."
        : body;

    let matches: { index: number; length: number }[] = [];
    let success = false;
    let errorMessage: string | undefined = undefined;

    if (pattern) {
      try {
        const regex = RE2JS.compile(pattern, RE2JS.CASE_INSENSITIVE | RE2JS.MULTILINE);
        const matcher = regex.matcher(truncatedBody);
        while (matcher.find()) {
          const index = matcher.start();
          const length = matcher.end() - index;
          matches.push({
            index,
            length,
          });
          // Limit total matches for performance
          if (matches.length > 500) break;
        }
        success = matches.length > 0;
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        errorMessage = `INVALID_REGEX: ${error.message}`;
      }
    }

    return {
      url: targetUrl,
      status: response.status,
      byteSize: body.length,
      payload: truncatedBody,
      matches,
      matchCount: matches.length,
      success,
      errorMessage,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    throw new Error(`Failed to extract payload: ${err.message}`);
  }
}
