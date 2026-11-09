# command-forge — instrucciones del proyecto

## Propósito

Colección de comandos reutilizables para harness de agentes como OpenCode. Se
instalan con `npx` en `.opencode/commands/` (proyecto) o en
`~/.config/opencode/commands/` (global), sin copiar prompts a mano.

Los comandos principales son `/design` y `/forge`, pero el proyecto está pensado
para crecer con más comandos.

## Estado actual

- **Versión:** `0.3.1`.
- **Comandos estables:** `commands/design.md` (la **V2.1 coordinadora**) y
  `commands/forge.md` (investigación con varios agentes).
- `commands/design.md` y `versions/design-v2.md` deben ser **idénticos**. Si se
  cambia uno, se sincroniza el otro y se ejecutan los tests.
- **Repo:** <https://github.com/J04L/command-forge>
- **Release:** `v0.3.1`.
- **Pendiente:** validar `/forge` con un segundo caso.
- `experiments/` es local, está ignorado por git y contiene los laboratorios de
  Nexo y capturas. No se commitea.

## Arquitectura

```text
.
├── bin/cli.js              # CLI npx, sin dependencias externas
├── commands/design.md      # comando estable /design
├── commands/forge.md       # comando estable /forge
├── versions/               # experimentos y versiones históricas
├── docs/                   # distribución y resultados
├── test/                   # tests del CLI y de las versiones
├── package.json
└── README.md
```

- `bin/cli.js` descubre `commands/**/*.md`, copia los comandos a
  `.opencode/commands/` o global, y soporta `list`, `add`, `remove`, `--force`,
  `--dry-run`, `--all`, `--json`.
- `commands/` contiene **solo comandos estables**. Las subcarpetas se convierten
  en nombres con `/`: `commands/team/review.md` → `/team/review`.
- `versions/` contiene experimentos y versiones históricas. **No** se instalan
  con el CLI.
- `docs/` documenta distribución, decisiones y resultados.
- `test/` usa `node --test`; `npm test` debe pasar antes de cada commit.

## Cómo añadir un comando

1. Crear `commands/<nombre>.md` con frontmatter `description` y, si escribe
   archivos, `agent: build`.
2. Usar `$ARGUMENTS` para el argumento completo o `$1`, `$2` para posiciones.
3. Mantenerlo corto y específico. Evitar sobre-especificar: no repetir lo que el
   agente ya sabe, no llenarlo de prohibiciones genéricas y no añadir secciones
   de skills salvo que el comando las necesite de verdad.
4. Si coordina varios agentes, usar la herramienta `subagent` y crear un
   `context.md` compartido **solo** cuando haya más de un agente. Para un solo
   agente, el contexto de la conversación es suficiente.
5. Añadir o actualizar tests si el comando cambia la estructura del repo.
6. Ejecutar `npm test`, `node bin/cli.js list` y `npm pack --dry-run`.
7. Actualizar `README.md` si el comando es visible para el usuario.
8. Commit. No publicar en npm ni crear releases sin confirmación.

## Convenciones de diseño de comandos

- Los comandos se escriben en español; el copy de los diseños va en el idioma
  del brief.
- El agente principal puede actuar como coordinador. Los subagentes `general`
  **no pueden lanzar más subagentes**; si un comando necesita coordinación, debe
  ejecutarse en una sesión primaria `build`.
- Patrón actual de `/design`:
  1. escuchar y extender el contexto;
  2. definir tres territorios A/B/C;
  3. preparar `.design-lab/runs/<fecha-hora-slug>/` con `context.md`, `shared/`,
     `a/`, `b/`, `c/` y comparador;
  4. lanzar tres subagentes en paralelo con directrices personalizadas;
  5. revisar, comparar y recomendar;
  6. no integrar en la app real hasta que el usuario elija.
- Permitir investigar fuera del laboratorio: repo, tokens, páginas existentes,
  referencias externas y competencia. No copiar literalmente.
- Pasar a los subagentes las **anti-referencias** y el **contenido compartido**
  completos, no solo el tono.
- Si se usan datos de ejemplo, que se lean como ejemplo; no atribuir
  testimonios, logos o clientes reales sin permiso.
- No repetir “no instales nada” o “no toques la app real” en cada sección: una
  frontera clara al principio es suficiente.

## Flujo de trabajo

```bash
npm test
node bin/cli.js list
npm pack --dry-run
git status --short
```

Antes de terminar una tarea:

- `npm test` en verde.
- `git status` limpio (o solo cambios intencionados).
- Cambios commiteados y `main` sincronizado con `origin/main`.
- No commitear `experiments/`, `.design-lab/`, `node_modules/` ni tarballs.
- No publicar en npm, no crear releases y no cambiar el nombre del paquete/repo
  sin confirmación explícita.

## Documentación

- [`README.md`](README.md) — uso e instalación.
- [`docs/distribucion.md`](docs/distribucion.md) — publicar y distribuir con npx.
- [`docs/experimento-nexo.md`](docs/experimento-nexo.md) — resultados del
  experimento de diseño.
- [`versions/README.md`](versions/README.md) — variantes y protocolo de prueba.
