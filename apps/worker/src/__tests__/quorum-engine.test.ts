import { describe, test, expect } from "bun:test";
import { evaluateQuorum, QuorumEngine, DEFAULT_QUORUM_CONFIG } from "../services/quorum-engine";
import type { ProbeCheckResult } from "@steadystack/types";

describe("Quorum Engine — Zero False Positive Consensus Verification", () => {
  const createMockResults = (overrides: Partial<ProbeCheckResult>[]): ProbeCheckResult[] => {
    const defaultRegions = [
      { region: "wnam", colo: "SJC", asn: "AS13335" },
      { region: "enam", colo: "IAD", asn: "AS13335" },
      { region: "weur", colo: "LHR", asn: "AS13335" },
      { region: "eeur", colo: "FRA", asn: "AS13335" },
      { region: "apac", colo: "NRT", asn: "AS13335" },
      { region: "oc", colo: "SYD", asn: "AS13335" },
      { region: "sam", colo: "GRU", asn: "AS13335" },
    ];

    return defaultRegions.map((dr, index) => {
      const override = overrides[index] || {};
      return {
        monitorId: "mon-123",
        probeId: `probe-${dr.region}`,
        region: dr.region,
        colo: dr.colo,
        asn: dr.asn,
        timestamp: new Date().toISOString(),
        statusCode: 200,
        latency: 45,
        status: "UP",
        isVerificationRetry: false,
        ...override,
      };
    });
  };

  test("Single probe failure is rejected (No false alarm — status remains UP)", () => {
    // Region 0 (wnam) fails, remaining 6 regions succeed
    const results = createMockResults([
      {
        region: "wnam",
        status: "DOWN",
        statusCode: 504,
        errorReason: "Gateway Timeout",
        isVerificationRetry: true,
      },
    ]);

    const evaluation = evaluateQuorum("mon-123", results);

    expect(evaluation.finalStatus).toBe("DEGRADED");
    expect(evaluation.isGlobalOutage).toBe(false);
    expect(evaluation.isRegionalDegradation).toBe(true);
    expect(evaluation.confirmedDownCount).toBe(1);
    expect(evaluation.totalEligibleProbes).toBe(7);
    expect(evaluation.downRegions).toEqual(["wnam"]);
    expect(evaluation.upRegions).toHaveLength(6);
  });

  test("Minority regional failure (2 regions fail) is classified as REGIONAL_DEGRADATION, not GLOBAL_OUTAGE", () => {
    const results = createMockResults([
      {
        region: "wnam",
        status: "DOWN",
        statusCode: 502,
        errorReason: "Bad Gateway",
        isVerificationRetry: true,
      },
      {
        region: "enam",
        status: "DOWN",
        statusCode: 502,
        errorReason: "Bad Gateway",
        isVerificationRetry: true,
      },
    ]);

    const evaluation = evaluateQuorum("mon-123", results);

    expect(evaluation.finalStatus).toBe("DEGRADED");
    expect(evaluation.isRegionalDegradation).toBe(true);
    expect(evaluation.isGlobalOutage).toBe(false);
    expect(evaluation.confirmedDownCount).toBe(2);
    expect(evaluation.totalEligibleProbes).toBe(7);
    expect(evaluation.downRegions).toEqual(["wnam", "enam"]);
  });

  test("4-of-7 quorum reached: Declares verified GLOBAL_OUTAGE", () => {
    const results = createMockResults([
      {
        region: "wnam",
        status: "DOWN",
        statusCode: 500,
        isVerificationRetry: true,
      },
      {
        region: "enam",
        status: "DOWN",
        statusCode: 500,
        isVerificationRetry: true,
      },
      {
        region: "weur",
        status: "DOWN",
        statusCode: 500,
        isVerificationRetry: true,
      },
      {
        region: "eeur",
        status: "DOWN",
        statusCode: 500,
        isVerificationRetry: true,
      },
    ]);

    const evaluation = evaluateQuorum("mon-123", results);

    expect(evaluation.isDownConsensus).toBe(true);
    expect(evaluation.finalStatus).toBe("DOWN");
    expect(evaluation.isGlobalOutage).toBe(true);
    expect(evaluation.isRegionalDegradation).toBe(false);
    expect(evaluation.confirmedDownCount).toBe(4);
    expect(evaluation.totalEligibleProbes).toBe(7);
    expect(evaluation.reportingRegions).toHaveLength(7);
  });

  test("Slow probe exclusion removes anomalous latency outliers from voting pool", () => {
    // 6 probes report 40ms, 1 probe hangs for 20000ms and fails
    const results = createMockResults([
      { region: "wnam", latency: 40 },
      { region: "enam", latency: 42 },
      { region: "weur", latency: 38 },
      { region: "eeur", latency: 45 },
      { region: "apac", latency: 50 },
      { region: "oc", latency: 48 },
      {
        region: "sam",
        latency: 20000,
        status: "DOWN",
        errorReason: "Socket Timeout",
      },
    ]);

    const evaluation = evaluateQuorum("mon-123", results);

    expect(evaluation.excludedSlowProbes).toContain("sam");
    expect(evaluation.totalEligibleProbes).toBe(6);
    expect(evaluation.finalStatus).toBe("UP");
  });

  test("Flapping detection excludes erratic probe node after 3 transitions in 2 hours", () => {
    const engine = new QuorumEngine();
    const now = Date.now();

    // Register 4 rapid state transitions for "probe-wnam" within 30 minutes
    engine.registerProbeStateTransition("probe-wnam", "UP", now - 1800000);
    engine.registerProbeStateTransition("probe-wnam", "DOWN", now - 1200000);
    engine.registerProbeStateTransition("probe-wnam", "UP", now - 600000);
    engine.registerProbeStateTransition("probe-wnam", "DOWN", now);

    const isFlapping = engine.isProbeFlapping("probe-wnam");
    expect(isFlapping).toBe(true);

    const health = engine.getProbeHealth("probe-wnam");
    expect(health.status).toBe("FLAPPING");
    expect(health.excludedFromQuorum).toBe(true);

    // Evaluate with flapping probe wnam down, but remaining 6 UP
    const results = createMockResults([
      { region: "wnam", status: "DOWN" },
      { region: "enam", status: "UP" },
      { region: "weur", status: "UP" },
      { region: "eeur", status: "UP" },
      { region: "apac", status: "UP" },
      { region: "apac-ne", status: "UP" },
      { region: "apac-se", status: "UP" },
    ]);

    const evaluation = engine.evaluate("mon-123", results);
    expect(evaluation.excludedFlappingProbes).toContain("wnam");
    expect(evaluation.totalEligibleProbes).toBe(6);
    expect(evaluation.finalStatus).toBe("UP");
  });

  test("ASN distribution tracking verifies independent routing paths", () => {
    const results = createMockResults([
      { region: "wnam", asn: "AS13335", status: "DOWN" },
      { region: "enam", asn: "AS13335", status: "DOWN" },
      { region: "weur", asn: "AS15169", status: "DOWN" },
      { region: "eeur", asn: "AS15169", status: "DOWN" },
      { region: "apac", asn: "AS16509", status: "UP" },
      { region: "apac-ne", asn: "AS16509", status: "UP" },
      { region: "apac-se", asn: "AS13335", status: "UP" },
    ]);

    const evaluation = evaluateQuorum("mon-123", results);

    expect(evaluation.asnDistribution["AS13335"]).toBe(2);
    expect(evaluation.asnDistribution["AS15169"]).toBe(2);
  });

  test("Free Tier (3 Primary Regions): Requires 2-of-3 confirming down probes for outage", () => {
    // Free tier checks 3 primary regions (wnam, weur, apac)
    const freeTierResults: ProbeCheckResult[] = [
      {
        monitorId: "mon-free",
        probeId: "probe-wnam",
        region: "wnam",
        status: "DOWN",
        latency: 45,
        timestamp: new Date().toISOString(),
        isVerificationRetry: true,
      },
      {
        monitorId: "mon-free",
        probeId: "probe-weur",
        region: "weur",
        status: "UP",
        latency: 35,
        timestamp: new Date().toISOString(),
      },
      {
        monitorId: "mon-free",
        probeId: "probe-apac",
        region: "apac",
        status: "UP",
        latency: 65,
        timestamp: new Date().toISOString(),
      },
    ];

    const freeTierConfig = {
      ...DEFAULT_QUORUM_CONFIG,
      totalProbesInPool: 3,
      minConfirmationCount: 2,
    };

    // Single failure among 3 is DEGRADED, not DOWN (Zero false positives!)
    const singleFailEval = evaluateQuorum("mon-free", freeTierResults, freeTierConfig);
    expect(singleFailEval.finalStatus).toBe("DEGRADED");
    expect(singleFailEval.isGlobalOutage).toBe(false);
    expect(singleFailEval.totalEligibleProbes).toBe(3);
    expect(singleFailEval.confirmedDownCount).toBe(1);

    // Two failures among 3 reaches 2-of-3 consensus -> DOWN
    const twoFailResults: ProbeCheckResult[] = [
      freeTierResults[0]!,
      {
        monitorId: "mon-free",
        probeId: "probe-weur",
        region: "weur",
        status: "DOWN",
        latency: 40,
        timestamp: new Date().toISOString(),
        isVerificationRetry: true,
      },
      freeTierResults[2]!,
    ];

    const twoFailEval = evaluateQuorum("mon-free", twoFailResults, freeTierConfig);
    expect(twoFailEval.finalStatus).toBe("DOWN");
    expect(twoFailEval.isGlobalOutage).toBe(true);
    expect(twoFailEval.confirmedDownCount).toBe(2);
    expect(twoFailEval.totalEligibleProbes).toBe(3);
  });

  test("Provider Partition Circuit Breaker: 7 Cloudflare DOs fail but Out-of-Band sentinel on AS24940 reports UP -> DEGRADED (Suppresses false DOWN alarm)", () => {
    // 7 Cloudflare regions (AS13335) all report DOWN due to Cloudflare internal egress incident
    // 1 Out-of-band sentinel probe (AS24940) reports UP
    const mockCloudflareFailures = createMockResults([
      {
        region: "wnam",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "enam",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "weur",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "eeur",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "apac",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "apac-ne",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "apac-se",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
    ]);

    const outOfBandSentinelResult: ProbeCheckResult = {
      monitorId: "mon-123",
      probeId: "probe-ext-sentinel",
      region: "ext-sentinel",
      colo: "NBG1",
      asn: "AS24940",
      timestamp: new Date().toISOString(),
      statusCode: 200,
      latency: 22,
      status: "UP",
      isVerificationRetry: false,
    };

    const hybridResults = [...mockCloudflareFailures, outOfBandSentinelResult];

    const evaluation = evaluateQuorum("mon-123", hybridResults);

    expect(evaluation.isSingleProviderPartition).toBe(true);
    expect(evaluation.isDownConsensus).toBe(false);
    expect(evaluation.finalStatus).toBe("DEGRADED");
    expect(evaluation.isGlobalOutage).toBe(false);
    expect(evaluation.distinctDownAsns).toEqual(["AS13335"]);
    expect(evaluation.reason).toContain("Provider partition on AS13335");
  });

  test("Genuine Outage across Multi-ASN: Cloudflare DOs and Out-of-Band sentinel both fail -> Confirms GLOBAL_OUTAGE", () => {
    const mockCloudflareFailures = createMockResults([
      {
        region: "wnam",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "enam",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "weur",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "eeur",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "apac",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "oc",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
      {
        region: "sam",
        asn: "AS13335",
        status: "DOWN",
        isVerificationRetry: true,
      },
    ]);

    const outOfBandFailureResult: ProbeCheckResult = {
      monitorId: "mon-123",
      probeId: "probe-ext-sentinel",
      region: "ext-sentinel",
      colo: "NBG1",
      asn: "AS24940",
      timestamp: new Date().toISOString(),
      statusCode: 500,
      latency: 35,
      status: "DOWN",
      isVerificationRetry: true,
    };

    const hybridResults = [...mockCloudflareFailures, outOfBandFailureResult];

    const evaluation = evaluateQuorum("mon-123", hybridResults);

    expect(evaluation.isSingleProviderPartition).toBe(false);
    expect(evaluation.isDownConsensus).toBe(true);
    expect(evaluation.finalStatus).toBe("DOWN");
    expect(evaluation.isGlobalOutage).toBe(true);
    expect(evaluation.distinctDownAsns).toContain("AS13335");
    expect(evaluation.distinctDownAsns).toContain("AS24940");
  });

  test("Colocation Deduplication: Multiple virtual regions sharing identical physical PoP (e.g. SIN) cannot inflate quorum vote count", () => {
    // 3 virtual regions all map to the same physical data center (colo: "SIN")
    const colocatedResults: ProbeCheckResult[] = [
      {
        monitorId: "mon-123",
        probeId: "probe-apac",
        region: "apac",
        colo: "SIN",
        asn: "AS13335",
        status: "DOWN",
        latency: 50,
        timestamp: new Date().toISOString(),
        isVerificationRetry: true,
      },
      {
        monitorId: "mon-123",
        probeId: "probe-oc",
        region: "oc",
        colo: "SIN",
        asn: "AS13335",
        status: "DOWN",
        latency: 52,
        timestamp: new Date().toISOString(),
        isVerificationRetry: true,
      },
      {
        monitorId: "mon-123",
        probeId: "probe-sam",
        region: "sam",
        colo: "SIN",
        asn: "AS13335",
        status: "DOWN",
        latency: 48,
        timestamp: new Date().toISOString(),
        isVerificationRetry: true,
      },
      // 1 distinct region in London
      {
        monitorId: "mon-123",
        probeId: "probe-weur",
        region: "weur",
        colo: "LHR",
        asn: "AS13335",
        status: "UP",
        latency: 25,
        timestamp: new Date().toISOString(),
      },
    ];

    const evaluation = evaluateQuorum("mon-123", colocatedResults);

    // Total eligible deduplicated probes should be 2 (SIN and LHR), NOT 4!
    expect(evaluation.totalEligibleProbes).toBe(2);
    expect(evaluation.confirmedDownCount).toBe(1);
    expect(evaluation.finalStatus).toBe("DEGRADED");
    expect(evaluation.isGlobalOutage).toBe(false);
  });

  test("Minimum Reporting Floor Invariant: Insufficient reporting pool (<4 probes) never triggers global DOWN", () => {
    // Only 2 probes report in the pool, both reporting DOWN (2-of-2)
    const partialResults: ProbeCheckResult[] = [
      {
        monitorId: "mon-123",
        probeId: "probe-wnam",
        region: "wnam",
        colo: "SJC",
        asn: "AS13335",
        status: "DOWN",
        latency: 40,
        timestamp: new Date().toISOString(),
        isVerificationRetry: true,
      },
      {
        monitorId: "mon-123",
        probeId: "probe-enam",
        region: "enam",
        colo: "IAD",
        asn: "AS13335",
        status: "DOWN",
        latency: 42,
        timestamp: new Date().toISOString(),
        isVerificationRetry: true,
      },
    ];

    const evaluation = evaluateQuorum("mon-123", partialResults);

    // Because totalEligible is 2 (< 4), status must be DEGRADED, not DOWN
    expect(evaluation.totalEligibleProbes).toBe(2);
    expect(evaluation.isDownConsensus).toBe(false);
    expect(evaluation.isGlobalOutage).toBe(false);
    expect(evaluation.finalStatus).toBe("DEGRADED");
  });

  test("Shape-Aware Failure Topology: Partial 3-region failure preserves exact topology shape and blast radius", () => {
    // 3 of 7 regions fail (weur, apac, oc), 4 regions remain UP
    const results = createMockResults([
      { region: "wnam", status: "UP", latency: 35 },
      { region: "enam", status: "UP", latency: 40 },
      { region: "weur", status: "DOWN", statusCode: 502, errorReason: "Bad Gateway", latency: 120 },
      { region: "eeur", status: "UP", latency: 45 },
      {
        region: "apac",
        status: "DOWN",
        statusCode: 504,
        errorReason: "Gateway Timeout",
        latency: 5000,
      },
      {
        region: "oc",
        status: "DOWN",
        statusCode: 500,
        errorReason: "Internal Server Error",
        latency: 250,
      },
      { region: "sam", status: "UP", latency: 85 },
    ]);

    const evaluation = evaluateQuorum("mon-shape-1", results);

    // Ensure it is NOT rounded to DOWN or UP
    expect(evaluation.finalStatus).toBe("DEGRADED");
    expect(evaluation.isRegionalDegradation).toBe(true);
    expect(evaluation.isGlobalOutage).toBe(false);
    expect(evaluation.downRegions).toEqual(["weur", "apac", "oc"]);
    expect(evaluation.upRegions).toEqual(["wnam", "enam", "eeur", "sam"]);
    expect(evaluation.confirmedDownCount).toBe(3);
    expect(evaluation.totalEligibleProbes).toBe(7);
    expect(evaluation.reason).toContain(
      "Regional Degradation in weur, apac, oc (3/7 regions failing)",
    );
  });
});
