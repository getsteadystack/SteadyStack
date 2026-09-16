import { Command } from "commander";
import chalk from "chalk";
import { table } from "table";
import { readFileSync, existsSync } from "fs";
import ora from "ora";
import { api, ApiError } from "../client.js";

export interface ParsedKumaMonitor {
  name: string;
  url: string;
  type: string;
  interval: number;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  expectation?: Record<string, unknown>;
  alertThreshold?: number;
  tags?: string[];
}

export function parseKumaExport(
  rawContent: string,
  additionalTags: string[] = [],
): ParsedKumaMonitor[] {
  let data: any;
  try {
    data = JSON.parse(rawContent);
  } catch {
    throw new Error("Invalid JSON format. Please provide a valid Uptime Kuma JSON export file.");
  }

  // Uptime Kuma exports can be { monitorList: [...] }, { monitors: [...] }, or a direct array [...]
  const rawList: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data.monitorList)
      ? data.monitorList
      : Array.isArray(data.monitors)
        ? data.monitors
        : [];

  if (!rawList || rawList.length === 0) {
    throw new Error(
      "No monitors found in the export file. Ensure the file contains a 'monitorList' or array of monitors.",
    );
  }

  return rawList.map((m: any): ParsedKumaMonitor => {
    const rawType = (m.type || "http").toLowerCase();
    let type = "HTTP";
    let url = m.url || "";
    const method = (m.method || "GET").toUpperCase();
    const interval = Math.max(30, Number(m.interval) || 60);
    const alertThreshold = Math.max(1, Number(m.maxretries) || 1);

    // Map Uptime Kuma types to SteadyStack MonitorType
    switch (rawType) {
      case "http":
      case "keyword":
      case "json-query":
        type = "HTTP";
        break;
      case "port":
        type = "PORT";
        if (!url && m.hostname) {
          url = m.port ? `${m.hostname}:${m.port}` : m.hostname;
        }
        break;
      case "ping":
        type = "PING";
        if (!url && m.hostname) {
          url = m.hostname;
        }
        break;
      case "dns":
        type = "DNS";
        if (!url && m.hostname) {
          url = m.hostname;
        }
        break;
      case "push":
        type = "HEARTBEAT";
        if (!url) {
          url = `heartbeat://${m.name ? encodeURIComponent(m.name.toLowerCase().replace(/\s+/g, "-")) : "push-target"}`;
        }
        break;
      case "real-browser":
      case "chrome":
        type = "BROWSER";
        break;
      case "steam":
      case "gamedig":
      case "mqtt":
      case "docker":
        type = "PORT";
        if (!url && m.hostname) {
          url = m.port ? `${m.hostname}:${m.port}` : m.hostname;
        }
        break;
      case "postgres":
      case "mysql":
      case "redis":
      case "mongodb":
      case "sqlserver":
        type = "DATABASE";
        url =
          m.databaseConnectionString ||
          url ||
          (m.hostname ? `${m.hostname}:${m.port || 5432}` : "");
        break;
      default:
        type = "HTTP";
        break;
    }

    // Parse custom headers
    let headers: Record<string, string> | undefined;
    if (m.headers) {
      if (typeof m.headers === "string") {
        try {
          headers = JSON.parse(m.headers);
        } catch {
          // Keep undefined if malformed
        }
      } else if (typeof m.headers === "object") {
        headers = m.headers;
      }
    }

    // Build expectations
    const expectation: Record<string, unknown> = {};
    if (m.keyword) {
      expectation.keyword = m.keyword;
    }
    if (m.accepted_statuscodes && Array.isArray(m.accepted_statuscodes)) {
      expectation.statusCode = m.accepted_statuscodes;
    }

    // Extract tags
    const tags: string[] = ["imported", "uptime-kuma", ...additionalTags];
    if (Array.isArray(m.tags)) {
      for (const t of m.tags) {
        if (typeof t === "string" && t.trim()) {
          tags.push(t.trim());
        } else if (t && typeof t.name === "string" && t.name.trim()) {
          tags.push(t.name.trim());
        }
      }
    }

    // Deduplicate tags
    const uniqueTags = Array.from(new Set(tags));

    return {
      name: m.name || url || "Imported Monitor",
      url: url || "https://example.com",
      type,
      interval,
      method,
      headers: headers && Object.keys(headers).length > 0 ? headers : undefined,
      body: m.body || undefined,
      expectation: Object.keys(expectation).length > 0 ? expectation : undefined,
      alertThreshold,
      tags: uniqueTags,
    };
  });
}

export const importCmd = new Command("import").description(
  "Import monitors and configs from other platforms",
);

