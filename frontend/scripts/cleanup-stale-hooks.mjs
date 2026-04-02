import { chmod, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(frontendDir, "..");

const staleHookSignatures = [
  "npm --prefix frontend exec lint-staged -- --cwd frontend",
  "npm --prefix frontend run lint-staged",
];

const hookCandidates = [
  path.join(repoRoot, ".git", "hooks", "pre-commit"),
  path.join(frontendDir, ".git", "hooks", "pre-commit"),
];

const isMissingFileError = (error) =>
  error && typeof error === "object" && "code" in error && error.code === "ENOENT";

const isPermissionError = (error) =>
  error && typeof error === "object" && "code" in error && ["EACCES", "EPERM"].includes(error.code);

for (const hookPath of hookCandidates) {
  try {
    const hookBody = await readFile(hookPath, "utf8");
    if (!staleHookSignatures.some((signature) => hookBody.includes(signature))) {
      continue;
    }

    await chmod(hookPath, 0o644).catch(() => {});
    await rm(hookPath, { force: true });
    console.log(`[cleanup-stale-hooks] Removed stale hook: ${path.relative(repoRoot, hookPath)}`);
  } catch (error) {
    if (isMissingFileError(error)) {
      continue;
    }

    if (isPermissionError(error)) {
      console.warn(
        `[cleanup-stale-hooks] No permission to remove ${path.relative(repoRoot, hookPath)}. Remove it manually once.`
      );
      continue;
    }

    throw error;
  }
}
