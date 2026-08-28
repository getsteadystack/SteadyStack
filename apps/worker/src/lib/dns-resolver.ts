interface DoHAnswer {
  type: number;
  data: string;
  [key: string]: unknown;
}

interface DoHResponse {
  Status: number;
  Answer?: DoHAnswer[];
  [key: string]: unknown;
}

function isDoHResponse(data: unknown): data is DoHResponse {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.Status !== "number") {
    return false;
  }

  if (obj.Answer !== undefined) {
    if (!Array.isArray(obj.Answer)) {
      return false;
    }
    for (const item of obj.Answer) {
      if (typeof item !== "object" || item === null) {
        return false;
      }
      const answerObj = item as Record<string, unknown>;
      if (typeof answerObj.type !== "number" || typeof answerObj.data !== "string") {
        return false;
      }
    }
  }

  return true;
}

/**
 * Performs a DNS-over-HTTPS (DoH) lookup for a given hostname using Cloudflare's public resolver.
 */
export async function resolveDNS(hostname: string): Promise<string | null> {
  try {
    // We strictly look for 'A' records (IPv4)
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
    const response = await fetch(url, {
      headers: { accept: "application/dns-json" },
    });

    if (!response.ok) return null;

    const data: unknown = await response.json();

    if (!isDoHResponse(data)) {
      return null;
    }

    // Status 0 means NOERROR
    if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
      // Find the first A record (Type 1)
      const aRecord = data.Answer.find((a) => a.type === 1);
      return aRecord ? aRecord.data : null;
    }
    return null;
  } catch (err) {
    console.error(`[DNS] Failed to resolve ${hostname}:`, err);
    return null;
  }
}