importCmd
  .command("kuma <file>")
  .alias("uptime-kuma")
  .description("Import monitors from an Uptime Kuma JSON backup file")
  .option("--dry-run", "Preview parsed monitors without creating them in SteadyStack")
  .option("--overwrite", "Update existing monitors with the same name instead of skipping")
  .option("-t, --tags <tags>", "Additional comma-separated tags to attach to imported monitors")
  .action(async (filePath: string, opts) => {
    if (!existsSync(filePath)) {
      console.error(chalk.red(`✖ File not found: ${filePath}`));
      process.exit(1);
    }

    console.log(chalk.bold("\n📦 SteadyStack Uptime Kuma Importer\n"));

    let rawContent: string;
    try {
      rawContent = readFileSync(filePath, "utf-8");
    } catch (err: any) {
      console.error(chalk.red(`✖ Failed to read file: ${err.message}`));
      process.exit(1);
    }

    const extraTags = opts.tags
      ? opts.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];

    let parsedMonitors: ParsedKumaMonitor[];
    try {
      parsedMonitors = parseKumaExport(rawContent, extraTags);
    } catch (err: any) {
      console.error(chalk.red(`✖ Parser error: ${err.message}`));
      process.exit(1);
    }

    console.log(
      chalk.cyan(`Found ${chalk.bold(parsedMonitors.length)} monitor(s) in backup file.\n`),
    );

    // Display summary table
    const rows = [
      [
        chalk.bold("NAME"),
        chalk.bold("TYPE"),
        chalk.bold("TARGET / URL"),
        chalk.bold("INTERVAL"),
        chalk.bold("RETRIES"),
        chalk.bold("TAGS"),
      ],
      ...parsedMonitors.map((m) => [
        m.name,
        chalk.cyan(m.type),
        chalk.dim(m.url.length > 35 ? m.url.slice(0, 32) + "…" : m.url),
        `${m.interval}s`,
        `${m.alertThreshold || 1}`,
        chalk.dim(m.tags?.slice(0, 3).join(", ") || "none"),
      ]),
    ];

    console.log(
      table(rows, {
        border: {
          topBody: "─",
          topJoin: "┬",
          topLeft: "┌",
          topRight: "┐",
          bottomBody: "─",
          bottomJoin: "┴",
          bottomLeft: "└",
          bottomRight: "┘",
          bodyLeft: "│",
          bodyRight: "│",
          bodyJoin: "│",
          joinBody: "─",
          joinLeft: "├",
          joinRight: "┤",
          joinJoin: "┼",
        },
        drawHorizontalLine: (i) => i === 0 || i === 1 || i === rows.length,
      }),
    );

    if (opts.dryRun) {
      console.log(
        chalk.yellow("✨ Dry run complete. No changes made to your SteadyStack workspace."),
      );
      console.log(chalk.dim("Remove --dry-run to apply these monitors live.\n"));
      return;
    }

    // Live import against API
    const spinner = ora("Connecting to SteadyStack API…").start();
    let existingMonitors: any[] = [];
    try {
      const res = await api.get<{ monitors: any[] }>("/api/cli/monitors");
      existingMonitors = res.monitors || [];
    } catch (err: any) {
      spinner.fail("Failed to connect to API");
      if (err instanceof ApiError) console.error(chalk.red(`  ${err.message}`));
      process.exit(1);
    }

    const existingByName = new Map(existingMonitors.map((m) => [m.name.toLowerCase().trim(), m]));

    spinner.succeed(`Connected. Existing monitors in workspace: ${existingMonitors.length}`);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    console.log(chalk.bold("\n🚀 Applying Monitors:\n"));

    for (const m of parsedMonitors) {
      const existing = existingByName.get(m.name.toLowerCase().trim());

      if (existing && !opts.overwrite) {
        console.log(`  ${chalk.dim("[-]")} Skipped (already exists): ${chalk.bold(m.name)}`);
        skippedCount++;
        continue;
      }

      const itemSpinner = ora(existing ? `Updating ${m.name}…` : `Creating ${m.name}…`).start();

      try {
        if (existing) {
          await api.put(`/api/cli/monitors/${existing.id}`, {
            name: m.name,
            url: m.url,
            type: m.type,
            interval: m.interval,
            method: m.method,
            headers: m.headers,
            body: m.body,
            expectation: m.expectation,
            alertThreshold: m.alertThreshold,
            tags: m.tags,
          });
          itemSpinner.succeed(chalk.yellow(`[~] Updated: ${chalk.bold(m.name)}`));
          updatedCount++;
        } else {
          await api.post("/api/cli/monitors", {
            name: m.name,
            url: m.url,
            type: m.type,
            interval: m.interval,
            method: m.method,
            headers: m.headers,
            body: m.body,
            expectation: m.expectation,
            alertThreshold: m.alertThreshold,
            tags: m.tags,
          });
          itemSpinner.succeed(chalk.green(`[+] Created: ${chalk.bold(m.name)}`));
          createdCount++;
        }
      } catch (err: any) {
        itemSpinner.fail(`Failed: ${chalk.bold(m.name)}`);
        if (err instanceof ApiError) {
          console.error(chalk.dim(`    ${err.message}`));
        } else {
          console.error(chalk.dim(`    ${err.message || "Unknown error"}`));
        }
        errorCount++;
      }
    }

    console.log(chalk.bold("\n🏁 Migration Summary:"));
    console.log(`  ${chalk.green("✔ Created:")}   ${createdCount}`);
    if (updatedCount > 0) {
      console.log(`  ${chalk.yellow("~ Updated:")}   ${updatedCount}`);
    }
    if (skippedCount > 0) {
      console.log(
        `  ${chalk.dim("- Skipped:")}   ${skippedCount} (use --overwrite to force update)`,
      );
    }
    if (errorCount > 0) {
      console.log(`  ${chalk.red("✖ Errors:")}    ${errorCount}`);
    }
    console.log(
      `\nAll monitors are now live on SteadyStack's multi-region edge consensus network! 🎉\n`,
    );
  });
