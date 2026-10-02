import { describe, expect, it } from "bun:test";
import { PercentileCalculator, LatencyBuffer } from "./latency-calculator";

describe("PercentileCalculator", () => {
  it("should handle empty arrays correctly", () => {
    const calc = new PercentileCalculator();
    expect(calc.getPercentile(50)).toBe(0);
    expect(calc.getAverage()).toBe(0);
    expect(calc.getMin()).toBe(0);
    expect(calc.getMax()).toBe(0);
    expect(calc.getCount()).toBe(0);
  });

  it("should handle a single value correctly", () => {
    const calc = new PercentileCalculator();
    calc.addValue(42);
    expect(calc.getPercentile(0)).toBe(42);
    expect(calc.getPercentile(50)).toBe(42);
    expect(calc.getPercentile(100)).toBe(42);
    expect(calc.getAverage()).toBe(42);
    expect(calc.getMin()).toBe(42);
    expect(calc.getMax()).toBe(42);
    expect(calc.getCount()).toBe(1);
  });

  it("should handle two values correctly", () => {
    const calc = new PercentileCalculator();
    calc.addValue(10);
    calc.addValue(30);
    expect(calc.getPercentile(0)).toBe(10);
    expect(calc.getPercentile(50)).toBe(20);
    expect(calc.getPercentile(100)).toBe(30);
    expect(calc.getPercentile(25)).toBe(15);
    expect(calc.getPercentile(75)).toBe(25);
    expect(calc.getAverage()).toBe(20);
    expect(calc.getMin()).toBe(10);
    expect(calc.getMax()).toBe(30);
    expect(calc.getCount()).toBe(2);
  });

  it("should handle edge cases like 0, negative numbers, and decimals", () => {
    const calc = new PercentileCalculator();
    calc.addValue(0);
    calc.addValue(-10);
    calc.addValue(10.5);

    expect(calc.getMin()).toBe(-10);
    expect(calc.getMax()).toBe(10.5);
    expect(calc.getCount()).toBe(3);

    // sorted: -10, 0, 10.5
    expect(calc.getPercentile(0)).toBe(-10);
    expect(calc.getPercentile(50)).toBe(0);
    expect(calc.getPercentile(100)).toBe(10.5);

    // Average: (-10 + 0 + 10.5) / 3 = 0.5 / 3 = 0.1666...
    expect(calc.getAverage()).toBeCloseTo(0.16666666);
  });

  it("should correctly clear values when reset is called", () => {
    const calc = new PercentileCalculator();
    calc.addValue(100);
    calc.reset();

    expect(calc.getPercentile(50)).toBe(0);
    expect(calc.getCount()).toBe(0);
  });

  it("should sort values correctly and cache the sorted state", () => {
    const calc = new PercentileCalculator();
    calc.addValue(3);
    calc.addValue(1);
    calc.addValue(2);

    // p=0, 50, 100 on 1, 2, 3 -> 1, 2, 3
    expect(calc.getPercentile(0)).toBe(1);
    expect(calc.getPercentile(50)).toBe(2);
    expect(calc.getPercentile(100)).toBe(3);

    // adding a new value should un-set the sorted flag
    calc.addValue(0);

    // p=0, 33.3, 66.6, 100 on 0, 1, 2, 3 -> 0, 1, 2, 3
    expect(calc.getPercentile(0)).toBe(0);
    expect(calc.getPercentile(100)).toBe(3);
  });

  it("should correctly handle NaN and Infinity inputs without throwing errors", () => {
    const calc = new PercentileCalculator();
    calc.addValue(NaN);
    calc.addValue(Infinity);
    calc.addValue(-Infinity);

    expect(calc.getCount()).toBe(3);

    // While the return values might be unusual mathematically, the class shouldn't throw
    expect(() => calc.getPercentile(50)).not.toThrow();
    expect(() => calc.getAverage()).not.toThrow();
    expect(() => calc.getMin()).not.toThrow();
    expect(() => calc.getMax()).not.toThrow();
  });
});

describe("LatencyBuffer", () => {
  it("should initialize with default empty values", () => {
    const buffer = new LatencyBuffer();
    const agg = buffer.getAggregates();

    expect(agg.sampleCount).toBe(0);
    expect(agg.avgLatency).toBe(0);
    expect(agg.successRate).toBe(0);
  });

  it("should record successful latencies correctly", () => {
    const buffer = new LatencyBuffer();
    buffer.add(100, true);
    buffer.add(200, true);

    const agg = buffer.getAggregates();
    expect(agg.sampleCount).toBe(2);
    expect(agg.avgLatency).toBe(150);
    expect(agg.successRate).toBe(1); // 2/2 = 1 (100%)
    expect(agg.p50Latency).toBe(150);
  });

  it("should record failed latencies and calculate success rate correctly", () => {
    const buffer = new LatencyBuffer();
    buffer.add(100, true);
    buffer.add(200, false);
    buffer.add(300, false);
    buffer.add(400, true);

    const agg = buffer.getAggregates();
    expect(agg.sampleCount).toBe(4);
    expect(agg.avgLatency).toBe(250);
    expect(agg.successRate).toBe(0.5); // 2/4 = 0.5 (50%)
    expect(agg.minLatency).toBe(100);
    expect(agg.maxLatency).toBe(400);
  });

  it("should completely reset its state", () => {
    const buffer = new LatencyBuffer();
    buffer.add(100, true);
    buffer.add(200, false);

    buffer.reset();

    const agg = buffer.getAggregates();
    expect(agg.sampleCount).toBe(0);
    expect(agg.avgLatency).toBe(0);
    expect(agg.successRate).toBe(0);
  });
});
