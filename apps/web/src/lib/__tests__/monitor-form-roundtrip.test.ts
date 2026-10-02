import { describe, test, expect } from "bun:test";
import { validateBodySize } from "@/lib/payload-parser";
import { resolveClientCertWrite, resolveProtocolHeadersWrite } from "@/actions/monitors";

/**
 * Regression tests for the body-size/mTLS correctness audit and the
 * credential-lifecycle fixes:
 * 1. The monitor form must serialize size thresholds as real numbers —
 *    validateBodySize rejects string values, so string serialization made
 *    UI-set thresholds dead.
 * 2. The update action's cert write must be keep-on-empty: absent/empty
 *    cert fields leave the stored certificate untouched.
 * 3. Protocol credentials (SMTP/FTP/MAIL) follow the same contract and are
 *    always stored encrypted; edits never post the stored secret back.
 */

describe("body size threshold serialization (form path)", () => {
  // Mirrors the hidden expectation input in monitor-form.tsx: number inputs
  // give strings; the form must convert before serializing.
  const serializeExpectation = (maxRaw: string, minRaw: string) =>
    JSON.stringify({
      max_body_size_bytes: maxRaw ? Number(maxRaw) : undefined,
      min_body_size_bytes: minRaw ? Number(minRaw) : undefined,
    });

  test("number inputs produce numeric thresholds, not strings", () => {
    const parsed = JSON.parse(serializeExpectation("1048576", "100"));
    expect(parsed.max_body_size_bytes).toBe(1048576);
    expect(typeof parsed.max_body_size_bytes).toBe("number");
    expect(parsed.min_body_size_bytes).toBe(100);
    expect(typeof parsed.min_body_size_bytes).toBe("number");
  });

  test("numeric thresholds are enforced by validateBodySize", () => {
    const expectations = serializeExpectation("1024", "");
    expect(validateBodySize(2048, expectations).success).toBe(false);
    expect(validateBodySize(512, expectations).success).toBe(true);
  });

  test("string thresholds are rejected by validateBodySize (the old dead behavior)", () => {
    // Guards the regression: if the form ever reverts to serializing raw
    // strings, this documents that the validator ignores them.
    const stringThresholds = JSON.stringify({ max_body_size_bytes: "1024" });
    expect(validateBodySize(999999, stringThresholds).success).toBe(true);
  });

  test("empty inputs serialize as undefined (no threshold)", () => {
    const parsed = JSON.parse(serializeExpectation("", ""));
    expect(parsed.max_body_size_bytes).toBeUndefined();
    expect(parsed.min_body_size_bytes).toBeUndefined();
    expect(validateBodySize(10_000_000, serializeExpectation("", "")).success).toBe(true);
  });
});

describe("resolveClientCertWrite (keep-on-empty update contract)", () => {
  test("absent fields keep the stored certificate (undefined write)", async () => {
    const result = await resolveClientCertWrite({});
    expect(result).toBeUndefined();
  });

  test("empty-string fields keep the stored certificate", async () => {
    // The form used to always post empty hidden inputs — this must not wipe.
    const result = await resolveClientCertWrite({ clientCertPem: "", clientKeyPem: "" });
    expect(result).toBeUndefined();
  });

  test("cert+key posted together replace the stored certificate", async () => {
    const result = await resolveClientCertWrite({
      clientCertPem: "-----BEGIN CERTIFICATE-----\nCERT\n-----END CERTIFICATE-----",
      clientKeyPem: "-----BEGIN PRIVATE KEY-----\nKEY\n-----END PRIVATE KEY-----",
    });
    expect(typeof result).toBe("string");
    expect(result!.startsWith("enc:v1:")).toBe(true);
    // The encrypted bundle decrypts back to the cert+key JSON
    const { decryptSecret } = await import("@steadystack/core");
    const raw = await decryptSecret(result!);
    const parsed = JSON.parse(raw);
    expect(parsed.cert).toContain("BEGIN CERTIFICATE");
    expect(parsed.key).toContain("BEGIN PRIVATE KEY");
  });

  test("removal flag deletes the stored certificate", async () => {
    const result = await resolveClientCertWrite({ removeClientCert: "1" });
    expect(result).toBeNull();
  });

  test("removal flag posts empty string when unchecked (checkbox contract, still removes)", async () => {
    // The form's hidden removeClientCert input posts "" when unchecked; only
    // "1" means remove. Empty alone must NOT delete.
    const result = await resolveClientCertWrite({ removeClientCert: "" });
    expect(result).toBeUndefined();
  });

  test("removal flag wins over empty cert fields", async () => {
    const result = await resolveClientCertWrite({
      clientCertPem: "",
      clientKeyPem: "",
      removeClientCert: "1",
    });
    expect(result).toBeNull();
  });

  test("partial cert (key only) keeps the stored certificate", async () => {
    const result = await resolveClientCertWrite({ clientKeyPem: "only-key" });
    expect(result).toBeUndefined();
  });

  test("cert+key posted together with removal flag replaces (replace wins)", async () => {
    const result = await resolveClientCertWrite({
      clientCertPem: "-----BEGIN CERTIFICATE-----\nNEW\n-----END CERTIFICATE-----",
      clientKeyPem: "-----BEGIN PRIVATE KEY-----\nNEW\n-----END PRIVATE KEY-----",
      removeClientCert: "1",
    });
    expect(typeof result).toBe("string");
    expect(result!.startsWith("enc:v1:")).toBe(true);
  });

  test("only cert posted (key empty) with removal flag still removes", async () => {
    const result = await resolveClientCertWrite({
      clientCertPem: "cert-only",
      removeClientCert: "1",
    });
    expect(result).toBeNull();
  });
});

