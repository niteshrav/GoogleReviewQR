import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ENV_FILENAMES = [".env.local", ".env"];

export function parseDotEnvContents(contents: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }

  return result;
}

export function findRepoRoot(start = process.cwd()): string {
  let dir = start;
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(path.join(dir, "database", "schema.prisma"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return start;
}

/** Load repo-root .env into process.env. Next.js only auto-loads frontend/.env. */
export function loadRootEnv(start = process.cwd()): string {
  const root = findRepoRoot(start);

  for (const name of ENV_FILENAMES) {
    const filePath = path.join(root, name);
    if (!existsSync(filePath)) {
      continue;
    }

    const parsed = parseDotEnvContents(readFileSync(filePath, "utf8"));
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined || process.env[key] === "") {
        process.env[key] = value;
      }
    }
  }

  return root;
}
