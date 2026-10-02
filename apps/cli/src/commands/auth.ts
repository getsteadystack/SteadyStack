import { Command } from "commander";
import chalk from "chalk";
import { setConfig, getConfig, clearConfig } from "../config.js";
import { api } from "../client.js";
import { t } from "../i18n.js";

export const authCmd = new Command("auth").description("Manage authentication");

authCmd
  .command("login")
  .description("Authenticate with a SteadyStack API key")
  .option("--key <apiKey>", "API key (pg_live_...)")
  .option("--url <baseUrl>", "Custom base URL (self-hosted instances)")
  .action(async (opts) => {
    let apiKey = opts.key as string | undefined;
    let baseUrl = opts.url as string | undefined;

    if (!apiKey) {
      console.log(
        chalk.dim(t("auth.login.generateHint") + " ") +
          chalk.cyan("https://steadystack.dev/dashboard/settings?tab=api-keys"),
      );
      console.error(chalk.red(t("auth.login.keyRequired")));
      process.exit(1);
    }

    // Temporarily set to test connectivity
    setConfig({ apiKey, baseUrl });

    try {
      const res = await api.get<{ monitors: any[] }>("/api/cli/monitors");
      console.log(chalk.green(t("auth.login.success")));
      console.log(chalk.dim(`  ${t("auth.login.foundMonitors", { count: res.monitors.length })}`));
    } catch (_) {
      clearConfig();
      console.error(chalk.red(t("auth.login.failed")));
      process.exit(1);
    }
  });

authCmd
  .command("logout")
  .description("Clear stored credentials")
  .action(() => {
    clearConfig();
    console.log(chalk.green(t("auth.logout.done")));
  });

authCmd
  .command("status")
  .description("Show current authentication status")
  .action(async () => {
    const config = getConfig();
    if (!config.apiKey) {
      console.log(
        chalk.yellow(t("auth.status.notLoggedIn") + " ") +
          chalk.bold("pulse auth login --key <API_KEY>"),
      );
      return;
    }
    console.log(chalk.green(t("auth.status.loggedIn")));
    console.log(chalk.dim(`  ${t("auth.status.keyPrefix")} ${config.apiKey.slice(0, 15)}…`));
    console.log(chalk.dim(`  ${t("auth.status.baseUrl")} ${config.baseUrl}`));
  });