describe("resolveProtocolHeadersWrite (keep-on-empty credentials contract)", () => {
  test("absent headers field keeps the stored credentials (undefined write)", async () => {
    const result = await resolveProtocolHeadersWrite({});
    expect(result).toBeUndefined();
  });

  test("empty headers field keeps the stored credentials", async () => {
    const result = await resolveProtocolHeadersWrite({ headers: "" });
    expect(result).toBeUndefined();
  });

  test("plaintext credentials are encrypted", async () => {
    const result = await resolveProtocolHeadersWrite({
      headers: JSON.stringify({ username: "user@example.com", password: "hunter2" }),
    });
    expect(typeof result).toBe("string");
    expect(result!.startsWith("enc:v1:")).toBe(true);
    // Round-trips back to the posted credentials
    const { decryptSecret } = await import("@steadystack/core");
    const parsed = JSON.parse(await decryptSecret(result!));
    expect(parsed.username).toBe("user@example.com");
    expect(parsed.password).toBe("hunter2");
  });

  test("username-only credentials are encrypted (password optional, keeps stored)", async () => {
    const result = await resolveProtocolHeadersWrite({
      headers: JSON.stringify({ username: "user@example.com" }),
    });
    expect(result!.startsWith("enc:v1:")).toBe(true);
    const { decryptSecret } = await import("@steadystack/core");
    const parsed = JSON.parse(await decryptSecret(result!));
    expect(parsed.username).toBe("user@example.com");
    expect(parsed.password).toBeUndefined();
  });

  test("posted username with blank password keeps the stored password (merge)", async () => {
    const { encryptSecret, decryptSecret } = await import("@steadystack/core");
    const stored = await encryptSecret(JSON.stringify({ username: "old@x.com", password: "hunter2" }));
    const result = await resolveProtocolHeadersWrite(
      { headers: JSON.stringify({ username: "new@x.com" }) },
      stored,
    );
    expect(result!.startsWith("enc:v1:")).toBe(true);
    const parsed = JSON.parse(await decryptSecret(result!));
    expect(parsed.username).toBe("new@x.com");
    expect(parsed.password).toBe("hunter2");
  });

  test("posted username+password replaces the stored password entirely", async () => {
    const { encryptSecret, decryptSecret } = await import("@steadystack/core");
    const stored = await encryptSecret(JSON.stringify({ username: "old@x.com", password: "old" }));
    const result = await resolveProtocolHeadersWrite(
      { headers: JSON.stringify({ username: "new@x.com", password: "new" }) },
      stored,
    );
    const parsed = JSON.parse(await decryptSecret(result!));
    expect(parsed).toEqual({ username: "new@x.com", password: "new" });
  });

  test("blank-password merge falls back cleanly when the stored value is unreadable", async () => {
    const { decryptSecret } = await import("@steadystack/core");
    const result = await resolveProtocolHeadersWrite(
      { headers: JSON.stringify({ username: "u" }) },
      "enc:v1:garbage-not-valid-base64!!",
    );
    expect(result!.startsWith("enc:v1:")).toBe(true);
    const parsed = JSON.parse(await decryptSecret(result!));
    expect(parsed.username).toBe("u");
    expect(parsed.password).toBeUndefined();
  });

  test("no stored value + blank password posts credentials as-is (create shape)", async () => {
    const { decryptSecret } = await import("@steadystack/core");
    const result = await resolveProtocolHeadersWrite({
      headers: JSON.stringify({ username: "u" }),
    });
    const parsed = JSON.parse(await decryptSecret(result!));
    expect(parsed).toEqual({ username: "u" });
  });

  test("already-encrypted envelope passes through without double-encrypting", async () => {
    const { encryptSecret, decryptSecret } = await import("@steadystack/core");
    const envelope = await encryptSecret(JSON.stringify({ username: "u", password: "p" }));
    const result = await resolveProtocolHeadersWrite({ headers: envelope });
    expect(result).toBe(envelope); // identical string — no double encryption
    const parsed = JSON.parse(await decryptSecret(result!));
    expect(parsed).toEqual({ username: "u", password: "p" });
  });

  test("HTTP custom headers (array JSON) are encrypted too, unchanged semantics", async () => {
    const result = await resolveProtocolHeadersWrite({
      headers: JSON.stringify([{ key: "Authorization", value: "Bearer t" }]),
    });
    expect(result!.startsWith("enc:v1:")).toBe(true);
  });

  test("removal flag clears the stored credentials", async () => {
    const result = await resolveProtocolHeadersWrite({ removeProtocolCredentials: "1" });
    expect(result).toBeNull();
  });

  test("unchecked removal flag posts empty string and keeps the stored credentials", async () => {
    const result = await resolveProtocolHeadersWrite({ removeProtocolCredentials: "" });
    expect(result).toBeUndefined();
  });

  test("simultaneously posted credentials win over the removal flag (cert contract parity)", async () => {
    // Mirrors resolveClientCertWrite: an explicit replacement beats the
    // removal checkbox when both are posted together.
    const result = await resolveProtocolHeadersWrite({
      headers: JSON.stringify({ username: "u" }),
      removeProtocolCredentials: "1",
    });
    expect(result).not.toBeNull();
    expect(result!.startsWith("enc:v1:")).toBe(true);
  });
});

