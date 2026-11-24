import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The entry: one dad joke, at most 200 characters, written to /output/entry.txt.
const FALLBACK =
  'My son said, "Dad, your jokes are getting old." I said, "They\'re not old, son. They\'re fully groan."';

function loadEntry(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const file = join(here, "entry.txt");
  if (existsSync(file)) {
    return readFileSync(file, "utf8");
  }
  return FALLBACK;
}

function main(): void {
  const text = loadEntry();
  // Gate check: the scorer only judges UTF-8 text of 1 to 200 characters
  // that is not only white space, so fail loudly here instead of silently
  // writing an entry that can never be judged.
  if (text.trim().length === 0 || [...text].length > 200) {
    throw new Error(
      `entry must be 1-200 characters and not only white space (got ${[...text].length})`,
    );
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "entry.txt");
  writeFileSync(outFile, text, "utf8");
  // Read back what was written: a truncated or corrupted write must fail
  // here, not in front of the judge.
  const written = readFileSync(outFile, "utf8");
  if (written !== text) {
    throw new Error("written output does not match entry.txt");
  }
  console.log(`wrote ${[...text].length} chars to ${outFile}`);
}

main();
