import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const rootEnv = path.join(rootDir, ".env");
const rootEnvExample = path.join(rootDir, ".env.example");
const webEnv = path.join(rootDir, "apps", "web", ".env");
const workerDevVars = path.join(rootDir, "apps", "worker", ".dev.vars");

function sync() {
  let envContent = "";

  if (fs.existsSync(rootEnv)) {
    envContent = fs.readFileSync(rootEnv, "utf8");
  } else if (fs.existsSync(rootEnvExample)) {
    console.log("ℹ️ Root .env not found. Copying .env.example to .env...");
    envContent = fs.readFileSync(rootEnvExample, "utf8");
    fs.writeFileSync(rootEnv, envContent, "utf8");
  } else if (fs.existsSync(webEnv)) {
    envContent = fs.readFileSync(webEnv, "utf8");
    fs.writeFileSync(rootEnv, envContent, "utf8");
  }

  if (envContent) {
    fs.mkdirSync(path.dirname(webEnv), { recursive: true });
    fs.writeFileSync(webEnv, envContent, "utf8");

    fs.mkdirSync(path.dirname(workerDevVars), { recursive: true });
    fs.writeFileSync(workerDevVars, envContent, "utf8");

    console.log("✅ Synced environment variables to apps/web/.env and apps/worker/.dev.vars");
  } else {
    console.warn("⚠️ No .env found to sync.");
  }
}

sync();
