import { Command } from "commander";
import chalk from "chalk";
import { table } from "table";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "fs";
import { join } from "path";
import ora from "ora";
import inquirer from "inquirer";
import { api, ApiError } from "../client.js";

interface Monitor {
  id: string;
  name: string;
  url: string;
  type: string;
  status: string;
  interval: number;
  lastCheck: string | null;
  method?: string;
  alertThreshold?: number;
  checkRegions?: string | null;
  tags?: string[];
}

const STATUS_COLOR: Record<string, (s: string) => string> = {
  UP: chalk.green,
  DOWN: chalk.red,
  PAUSED: chalk.yellow,
  MAINTENANCE: chalk.blue,
};

function colorStatus(status: string) {
  return (STATUS_COLOR[status] ?? chalk.dim)(status);
}

function normalizeMonitor(def: any): any {
  let type = (def.type || "HTTP").toUpperCase();
  if (type === "TCP") {
    type = "PORT";
  }

  let url = def.url || "";
  if (!url && (def.host || def.hostname)) {
    const host = def.host || def.hostname;
    if (type === "PORT") {
      url = def.port ? `tcp://${host}:${def.port}` : `tcp://${host}`;
    } else if (type === "PING") {
      url = `ping://${host}`;
    } else if (type === "DNS") {
      url = host;
    } else if (type === "SSL" || type === "DOMAIN") {
      url = host.startsWith("http") ? host : `https://${host}`;
    } else {
      url = host;
    }
  }

  if (!url && type === "HEARTBEAT") {
    url = `heartbeat://${encodeURIComponent(def.name || "heartbeat")}`;
  }

  const normalized: Record<string, any> = {
    name: def.name,
    url,
    type,
    interval: Number(def.interval) || 60,
    method: (def.method || "GET").toUpperCase(),
    alertThreshold: Number(def.alertThreshold) || 1,
  };

  if (def.headers) normalized.headers = def.headers;
  if (def.body) normalized.body = def.body;
  if (def.expectation) normalized.expectation = def.expectation;
  if (def.checkRegions) normalized.checkRegions = def.checkRegions;
  if (def.runbookUrl) normalized.runbookUrl = def.runbookUrl;
  if (def.tags) normalized.tags = def.tags;

  return normalized;
}

function loadMonitorsFromPath(targetPath?: string): any[] {
  const resolvedPath =
    targetPath ||
    (existsSync("steadystack.yaml")
      ? "steadystack.yaml"
      : existsSync("steadystack.yml")
        ? "steadystack.yml"
        : undefined);

  if (!resolvedPath) {
    throw new Error(
      "No YAML configuration specified. Provide a path or create 'steadystack.yaml'.",
    );
  }

  if (!existsSync(resolvedPath)) {
    throw new Error(`File or directory not found: ${resolvedPath}`);
  }

  const stat = statSync(resolvedPath);
  const filesToRead: string[] = [];

  if (stat.isDirectory()) {
    const entries = readdirSync(resolvedPath);
    for (const entry of entries) {
      if (entry.endsWith(".yml") || entry.endsWith(".yaml")) {
        filesToRead.push(join(resolvedPath, entry));
      }
    }
    if (filesToRead.length === 0) {
      throw new Error(`No .yml or .yaml files found in directory: ${resolvedPath}`);
    }
  } else {
    filesToRead.push(resolvedPath);
  }

  const monitors: any[] = [];
  for (const file of filesToRead) {
    let parsed: any;
    try {
      parsed = parseYaml(readFileSync(file, "utf-8"));
    } catch {
      throw new Error(`Invalid YAML format in: ${file}`);
    }

    if (!parsed) continue;

    if (Array.isArray(parsed)) {
      monitors.push(...parsed);
    } else if (Array.isArray(parsed.monitors)) {
      monitors.push(...parsed.monitors);
    } else if (typeof parsed === "object" && parsed.name) {
      monitors.push(parsed);
    }
  }

  if (monitors.length === 0) {
    throw new Error("No monitors found in YAML configuration.");
  }

  return monitors.map(normalizeMonitor);
}

