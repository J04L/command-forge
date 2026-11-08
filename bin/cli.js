#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const COMMANDS_DIR = path.join(ROOT, "commands");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));

const useColor =
  Boolean(process.stdout.isTTY) &&
  !process.env.NO_COLOR &&
  process.env.TERM !== "dumb";

const style = (code) => (value) =>
  useColor ? `\u001b[${code}m${value}\u001b[0m` : String(value);

const bold = style("1");
const dim = style("2");
const green = style("32");
const yellow = style("33");
const red = style("31");
const cyan = style("36");

class CliError extends Error {}

function fail(message) {
  throw new CliError(message);
}

function parseArgs(argv) {
  const flags = {
    global: false,
    force: false,
    dryRun: false,
    all: false,
    help: false,
    version: false,
    json: false,
    dir: null,
  };
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--global" || arg === "-g") {
      flags.global = true;
    } else if (arg === "--force" || arg === "-f") {
      flags.force = true;
    } else if (arg === "--dry-run") {
      flags.dryRun = true;
    } else if (arg === "--all") {
      flags.all = true;
    } else if (arg === "--help" || arg === "-h") {
      flags.help = true;
    } else if (arg === "--version" || arg === "-v") {
      flags.version = true;
    } else if (arg === "--json") {
      flags.json = true;
    } else if (arg === "--dir" || arg === "-d") {
      const value = argv[index + 1];
      if (!value || value.startsWith("-")) fail("Falta el valor de --dir.");
      flags.dir = value;
      index += 1;
    } else if (arg.startsWith("--dir=")) {
      const value = arg.slice("--dir=".length);
      if (!value) fail("Falta el valor de --dir.");
      flags.dir = value;
    } else if (arg.startsWith("-")) {
      fail(`Opción desconocida: ${arg}`);
    } else {
      positionals.push(arg);
    }
  }

  if (flags.global && flags.dir) {
    fail("Usa --global o --dir, pero no ambos a la vez.");
  }

  return { flags, positionals };
}

function normalizeName(name) {
  return name
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/^\//, "")
    .replace(/\.md$/, "");
}

function readDescription(file) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  } catch {
    return "";
  }

  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!frontmatter) return "";

  const line = frontmatter[1]
    .split(/\r?\n/)
    .find((entry) => /^description\s*:/.test(entry));

  if (!line) return "";

  let value = line.slice(line.indexOf(":") + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return value;
}

function walkCommands(directory, base = "") {
  const commands = [];

  if (!fs.existsSync(directory)) return commands;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

    const fullPath = path.join(directory, entry.name);
    const relative = path.join(base, entry.name);

    if (entry.isDirectory()) {
      commands.push(...walkCommands(fullPath, relative));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      const name = relative.replace(/\\/g, "/").replace(/\.md$/i, "");
      commands.push({
        name,
        file: fullPath,
        description: readDescription(fullPath),
      });
    }
  }

  return commands;
}

function discoverCommands() {
  return walkCommands(COMMANDS_DIR).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
}

function expandHome(value) {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
  return value;
}

function resolveDestination(flags) {
  if (flags.dir) {
    return path.resolve(process.cwd(), expandHome(flags.dir));
  }

  if (flags.global) {
    const configHome =
      process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
    return path.join(configHome, "opencode", "commands");
  }

  return path.join(process.cwd(), ".opencode", "commands");
}

function displayPath(target) {
  const relative = path.relative(process.cwd(), target);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) {
    return relative;
  }
  return target;
}

