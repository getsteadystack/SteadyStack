import fs from "node:fs";
import path from "node:path";

const roots = ["apps", "packages"];
let hasError = false;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".turbo" ||
      entry.name === "generated" ||
      entry.name.startsWith(".")
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile()) {
      // Check files under apps/*/src and apps/*/app
      if (
        fullPath.includes(path.join("apps", "web", "src")) ||
        fullPath.includes(path.join("apps", "worker", "src"))
      ) {
        // Exclude special Next.js files or README/LICENSE
        const basename = entry.name;
        if (basename !== "README.md" && basename !== "LICENSE" && basename !== "CHANGELOG.md") {
          // Check for uppercase letters
          if (/[A-Z]/.test(basename)) {
            console.error(`❌ Filename contains uppercase chars: ${fullPath}`);
            hasError = true;
          }
        }
      }
    }
  }
}

for (const root of roots) {
  scanDir(root);
}

if (hasError) {
  console.error("All source files must follow kebab-case naming.");
  process.exit(1);
} else {
  console.log("All source files follow kebab-case naming.");
}
