import { describe, test, expect } from "bun:test";
import { isPrivateOrInternalUrl, isPrivateOrInternalIp, checkHttpUniversal } from "../index";

describe("Probe Layer SSRF Security & Resource Abuse Protection Tests", () => {
  describe("IP & Hostname Validation (isPrivateOrInternalUrl / isPrivateOrInternalIp)", () => {
    test("blocks IPv4 loopback (127.0.0.1, 127.0.0.2)", () => {
      expect(isPrivateOrInternalUrl("http://127.0.0.1").isForbidden).toBe(true);
      expect(isPrivateOrInternalUrl("http://127.0.0.2").isForbidden).toBe(true);
    });

    test("blocks private IPv4 CIDR ranges (10.0.0.1, 172.16.0.1, 192.168.1.1)", () => {
      expect(isPrivateOrInternalUrl("http://10.0.0.1").isForbidden).toBe(true);
      expect(isPrivateOrInternalUrl("http://172.16.0.1").isForbidden).toBe(true);
      expect(isPrivateOrInternalUrl("http://172.31.255.255").isForbidden).toBe(true);
      expect(isPrivateOrInternalUrl("http://192.168.1.1").isForbidden).toBe(true);
    });

    test("blocks link-local & AWS IMDS cloud metadata (169.254.169.254)", () => {
      expect(isPrivateOrInternalUrl("http://169.254.169.254").isForbidden).toBe(true);
      expect(isPrivateOrInternalUrl("http://169.254.1.1").isForbidden).toBe(true);
    });

    test("blocks IPv6 loopback & link-local (::1, fe80::1, fc00::1)", () => {
      expect(isPrivateOrInternalIp("::1").isForbidden).toBe(true);
      expect(isPrivateOrInternalIp("[::1]").isForbidden).toBe(true);
      expect(isPrivateOrInternalIp("fe80::1").isForbidden).toBe(true);
      expect(isPrivateOrInternalIp("fd00::1").isForbidden).toBe(true);
    });

    test("blocks IPv4-mapped IPv6 (::ffff:127.0.0.1, ::ffff:10.0.0.1)", () => {
      expect(isPrivateOrInternalIp("::ffff:127.0.0.1").isForbidden).toBe(true);
      expect(isPrivateOrInternalIp("::ffff:10.0.0.1").isForbidden).toBe(true);
    });

    test("blocks Dword / Decimal integer IP encodings (2130706433 for 127.0.0.1)", () => {
      expect(isPrivateOrInternalIp("2130706433").isForbidden).toBe(true);
    });

    test("blocks embedded private IPs in wildcard DNS hostnames (e.g. nip.io, sslip.io)", () => {
      expect(isPrivateOrInternalUrl("http://127.0.0.1.nip.io").isForbidden).toBe(true);
      expect(isPrivateOrInternalUrl("http://169.254.169.254.nip.io").isForbidden).toBe(true);
      expect(isPrivateOrInternalUrl("http://10-0-0-1.sslip.io").isForbidden).toBe(true);
      expect(isPrivateOrInternalUrl("http://192.168.1.5.nip.io/admin").isForbidden).toBe(true);
    });

    test("allows legitimate public domains and IPs", () => {
      expect(isPrivateOrInternalUrl("https://example.com").isForbidden).toBe(false);
      expect(isPrivateOrInternalUrl("https://8.8.8.8").isForbidden).toBe(false);
      expect(isPrivateOrInternalUrl("https://1.1.1.1").isForbidden).toBe(false);
    });
  });

  describe("HTTP Check Hop & Stream Boundary Protection (checkHttpUniversal)", () => {
    test("rejects direct SSRF target with status DOWN", async () => {
      const res = await checkHttpUniversal("http://169.254.169.254/latest/meta-data/");
      expect(res.status).toBe("DOWN");
      expect(res.errorReason).toContain("SSRF_PROTECTION");
    });

    test("enforces timeout signal limit", async () => {
      const res = await checkHttpUniversal("https://httpbin.org/delay/10", {
        timeoutSeconds: 1,
      });
      expect(res.status).toBe("DEGRADED");
    });
  });
});
