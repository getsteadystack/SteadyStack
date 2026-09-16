#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { authCmd } from "./commands/auth.js";
import { monitorsCmd } from "./commands/monitors.js";
import { triggerCmd } from "./commands/trigger.js";
import { logsCmd } from "./commands/logs.js";
import { waitCmd } from "./commands/wait.js";
import { importCmd } from "./commands/import-kuma.js";
import { initLocale } from "./i18n.js";

const program = new Command();

program
  .name("steadystack")
  .description(
    chalk.bold("SteadyStack CLI") +
      " — Monitoring as Code, live debugging, and CI/CD integration\n" +
      chalk.dim("  https://steadystack.dev/docs/cli"),
  )
  .version("0.1.0")
  .option(
    "--locale <locale>",
    "Output language (en, es, fr, de, pt-BR, ja, ko, zh-CN, ar). Defaults to STEADYSTACK_LOCALE or the system locale.",
  );

// Resolve the locale before any command runs so t() is bound early.
program.hook("preAction", (thisCommand) => {
  const opts = thisCommand.opts() as { locale?: string };
  initLocale(opts.locale);
});

program.addCommand(authCmd);
program.addCommand(monitorsCmd);
program.addCommand(importCmd);
program.addCommand(triggerCmd);
program.addCommand(logsCmd);
program.addCommand(waitCmd);

// Helpful aliases at the top level
program.on("command:*", () => {
  console.error(chalk.red(`Unknown command: ${program.args.join(" ")}`));
  console.log(chalk.dim("Run 'steadystack --help' or 'ss --help' for available commands."));
  process.exit(1);
});

program.parse();