describe("probe protocol envelope handling (apps/probe SMTP/FTP/MAIL path)", () => {
  // Mirrors the probe's decrypt-then-parse: the envelope must decrypt BEFORE
  // JSON.parse — parsing the encrypted string directly throws (the old bug).
  const probeStyleParse = async (stored: string) => {
    const { decryptSecret } = await import("@steadystack/core");
    const raw = await decryptSecret(stored);
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && !Array.isArray(parsed) ? parsed : {};
  };

  test("encrypted envelope decrypts to usable credentials", async () => {
    const { encryptSecret } = await import("@steadystack/core");
    const stored = await encryptSecret(JSON.stringify({ username: "u", password: "p" }));
    const creds = await probeStyleParse(stored);
    expect(creds).toEqual({ username: "u", password: "p" });
  });

  test("parsing the envelope directly throws (documents the old probe bug)", async () => {
    const { encryptSecret } = await import("@steadystack/core");
    const stored = await encryptSecret(JSON.stringify({ username: "u" }));
    expect(() => JSON.parse(stored)).toThrow();
  });

  test("legacy plaintext credentials parse unchanged (decryptSecret passthrough)", async () => {
    const creds = await probeStyleParse(JSON.stringify({ username: "legacy" }));
    expect(creds).toEqual({ username: "legacy" });
  });

  test("HTTP header arrays fall back to empty config (no username/password)", async () => {
    const { encryptSecret } = await import("@steadystack/core");
    const stored = await encryptSecret(JSON.stringify([{ key: "X", value: "y" }]));
    const creds = await probeStyleParse(stored);
    expect(creds).toEqual({});
  });
});
