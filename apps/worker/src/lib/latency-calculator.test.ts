import { describe, expect, it } from "bun:test";
import { PercentileCalculator, LatencyBuffer } from "./latency-calculator";

describe("PercentileCalculator", () => {
  it("should handle empty state correctly", () => {
    const calc = new PercentileCalculator();
    expect(calc.getCount()).toBe(0);
    expect(calc.getMin()).toBe(0);
    expect(calc.getMax()).toBe(0);
    expect(calc.getAverage()).toBe(0);
    expect(calc.getPercentile(50)).toBe(0);
    expect(calc.getPercentile(95)).toBe(0);
    expect(calc.getPercentile(99)).toBe(0);
  });

  it("should calculate correct values for a single item", () => {
    const calc = new PercentileCalculator();
    calc.addValue(100);

    expect(calc.getCount()).toBe(1);
    expect(calc.getMin()).toBe(100);
    expect(calc.getMax()).toBe(100);
    expect(calc.getAverage()).toBe(100);
    expect(calc.getPercentile(50)).toBe(100);
    expect(calc.getPercentile(99)).toBe(100);
  });

  it("should calculate correct values for multiple items", () => {
    const calc = new PercentileCalculator();
    const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    // Add in reverse to test sorting
    for (let i = values.length - 1; i >= 0; i--) {
      calc.addValue(values[i]);
    }

    expect(calc.getCount()).toBe(10);
    expect(calc.getMin()).toBe(10);
    expect(calc.getMax()).toBe(100);
    expect(calc.getAverage()).toBe(55);

    // p50: index = (50/100) * 9 = 4.5
    // values[4] = 50, values[5] = 60
    // 50 * 0.5 + 60 * 0.5 = 55
    expect(calc.getPercentile(50)).toBe(55);

    // p90: index = (90/100) * 9 = 8.1
    // values[8] = 90, values[9] = 100
    // 90 * 0.9 + 100 * 0.1 = 81 + 10 = 91
    expect(calc.getPercentile(90)).toBe(91);
  });

  it("should handle reset correctly", () => {
    const calc = new PercentileCalculator();
    calc.addValue(100);
    calc.addValue(200);

    calc.reset();

    expect(calc.getCount()).toBe(0);
    expect(calc.getMin()).toBe(0);
    expect(calc.getMax()).toBe(0);
    expect(calc.getAverage()).toBe(0);
    expect(calc.getPercentile(50)).toBe(0);
  });
});

describe("LatencyBuffer", () => {
  it("should handle empty state correctly", () => {
    const buffer = new LatencyBuffer();
    const aggs = buffer.getAggregates();

    expect(aggs.sampleCount).toBe(0);
    expect(aggs.successRate).toBe(0);
    expect(aggs.avgLatency).toBe(0);
    expect(aggs.minLatency).toBe(0);
    expect(aggs.maxLatency).toBe(0);
    expect(aggs.p50Latency).toBe(0);
    expect(aggs.p95Latency).toBe(0);
    expect(aggs.p99Latency).toBe(0);
  });

  it("should aggregate latencies and compute success rate", () => {
    const buffer = new LatencyBuffer();

    // Add some successful requests
    buffer.add(100, true);
    buffer.add(150, true);
    buffer.add(200, true);

    // Add some failed requests
    buffer.add(300, false);

    const aggs = buffer.getAggregates();

    expect(aggs.sampleCount).toBe(4);
    // 3 out of 4 successful = 75%
    expect(aggs.successRate).toBe(0.75);

    expect(aggs.minLatency).toBe(100);
    expect(aggs.maxLatency).toBe(300);
    // (100 + 150 + 200 + 300) / 4 = 750 / 4 = 187.5
    expect(aggs.avgLatency).toBe(187.5);
  });

  it("should handle success default param", () => {
    const buffer = new LatencyBuffer();

    buffer.add(100); // success should default to true

    const aggs = buffer.getAggregates();
    expect(aggs.successRate).toBe(1);
    expect(aggs.sampleCount).toBe(1);
  });

  it("should handle reset correctly", () => {
    const buffer = new LatencyBuffer();

    buffer.add(100, true);
    buffer.add(200, false);

    buffer.reset();

    const aggs = buffer.getAggregates();

    expect(aggs.sampleCount).toBe(0);
    expect(aggs.successRate).toBe(0);
    expect(aggs.avgLatency).toBe(0);
    expect(aggs.minLatency).toBe(0);
  });
});
