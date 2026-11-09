import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const CLI = path.join(ROOT, "bin", "cli.js");

function makeWorkspace() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "oc-commands-"));
  const project = path.join(root, "project");
  const home = path.join(root, "home");
  const config = path.join(home, ".config");

  fs.mkdirSync(project, { recursive: true });
  fs.mkdirSync(home, { recursive: true });

  return { root, project, home, config };
}

function run(args, workspace, extraEnv = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: workspace.project,
    encoding: "utf8",
    env: {
      ...process.env,
      NO_COLOR: "1",
      HOME: workspace.home,
      XDG_CONFIG_HOME: workspace.config,
      ...extraEnv,
    },
  });
}

function projectCommand(workspace, name = "design") {
  return path.join(workspace.project, ".opencode", "commands", `${name}.md`);
}

test("list muestra los comandos disponibles", () => {
  const workspace = makeWorkspace();
  const result = run(["list"], workspace);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Comandos disponibles/);
  assert.match(result.stdout, /design/);
  assert.match(result.stdout, /direcciones A\/B\/C/);
});

test("list --json devuelve datos parseables", () => {
  const workspace = makeWorkspace();
  const result = run(["list", "--json"], workspace);

  assert.equal(result.status, 0);
  const data = JSON.parse(result.stdout);
  assert.equal(data.name, "command-forge");
  assert.equal(data.commands[0].name, "design");
  assert.ok(data.commands[0].description.length > 10);
});

test("add instala el comando en .opencode/commands", () => {
  const workspace = makeWorkspace();
  const result = run(["add", "design"], workspace);

  assert.equal(result.status, 0);
  const target = projectCommand(workspace);
  assert.ok(fs.existsSync(target));
  assert.match(fs.readFileSync(target, "utf8"), /\*\*Idea inicial:\*\*/);
  assert.match(result.stdout, /1 comando\(s\) instalado\(s\)/);
});

test("add no sobrescribe un comando modificado sin --force", () => {
  const workspace = makeWorkspace();
  run(["add", "design"], workspace);

  const target = projectCommand(workspace);
  fs.appendFileSync(target, "\n\nCambio local\n");

  const result = run(["add", "design"], workspace);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /ya existe y es distinto/);
  assert.match(fs.readFileSync(target, "utf8"), /Cambio local/);
});

test("add --force sobrescribe un comando modificado", () => {
  const workspace = makeWorkspace();
  run(["add", "design"], workspace);

  const target = projectCommand(workspace);
  fs.appendFileSync(target, "\n\nCambio local\n");

  const result = run(["add", "design", "--force"], workspace);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /sobrescrito/);
  assert.doesNotMatch(fs.readFileSync(target, "utf8"), /Cambio local/);
});

test("add avisa si el comando no existe", () => {
  const workspace = makeWorkspace();
  const result = run(["add", "no-existe"], workspace);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /No existe el comando/);
});

test("add --global usa el directorio de configuración global", () => {
  const workspace = makeWorkspace();
  const result = run(["add", "design", "--global"], workspace);

  assert.equal(result.status, 0);
  assert.ok(
    fs.existsSync(
      path.join(workspace.config, "opencode", "commands", "design.md"),
    ),
  );
  assert.ok(!fs.existsSync(projectCommand(workspace)));
});

test("add --dir usa un directorio personalizado", () => {
  const workspace = makeWorkspace();
  const result = run(
    ["add", "design", "--dir", "custom/commands"],
    workspace,
  );

  assert.equal(result.status, 0);
  assert.ok(
    fs.existsSync(path.join(workspace.project, "custom", "commands", "design.md")),
  );
});

test("add --dry-run no escribe archivos", () => {
  const workspace = makeWorkspace();
  const result = run(["add", "design", "--dry-run"], workspace);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /se crearía/);
  assert.ok(!fs.existsSync(projectCommand(workspace)));
});

test("add --all instala todos los comandos", () => {
  const workspace = makeWorkspace();
  const result = run(["add", "--all"], workspace);

  assert.equal(result.status, 0);
  assert.ok(fs.existsSync(projectCommand(workspace)));
});

test("remove elimina un comando instalado", () => {
  const workspace = makeWorkspace();
  run(["add", "design"], workspace);

  const result = run(["remove", "design"], workspace);

  assert.equal(result.status, 0);
  assert.ok(!fs.existsSync(projectCommand(workspace)));
  assert.match(result.stdout, /eliminado/);
});

test("remove avisa si el comando no está instalado", () => {
  const workspace = makeWorkspace();
  const result = run(["remove", "design"], workspace);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /no está instalado/);
});

test("--global y --dir son incompatibles", () => {
  const workspace = makeWorkspace();
  const result = run(
    ["add", "design", "--global", "--dir", "tmp"],
    workspace,
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /no ambos/);
});

test("help y version funcionan", () => {
  const workspace = makeWorkspace();

  const help = run(["help"], workspace);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Uso:/);
  assert.match(help.stdout, /npx github:J04L\/command-forge/);

  const version = run(["--version"], workspace);
  assert.equal(version.status, 0);
  assert.equal(version.stdout.trim(), "0.3.1");
});