function listCommands(flags) {
  const commands = discoverCommands();

  if (flags.json) {
    console.log(
      JSON.stringify(
        {
          name: pkg.name,
          version: pkg.version,
          commands: commands.map(({ name, description }) => ({
            name,
            description,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`${bold(pkg.name)} ${dim(`v${pkg.version}`)}`);
  console.log();

  if (commands.length === 0) {
    console.log(yellow("No hay comandos disponibles en este paquete."));
    return;
  }

  const width = Math.max(...commands.map((command) => command.name.length));
  console.log(bold("Comandos disponibles:"));
  console.log();

  for (const command of commands) {
    const name = command.name.padEnd(width);
    console.log(
      `  ${cyan(name)}  ${command.description || dim("(sin descripción)")}`,
    );
  }

  console.log();
  console.log(
    `${dim("Instalar en el proyecto:")}  npx ${pkg.name} add <comando>`,
  );
  console.log(
    `${dim("Instalar global:")}          npx ${pkg.name} add <comando> --global`,
  );
  console.log(
    `${dim("Instalar todo:")}            npx ${pkg.name} add --all`,
  );
}

function addCommands(names, flags) {
  const available = discoverCommands();

  if (available.length === 0) {
    fail("Este paquete no contiene comandos.");
  }

  if (names.length === 0 && !flags.all) {
    listCommands(flags);
    console.log();
    fail("Especifica al menos un comando o usa --all.");
  }

  const requested = flags.all
    ? available.map((command) => command.name)
    : names.map(normalizeName);

  const destination = resolveDestination(flags);
  const actions = [];
  const errors = [];

  for (const name of requested) {
    const command = available.find((entry) => entry.name === name);

    if (!command) {
      errors.push(
        `No existe el comando "${name}". Disponibles: ${available
          .map((entry) => entry.name)
          .join(", ")}.`,
      );
      continue;
    }

    const target = path.join(destination, `${command.name}.md`);
    const exists = fs.existsSync(target);
    const sameContent =
      exists &&
      fs.readFileSync(target, "utf8") === fs.readFileSync(command.file, "utf8");

    if (exists && sameContent) {
      actions.push({
        status: "unchanged",
        name: command.name,
        target,
      });
      continue;
    }

    if (exists && !flags.force) {
      actions.push({
        status: "skipped",
        name: command.name,
        target,
      });
      continue;
    }

    if (flags.dryRun) {
      actions.push({
        status: exists ? "would-overwrite" : "would-create",
        name: command.name,
        target,
      });
      continue;
    }

    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(command.file, target);
    actions.push({
      status: exists ? "overwritten" : "created",
      name: command.name,
      target,
    });
  }

  console.log(
    `${flags.dryRun ? "Simulación" : "Destino"}: ${displayPath(destination)}`,
  );
  console.log();

  for (const action of actions) {
    const target = displayPath(action.target);

    if (action.status === "created") {
      console.log(`  ${green("✓")} ${bold(action.name)} → ${target}`);
    } else if (action.status === "overwritten") {
      console.log(`  ${green("✓")} ${bold(action.name)} → ${target} ${dim("(sobrescrito)")}`);
    } else if (action.status === "unchanged") {
      console.log(`  ${dim("=")} ${action.name} ${dim("(sin cambios)")}`);
    } else if (action.status === "skipped") {
      console.log(
        `  ${yellow("!")} ${action.name} ${dim("(ya existe y es distinto; usa --force)")}`,
      );
    } else if (action.status === "would-create") {
      console.log(`  ${cyan("~")} ${action.name} → ${target} ${dim("(se crearía)")}`);
    } else if (action.status === "would-overwrite") {
      console.log(
        `  ${cyan("~")} ${action.name} → ${target} ${dim("(se sobrescribiría)")}`,
      );
    }
  }

  console.log();

  const installed = actions.filter((action) =>
    ["created", "overwritten"].includes(action.status),
  ).length;
  const skipped = actions.filter((action) => action.status === "skipped").length;

  if (flags.dryRun) {
    console.log(dim("No se ha escrito ningún archivo (--dry-run)."));
  } else if (installed > 0) {
    console.log(green(`${installed} comando(s) instalado(s).`));
    if (installed === 1 && actions.some((a) => a.status === "created")) {
      const command = actions.find((a) => a.status === "created");
      console.log(
        `${dim("En OpenCode:")} /${command.name} <brief>`,
      );
    }
  } else if (skipped === 0) {
    console.log(dim("No había nada que instalar."));
  }

  if (errors.length > 0) {
    console.error();
    for (const error of errors) console.error(red(`Error: ${error}`));
    process.exitCode = 1;
  }
}

function removeCommands(names, flags) {
  const available = discoverCommands();

  if (names.length === 0 && !flags.all) {
    fail("Especifica al menos un comando o usa --all.");
  }

  const requested = flags.all
    ? available.map((command) => command.name)
    : names.map(normalizeName);
  const destination = resolveDestination(flags);
  let removed = 0;
  let missing = 0;

  console.log(
    `${flags.dryRun ? "Simulación" : "Destino"}: ${displayPath(destination)}`,
  );
  console.log();

  for (const name of requested) {
    const target = path.join(destination, `${name}.md`);

    if (!fs.existsSync(target)) {
      console.log(`  ${dim("-")} ${name} ${dim("(no está instalado)")}`);
      missing += 1;
      continue;
    }

    if (flags.dryRun) {
      console.log(`  ${cyan("~")} ${name} ${dim("(se eliminaría)")}`);
      continue;
    }

    fs.unlinkSync(target);
    console.log(`  ${green("✓")} ${name} ${dim("eliminado")}`);
    removed += 1;
  }

  console.log();
  console.log(
    flags.dryRun
      ? dim("No se ha eliminado ningún archivo (--dry-run).")
      : `${removed} comando(s) eliminado(s).`,
  );

  if (missing > 0 && removed === 0) {
    process.exitCode = 1;
  }
}

function printHelp() {
  console.log(`${bold(pkg.name)} ${dim(`v${pkg.version}`)}`);
  console.log(
    dim("Comandos reutilizables para OpenCode y otros harness de agentes."),
  );
  console.log();
  console.log(bold("Uso:"));
  console.log(`  npx ${pkg.name} <comando> [opciones]`);
  console.log();
  console.log(bold("Comandos:"));
  console.log("  list, ls                 Lista los comandos disponibles");
  console.log("  add, install <nombre...> Instala comandos en .opencode/commands");
  console.log("  remove, rm <nombre...>   Elimina comandos instalados");
  console.log("  help                     Muestra esta ayuda");
  console.log();
  console.log(bold("Opciones:"));
  console.log("  -g, --global             Usa ~/.config/opencode/commands");
  console.log("  -d, --dir <ruta>         Directorio de destino personalizado");
  console.log("  -f, --force              Sobrescribe archivos existentes");
  console.log("      --all                Aplica a todos los comandos del paquete");
  console.log("      --dry-run            Muestra qué haría sin escribir nada");
  console.log("      --json               Salida JSON para list");
  console.log("  -h, --help               Muestra esta ayuda");
  console.log("  -v, --version            Muestra la versión");
  console.log();
  console.log(bold("Ejemplos:"));
  console.log(`  npx ${pkg.name} list`);
  console.log(`  npx ${pkg.name} add design`);
  console.log(`  npx ${pkg.name} add design --global`);
  console.log(`  npx ${pkg.name} add --all --force`);
  console.log(`  npx ${pkg.name} remove design`);
  console.log();
  console.log(
    `${dim("Desde GitHub, sin publicar en npm:")} npx github:J04L/${pkg.name} add design`,
  );
}

function main() {
  const { flags, positionals } = parseArgs(process.argv.slice(2));

  if (flags.version) {
    console.log(pkg.version);
    return;
  }

  if (flags.help) {
    printHelp();
    return;
  }

  const [action = "help", ...names] = positionals;

  switch (action) {
    case "list":
    case "ls":
      listCommands(flags);
      break;
    case "add":
    case "install":
      addCommands(names, flags);
      break;
    case "remove":
    case "rm":
    case "uninstall":
      removeCommands(names, flags);
      break;
    case "help":
      printHelp();
      break;
    default:
      fail(
        `Comando desconocido: "${action}". Usa "npx ${pkg.name} help" para ver la ayuda.`,
      );
  }
}

try {
  main();
} catch (error) {
  if (error instanceof CliError) {
    console.error(red(`Error: ${error.message}`));
  } else {
    console.error(error);
  }
  process.exitCode = 1;
}
