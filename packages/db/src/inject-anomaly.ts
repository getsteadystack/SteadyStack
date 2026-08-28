import prisma from "./index";

async function main() {
  // Find the first monitor for the user
  const monitor = await (prisma as any).monitor.findFirst();

  if (!monitor) {
    console.warn("No monitors found. Please create one on the dashboard first!");
    return;
  }

  console.info(`Injecting Simulated Anomaly for: ${monitor.name}`);

  await (prisma as any).monitorInsight.create({
    data: {
      monitorId: monitor.id,
      type: "ANOMALY",
      severity: "WARNING",
      message: `Latency Anomaly Detected: ${monitor.name} is performing 340% outside expected baseline (Z-Score: 4.8).`,
      metadata: {
        score: 4.8,
        latency: 450,
        region: "us-east-1",
        simulated: true,
      },
    },
  });

  console.info("✅ Anomaly Insight Injected!");
  console.info("👉 Refresh your dashboard to see the 'Invisible AI' layer in action.");
}

main()
  .catch((e) => {
    console.error("❌ Failed to inject anomaly:", e);
    process.exit(1);
  })
  .finally(async () => {
    await (prisma as any).$disconnect();
  });
