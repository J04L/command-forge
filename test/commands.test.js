import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const COMMANDS_DIR = path.join(ROOT, "commands");

function readCommand(name) {
  return fs.readFileSync(path.join(COMMANDS_DIR, `${name}.md`), "utf8");
}

test("el CLI descubre solo los comandos estables", () => {
  const commands = fs
    .readdirSync(COMMANDS_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();

  assert.deepEqual(commands, ["design.md", "forge.md"]);
});

test("forge tiene frontmatter, agent: build y $ARGUMENTS", () => {
  const text = readCommand("forge");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  assert.ok(frontmatter, "forge no tiene frontmatter");
  assert.match(frontmatter[1], /^description\s*:/m);
  assert.match(frontmatter[1], /^agent\s*:\s*build$/m);
  assert.match(text, /\$ARGUMENTS/);
  assert.match(text, /subagent/);
});

test("forge reparte la investigación entre agentes sin equipo fijo", () => {
  const text = readCommand("forge");

  assert.match(text, /Los agentes/);
  assert.match(text, /paralelo/);
  assert.match(text, /tocar código/);
  assert.doesNotMatch(text, /tres agentes|3 agentes/i);
});
