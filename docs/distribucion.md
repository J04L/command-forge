# Cómo publicar y distribuir los comandos con npx

Este documento explica cómo pasar de un repositorio local a:

```bash
npx opencode-commands add design
```

en cualquier proyecto, sin copiar archivos a mano.

## Resumen

| Opción | Comando para el usuario | Cuándo usarla |
| --- | --- | --- |
| npm + npx | `npx opencode-commands add design` | Distribución pública, versiones y actualizaciones sencillas. |
| GitHub + npx | `npx github:J04L/opencode-commands add design` | Antes de publicar en npm o para un repo privado. |
| Instalador `curl` | `curl -fsSL ... \| bash` | Si quieres una experiencia sin Node, como hacen algunos plugins. |

## Por qué no vale `npx skills add`

El CLI de skills (`npx skills add`) instala archivos `SKILL.md` en directorios de
skills (`.agents/skills/`, `~/.config/opencode/skills/`, etc.). No instala
comandos de OpenCode.

Los comandos de OpenCode son archivos Markdown en:

```text
.opencode/commands/<nombre>.md        # proyecto
~/.config/opencode/commands/<nombre>.md  # global
```

Un plugin de OpenCode tampoco registra comandos automáticamente: los plugins
sirven para tools, hooks y transformaciones. La forma fiable de distribuir
comandos es un paquete npm con un `bin` que copie los `.md` a la carpeta
correcta. Eso es exactamente lo que hace este proyecto.

## Opción 1: publicar en npm (recomendada)

### 1. Comprueba el nombre

```bash
npm view opencode-commands version
```

Si devuelve 404, el nombre está libre. Si ya está ocupado, usa un scope:

```bash
npm init --scope=@tu-usuario
```

y publica con:

```bash
npm publish --access public
```

En ese caso el comando para tus usuarios sería:

```bash
npx @tu-usuario/opencode-commands add design
```

### 2. Inicia sesión y publica

```bash
npm login
npm whoami
npm publish --access public
```

El campo `files` de `package.json` limita lo que se sube a `bin/`, `commands/`,
`docs/`, `README.md` y `LICENSE`. Puedes revisar el contenido antes con:

```bash
npm pack --dry-run
```

### 3. Verifica

```bash
npm view opencode-commands version
npx -y opencode-commands@latest list
npx -y opencode-commands@latest add design --dry-run
```

### 4. Publica una versión nueva

```bash
npm version patch   # o minor / major
git push --follow-tags
npm publish --access public
```

Los usuarios actualizan con:

```bash
npx opencode-commands@latest add design --force
```

`--force` es necesario si el comando local ya existe y es distinto; si es
idéntico, el CLI lo detecta y no lo toca.

## Opción 2: instalar directamente desde GitHub

No necesitas publicar en npm. `npx` acepta especificaciones de git:

```bash
npx github:J04L/opencode-commands add design
```

También puedes fijar una rama, un tag o un commit:

```bash
npx github:J04L/opencode-commands#v0.1.0 add design
npx github:J04L/opencode-commands#main add design
```

Para un repositorio privado, `npx` usa tus credenciales de git (SSH o HTTPS).
En CI necesitarás un token con acceso de lectura.

Ventajas:

- Funciona desde el primer commit.
- No hay que crear cuenta en npm.
- Puedes fijar versiones con tags.

Inconvenientes:

- `npx` puede cachear la resolución; usa un tag o `@latest` para forzar una
  versión reciente.
- La instalación es algo más lenta que npm.
- No tienes página de paquete, descargas ni `npm audit` del paquete.

## Opción 3: instalador con curl (opcional)

Si quieres una experiencia tipo:

```bash
curl -fsSL https://raw.githubusercontent.com/J04L/opencode-commands/main/install.sh | bash
```

puedes añadir un `install.sh` que descargue los `.md` y los copie a
`.opencode/commands/` o `~/.config/opencode/commands/`. Es útil para usuarios sin
Node, pero pierdes la gestión de versiones y actualizaciones de npm. Si algún día
lo añades, documenta siempre las opciones `--global`, `--force` y `--dry-run`.

## Cómo funciona el CLI

`package.json` declara:

```json
{
  "bin": {
    "opencode-commands": "bin/cli.js"
  }
}
```

Cuando alguien ejecuta `npx opencode-commands add design`:

1. npm descarga el paquete (o lo reutiliza de su caché).
2. npm ejecuta `bin/cli.js` con el argumento `add design`.
3. El CLI busca `commands/design.md` dentro del paquete.
4. Lo copia a `.opencode/commands/design.md` del proyecto actual.

El CLI no necesita dependencias externas: solo usa módulos nativos de Node.

## Publicación automática con GitHub Actions

El repositorio incluye `.github/workflows/publish.yml`. Para activarlo:

1. Crea un token en npm con permiso de publicación.
2. Guárdalo como secreto `NPM_TOKEN` en
   `Settings → Secrets and variables → Actions`.
3. Publica un release en GitHub o lanza el workflow manualmente.

También puedes usar **trusted publishing** de npm (OIDC) y eliminar el secreto;
en ese caso el workflow necesita `permissions: id-token: write` y hay que
configurar el repositorio como trusted publisher en npmjs.com.

## Checklist antes de anunciarlo

- [ ] `npm test` pasa.
- [ ] `npm pack --dry-run` incluye `bin/`, `commands/` y la documentación.
- [ ] `node bin/cli.js list` muestra el comando.
- [ ] `node bin/cli.js add design --dry-run` funciona en un proyecto temporal.
- [ ] `npx -y opencode-commands@latest list` funciona tras publicar.
- [ ] El README explica instalación global, proyecto y GitHub.
- [ ] Hay una versión (`v0.1.0`) y un release en GitHub.
- [ ] `LICENSE` y `repository` están correctos en `package.json`.

## Seguridad

Los comandos son prompts que se ejecutan con los permisos del agente. Antes de
instalar un comando de terceros:

- Lee el `.md` completo, especialmente los bloques `!` (shell) y las rutas que
  toca.
- Revisa si modifica configuración, instala dependencias o escribe fuera del
  proyecto.
- Instala primero en un proyecto de prueba con `--dry-run`.

Este paquete no incluye bloques de shell en `/design`; el agente crea el
laboratorio y ejecuta el servidor con las herramientas normales de OpenCode.