export const monitorsCmd = new Command("monitors").description("Manage monitors");

// pulse monitors list
monitorsCmd
  .command("list")
  .alias("ls")
  .description("List all monitors")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const spinner = ora("Fetching monitors…").start();
    try {
      const { monitors } = await api.get<{ monitors: Monitor[] }>("/api/cli/monitors");
      spinner.stop();

      if (opts.json) {
        console.log(JSON.stringify(monitors, null, 2));
        return;
      }

      if (monitors.length === 0) {
        console.log(
          chalk.dim("No monitors found. Create one with: pulse monitors apply -f steadystack.yaml"),
        );
        return;
      }

      const rows = [
        [
          chalk.bold("STATUS"),
          chalk.bold("NAME"),
          chalk.bold("TYPE"),
          chalk.bold("URL"),
          chalk.bold("INTERVAL"),
          chalk.bold("LAST CHECK"),
        ],
        ...monitors.map((m) => [
          colorStatus(m.status),
          m.name,
          chalk.cyan(m.type),
          chalk.dim(m.url.slice(0, 40) + (m.url.length > 40 ? "…" : "")),
          `${m.interval}s`,
          m.lastCheck ? new Date(m.lastCheck).toLocaleTimeString() : chalk.dim("never"),
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
      console.log(
        chalk.dim(`  ${monitors.length} monitor${monitors.length !== 1 ? "s" : ""} total`),
      );
    } catch (err) {
      spinner.fail("Failed to fetch monitors");
      if (err instanceof ApiError) console.error(chalk.red(err.message));
    }
  });

// pulse monitors get <id>
monitorsCmd
  .command("get <id>")
  .description("Get details of a single monitor")
  .option("--json", "Output as JSON")
  .action(async (id, opts) => {
    const spinner = ora("Fetching monitor…").start();
    try {
      const { monitor } = await api.get<{ monitor: any }>(`/api/cli/monitors/${id}`);
      spinner.stop();

      if (opts.json) {
        console.log(JSON.stringify(monitor, null, 2));
        return;
      }

      console.log(`\n${chalk.bold(monitor.name)} ${colorStatus(monitor.status)}`);
      console.log(chalk.dim(`  ID       : ${monitor.id}`));
      console.log(chalk.dim(`  URL      : ${monitor.url}`));
      console.log(chalk.dim(`  Type     : ${monitor.type}`));
      console.log(chalk.dim(`  Interval : ${monitor.interval}s`));
      console.log(
        chalk.dim(
          `  Last check: ${monitor.lastCheck ? new Date(monitor.lastCheck).toLocaleString() : "never"}`,
        ),
      );

      if (monitor.events?.length) {
        console.log(`\n${chalk.bold("Recent events:")}`);
        for (const e of monitor.events) {
          const ts = new Date(e.timestamp).toLocaleTimeString();
          const status = colorStatus(e.status);
          const latency = e.latency ? chalk.dim(`${e.latency}ms`) : "";
          const err = e.errorReason ? chalk.red(` [${e.errorReason}]`) : "";
          console.log(`  ${chalk.dim(ts)}  ${status}  ${latency}${err}`);
        }
      }
    } catch (err) {
      spinner.fail("Failed to fetch monitor");
      if (err instanceof ApiError) console.error(chalk.red(err.message));
    }
  });

// pulse monitors apply [file]
monitorsCmd
  .command("apply [file]")
  .description("Create or update monitors from a YAML file or directory (Monitoring as Code)")
  .option("-f, --file <path>", "Path to YAML file or directory")
  .option("--dry-run", "Preview changes without applying")
  .action(async (posFile, opts) => {
    const targetPath = posFile || opts.file;
    let monitorsToApply: any[];
    try {
      monitorsToApply = loadMonitorsFromPath(targetPath);
    } catch (err: any) {
      console.error(chalk.red(`✖ ${err.message}`));
      process.exit(1);
    }

    if (opts.dryRun) {
      console.log(chalk.yellow("DRY RUN — previewing changes without applying\n"));
    }

    // Fetch existing monitors for idempotency
    const spinner = ora("Syncing monitor state…").start();
    let existingByName = new Map<string, Monitor>();
    try {
      const { monitors: existing } = await api.get<{ monitors: Monitor[] }>("/api/cli/monitors");
      existingByName = new Map(existing.map((m) => [m.name.toLowerCase(), m]));
      spinner.stop();
    } catch (err: any) {
      if (opts.dryRun) {
        spinner.stop();
        console.log(
          chalk.dim("  (Offline preview — connecting to remote will verify updates vs creates)\n"),
        );
      } else {
        spinner.fail("Failed to fetch current monitors");
        if (err instanceof ApiError) console.error(chalk.red(err.message));
        process.exit(1);
      }
    }

    let created = 0;
    let updated = 0;

    for (const def of monitorsToApply) {
      const name = def.name;
      const existing = existingByName.get(name?.toLowerCase());
      const action = existing ? "update" : "create";

      if (opts.dryRun) {
        console.log(
          `  ${action === "create" ? chalk.green("[+] CREATE") : chalk.yellow("[~] UPDATE")} ${name} ${chalk.dim(`(${def.type}: ${def.url})`)}`,
        );
        continue;
      }

      const itemSpinner = ora(`${action === "create" ? "Creating" : "Updating"} ${name}…`).start();
      try {
        if (existing) {
          await api.put(`/api/cli/monitors/${existing.id}`, def);
          itemSpinner.succeed(chalk.yellow(`[~] Updated: ${name}`));
          updated++;
        } else {
          await api.post("/api/cli/monitors", def);
          itemSpinner.succeed(chalk.green(`[+] Created: ${name}`));
          created++;
        }
      } catch (err) {
        itemSpinner.fail(`Failed: ${name}`);
        if (err instanceof ApiError) console.error(chalk.dim(`    ${err.message}`));
      }
    }

    if (!opts.dryRun) {
      console.log(`\n${chalk.green("✔ Applied:")} ${created} created, ${updated} updated`);
    }
  });

// pulse monitors diff [file]
monitorsCmd
  .command("diff [file]")
  .description("Diff local YAML monitor definitions against remote monitors")
  .option("-f, --file <path>", "Path to YAML file or directory")
  .action(async (posFile, opts) => {
    const targetPath = posFile || opts.file;
    let monitorsToDiff: any[];
    try {
      monitorsToDiff = loadMonitorsFromPath(targetPath);
    } catch (err: any) {
      console.error(chalk.red(`✖ ${err.message}`));
      process.exit(1);
    }

    const spinner = ora("Comparing local definitions against remote state…").start();
    try {
      const { monitors: existing } = await api.get<{ monitors: Monitor[] }>("/api/cli/monitors");
      spinner.stop();

      const existingByName = new Map(existing.map((m) => [m.name.toLowerCase(), m]));

      console.log(chalk.bold("\nMonitor Diff:\n"));
      let hasChanges = false;

      for (const def of monitorsToDiff) {
        const existing = existingByName.get(def.name?.toLowerCase());
        if (!existing) {
          hasChanges = true;
          console.log(
            `  ${chalk.green("[+] NEW")} ${chalk.bold(def.name)} ${chalk.dim(`(${def.type}: ${def.url}, ${def.interval}s)`)}`,
          );
        } else {
          const changes: string[] = [];
          if (existing.url !== def.url) changes.push(`url: ${existing.url} -> ${def.url}`);
          if (existing.type !== def.type) changes.push(`type: ${existing.type} -> ${def.type}`);
          if (existing.interval !== def.interval) {
            changes.push(`interval: ${existing.interval}s -> ${def.interval}s`);
          }

          if (changes.length > 0) {
            hasChanges = true;
            console.log(`  ${chalk.yellow("[~] MODIFY")} ${chalk.bold(def.name)}`);
            for (const ch of changes) {
              console.log(chalk.dim(`      ↳ ${ch}`));
            }
          } else {
            console.log(`  ${chalk.dim("[=] UNCHANGED")} ${chalk.dim(def.name)}`);
          }
        }
      }

      if (!hasChanges) {
        console.log(chalk.green("\n✔ No changes. Local definitions match remote state."));
      } else {
        console.log(chalk.dim("\nRun 'pulse monitors apply' to sync these changes."));
      }
    } catch (err) {
      spinner.fail("Failed to diff monitors");
      if (err instanceof ApiError) console.error(chalk.red(err.message));
    }
  });

// pulse monitors import (export all monitors to steadystack.yaml)
monitorsCmd
  .command("import")
  .description("Export all monitors to steadystack.yaml (Monitoring as Code snapshot)")
  .option("-o, --output <path>", "Output file path", "steadystack.yaml")
  .action(async (opts) => {
    const spinner = ora("Fetching monitors…").start();
    try {
      const { monitors } = await api.get<{ monitors: any[] }>("/api/cli/monitors");
      spinner.stop();

      const yamlContent = stringifyYaml({
        monitors: monitors.map((m) => ({
          name: m.name,
          url: m.url,
          type: m.type,
          interval: m.interval,
          method: m.method || "GET",
          alertThreshold: m.alertThreshold,
          ...(m.checkRegions ? { checkRegions: JSON.parse(m.checkRegions) } : {}),
        })),
      });

      writeFileSync(
        opts.output,
        `# SteadyStack Monitoring as Code\n# Generated: ${new Date().toISOString()}\n\n${yamlContent}`,
      );
      console.log(chalk.green(`✔ Exported ${monitors.length} monitors to ${opts.output}`));
    } catch (err) {
      spinner.fail("Failed to export monitors");
      if (err instanceof ApiError) console.error(chalk.red(err.message));
    }
  });

// pulse monitors create — interactive wizard
monitorsCmd
  .command("create")
  .description("Interactive wizard to create a new monitor")
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Monitor name:",
        validate: (input: string) => (input.trim() !== "" ? true : "Name cannot be empty"),
      },
      {
        type: "input",
        name: "url",
        message: "Monitor URL:",
        validate: (input: string | URL) => {
          try {
            new URL(input);
            return true;
          } catch {
            return "Invalid URL";
          }
        },
      },
      {
        type: "list",
        name: "type",
        message: "Monitor type:",
        choices: [
          "HTTP",
          "HTTPS",
          "PING",
          "PORT",
          "DNS",
          "SSL",
          "DOMAIN",
          "HEARTBEAT",
          "BROWSER",
          "SEQUENCE",
          "GRAPHQL",
          "WEBSOCKET",
          "DATABASE",
          "BGP",
          "MCP",
          "GRPC",
          "SMTP",
          "FTP",
          "ICMP",
          "MAIL",
        ],
        default: "HTTP",
      },
      {
        type: "input",
        name: "interval",
        message: "Check interval (seconds):",
        default: "60",
        validate: (input: string) =>
          /^\d+$/.test(input) && Number(input) > 0 ? true : "Must be a positive integer",
      },
    ]);

    const spinner = ora("Creating monitor…").start();
    try {
      const payload = {
        name: answers.name,
        url: answers.url,
        type: answers.type,
        interval: Number(answers.interval),
      };
      await api.post("/api/cli/monitors", payload);
      spinner.succeed("Monitor created");
    } catch (err) {
      spinner.fail("Failed to create monitor");
      if (err instanceof ApiError) console.error(chalk.red(err.message));
    }
  });

// pulse monitors delete <id>
monitorsCmd
  .command("delete <id>")
  .description("Delete a monitor")
  .action(async (id) => {
    const spinner = ora(`Deleting monitor ${id}…`).start();
    try {
      await api.delete(`/api/cli/monitors/${id}`);
      spinner.succeed("Monitor deleted");
    } catch (err) {
      spinner.fail("Failed to delete monitor");
      if (err instanceof ApiError) console.error(chalk.red(err.message));
    }
  });
