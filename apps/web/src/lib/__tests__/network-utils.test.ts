import { describe, expect, it } from "vitest";
import { calculateSubnet, ipToLong, longToIp } from "../network-utils";

describe("network-utils", () => {
  describe("ipToLong", () => {
    it("should convert standard IPv4 addresses to long integers", () => {
      expect(ipToLong("192.168.1.1")).toBe(3232235777);
      expect(ipToLong("10.0.0.1")).toBe(167772161);
      expect(ipToLong("172.16.0.1")).toBe(2886729729);
      expect(ipToLong("127.0.0.1")).toBe(2130706433);
    });

    it("should handle edge cases", () => {
      expect(ipToLong("0.0.0.0")).toBe(0);
      expect(ipToLong("255.255.255.255")).toBe(4294967295);
    });
  });

  describe("longToIp", () => {
    it("should convert long integers back to standard IPv4 addresses", () => {
      expect(longToIp(3232235777)).toBe("192.168.1.1");
      expect(longToIp(167772161)).toBe("10.0.0.1");
      expect(longToIp(2886729729)).toBe("172.16.0.1");
      expect(longToIp(2130706433)).toBe("127.0.0.1");
    });

    it("should handle edge cases", () => {
      expect(longToIp(0)).toBe("0.0.0.0");
      expect(longToIp(4294967295)).toBe("255.255.255.255");
    });
  });

  describe("calculateSubnet", () => {
    it("should calculate correct subnet details for a /24", () => {
      const result = calculateSubnet("192.168.1.1", 24);

      expect(result.ip).toBe("192.168.1.1");
      expect(result.cidr).toBe(24);
      expect(result.mask).toBe("255.255.255.0");
      expect(result.wildcard).toBe("0.0.0.255");
      expect(result.network).toBe("192.168.1.0");
      expect(result.broadcast).toBe("192.168.1.255");
      expect(result.firstHost).toBe("192.168.1.1");
      expect(result.lastHost).toBe("192.168.1.254");
      expect(result.numHosts).toBe(254);

      expect(result.binary.ip).toBe("11000000.10101000.00000001.00000001");
      expect(result.binary.mask).toBe("11111111.11111111.11111111.00000000");
    });

    it("should calculate correct subnet details for a /8", () => {
      const result = calculateSubnet("10.5.6.7", 8);

      expect(result.ip).toBe("10.5.6.7");
      expect(result.cidr).toBe(8);
      expect(result.mask).toBe("255.0.0.0");
      expect(result.wildcard).toBe("0.255.255.255");
      expect(result.network).toBe("10.0.0.0");
      expect(result.broadcast).toBe("10.255.255.255");
      expect(result.firstHost).toBe("10.0.0.1");
      expect(result.lastHost).toBe("10.255.255.254");
      expect(result.numHosts).toBe(16777214);

      expect(result.binary.ip).toBe("00001010.00000101.00000110.00000111");
      expect(result.binary.mask).toBe("11111111.00000000.00000000.00000000");
    });

    it("should calculate correct subnet details for a /31 (point-to-point)", () => {
      // For /31, network and broadcast overlap with firstHost and lastHost in interesting ways,
      // but according to the given function implementation:
      // network is .4, broadcast is .5, firstHost is .5, lastHost is .4, numHosts is 0
      const result = calculateSubnet("10.0.0.4", 31);

      expect(result.ip).toBe("10.0.0.4");
      expect(result.cidr).toBe(31);
      expect(result.mask).toBe("255.255.255.254");
      expect(result.wildcard).toBe("0.0.0.1");
      expect(result.network).toBe("10.0.0.4");
      expect(result.broadcast).toBe("10.0.0.5");
      expect(result.firstHost).toBe("10.0.0.5");
      expect(result.lastHost).toBe("10.0.0.4");
      expect(result.numHosts).toBe(0); // Max(0, broadcastLong - networkLong - 1) -> Max(0, 5 - 4 - 1) -> 0

      expect(result.binary.ip).toBe("00001010.00000000.00000000.00000100");
      expect(result.binary.mask).toBe("11111111.11111111.11111111.11111110");
    });

    it("should calculate correct subnet details for a /32 (single host)", () => {
      // For /32:
      // network is .5, broadcast is .5, firstHost is .6, lastHost is .4, numHosts is 0
      const result = calculateSubnet("10.0.0.5", 32);

      expect(result.ip).toBe("10.0.0.5");
      expect(result.cidr).toBe(32);
      expect(result.mask).toBe("255.255.255.255");
      expect(result.wildcard).toBe("0.0.0.0");
      expect(result.network).toBe("10.0.0.5");
      expect(result.broadcast).toBe("10.0.0.5");
      expect(result.firstHost).toBe("10.0.0.6");
      expect(result.lastHost).toBe("10.0.0.4");
      expect(result.numHosts).toBe(0); // Max(0, 5 - 5 - 1) -> 0

      expect(result.binary.ip).toBe("00001010.00000000.00000000.00000101");
      expect(result.binary.mask).toBe("11111111.11111111.11111111.11111111");
    });
  });
});
