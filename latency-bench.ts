const bench = async () => {
  const groups = new Map<string, number[]>();
  // Generate fake data
  // 1440 groups (24 hours * 60 minutes)
  // Each group has 60 items (1 check per second)
  for (let i = 0; i < 1440; i++) {
    const lats: number[] = [];
    for (let j = 0; j < 60; j++) {
      lats.push(Math.random() * 1000);
    }
    groups.set(`timestamp-${i}`, lats);
  }

  const startOld = performance.now();
  for (let i = 0; i < 100; i++) { // run multiple times to get measurable time
    const result: any[] = [];
    for (const [timestamp, lats] of groups.entries()) {
      const avg = lats.reduce((a, b) => a + b, 0) / lats.length;
      const min = Math.min(...lats);
      const max = Math.max(...lats);
      const sorted = [...lats].sort((a, b) => a - b);
      const p95 = sorted[Math.floor(sorted.length * 0.95)] || avg;

      result.push({
        timestamp,
        avgLatency: avg,
        minLatency: min,
        maxLatency: max,
        p95Latency: p95,
      });
    }
  }
  const endOld = performance.now();

  console.log(`Old time: ${endOld - startOld}ms`);

  const groupsNew = new Map<string, number[]>();
  for (let i = 0; i < 1440; i++) {
    const lats: number[] = [];
    for (let j = 0; j < 60; j++) {
      lats.push(Math.random() * 1000);
    }
    groupsNew.set(`timestamp-${i}`, lats);
  }

  const startNew = performance.now();
  for (let i = 0; i < 100; i++) {
    const result: any[] = [];
    for (const [timestamp, lats] of groupsNew.entries()) {
      const len = lats.length;
      lats.sort((a, b) => a - b); // in-place sort
      let sum = 0;
      for (let j = 0; j < len; j++) {
        sum += lats[j];
      }
      const avg = sum / len;
      const min = lats[0];
      const max = lats[len - 1];
      const p95 = lats[Math.floor(len * 0.95)] || avg;

      result.push({
        timestamp,
        avgLatency: avg,
        minLatency: min,
        maxLatency: max,
        p95Latency: p95,
      });
    }
  }
  const endNew = performance.now();

  console.log(`New time: ${endNew - startNew}ms`);
}

bench();
