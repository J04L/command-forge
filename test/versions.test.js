import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const VERSIONS_DIR = path.join(ROOT, "versions");

const versions = [
  "design-contract.md",
  "design-director.md",
  "design-lean.md",
  "design-hybrid.md",
];

function readVersion(file) {
  return fs.readFileSync(path.join(VERSIONS_DIR, file), "utf8");
}

test("existen las versiones de experimento", () => {
  for (const file of versions) {
    assert.ok(fs.existsSync(path.join(VERSIONS_DIR, file)), `Falta ${file}`);
  }
});

test("cada versión tiene frontmatter, agent: build y $ARGUMENTS", () => {
  for (const file of versions) {
    const text = readVersion(file);
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    assert.ok(frontmatter, `${file} no tiene frontmatter`);
    assert.match(frontmatter[1], /^description\s*:/m, `${file} sin description`);
    assert.match(frontmatter[1], /^agent\s*:\s*build$/m, `${file} sin agent: build`);
    assert.match(text, /\$ARGUMENTS/, `${file} sin $ARGUMENTS`);
  }
});

test("las versiones comparten los invariantes del comando", () => {
  for (const file of versions) {
    const text = readVersion(file);

    assert.match(text, /\.design-lab/, `${file} sin laboratorio`);
    assert.match(text, /A\/B\/C|tres direcciones/i, `${file} sin A/B/C`);
    assert.match(text, /skill/i, `${file} sin skills`);
    assert.match(text, /integra/i, `${file} sin gate de integración`);
    assert.match(text, /NO VERIFICADO/i, `${file} sin regla de honestidad`);
  }
});

test("las descripciones de las versiones son distintas", () => {
  const descriptions = versions.map((file) => {
    const text = readVersion(file);
    return text.match(/^description\s*:\s*"?(.+?)"?\s*$/m)?.[1];
  });

  assert.equal(new Set(descriptions).size, versions.length);
});

test("el CLI solo descubre el comando estable", () => {
  const commands = fs
    .readdirSync(path.join(ROOT, "commands"))
    .filter((file) => file.endsWith(".md"));

  assert.deepEqual(commands, ["design.md"]);
});
