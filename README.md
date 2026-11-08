# command-forge

Comandos reutilizables para [OpenCode](https://opencode.ai). Instálalos en
cualquier proyecto con `npx`, sin copiar y pegar prompts a mano.

Repositorio: <https://github.com/J04L/command-forge>

## Comandos

| Comando | Qué hace |
| --- | --- |
| `/design <brief>` | Explora **3 direcciones de diseño web (A/B/C)** para un brief, las construye en un laboratorio aislado, las verifica en el navegador y las compara antes de tocar el proyecto real. |

## Versiones en experimentación

La versión estable es `commands/design.md`. En `versions/` hay tres variantes para
probar en paralelo con el mismo proyecto y el mismo brief:

- `design-contract.md` — contract-first: artefactos, presupuesto, gates y evidencia.
- `design-director.md` — creative-director: tesis, matriz de ejes, crítica y scorecard.
- `design-lean.md` — lean/adversarial: prompt corto, guardrails duros y vertical slices.
- `design-hybrid.md` — híbrida: Lean como base + método de Director + contrato de Contract.
- `design-final.md` — final: Lean + endurecimiento técnico de la híbrida, sin la matriz que redujo el rango.

No se instalan con el CLI; se copian a `.opencode/commands/design.md` en copias
aisladas del proyecto. El protocolo completo está en
[`versions/README.md`](versions/README.md) y los resultados en
[`docs/experimento-nexo.md`](docs/experimento-nexo.md).

### Resultados de los experimentos

Se probaron las tres versiones en paralelo sobre el mismo proyecto (Nexo) y el
mismo brief:

| Versión | Diseño (ciego) | Técnica (ciega) | Veredicto |
| --- | ---: | ---: | --- |
| Lean / adversarial | **4,56 / 5** | **90,7 / 100** | Ganadora en la primera ronda |
| Contract-first | 4,54 / 5 | 81,5 / 100 | Cerca en diseño, más deuda técnica |
| Creative-director | 4,26 / 5 | 86,8 / 100 | Mayor divergencia, peor sistema |

En una segunda ronda se comparó la híbrida contra Lean:

| Versión | Diseño (ciego) | Técnica (ciega) | Veredicto |
| --- | ---: | ---: | --- |
| Lean | **87,5 / 100** | 76 / 100 | Mejor rango, deuda técnica |
| Híbrida | 84,6 / 100 | **88 / 100** | Mejor técnica, menos rango |

La **final** parte de Lean para conservar el rango y le añade el endurecimiento
técnico de la híbrida. Está pendiente de probar con otro brief.

## Instalación rápida

En la raíz del proyecto:

```bash
npx command-forge add design
```

Esto crea `.opencode/commands/design.md`. OpenCode detecta el archivo
automáticamente y lo expone como `/design`; no hace falta reiniciar.

> Este comando funciona cuando el paquete está publicado en npm. Mientras
> tanto, usa la variante de GitHub que aparece más abajo.

Para tenerlo en todos tus proyectos:

```bash
npx command-forge add design --global
```

Si todavía no has publicado el paquete en npm, puedes instalarlo directamente
desde GitHub:

```bash
npx github:J04L/command-forge add design
```

> `npx` descarga el paquete en una caché temporal y ejecuta su CLI. En CI o
> scripts usa `npx -y ...` para aceptar la instalación.

## Uso

```text
/design landing para una app de finanzas personales para gente de 25-40 años, tono cercano y premium
```

El comando sigue este flujo:

1. **Encuadra el brief.** Si falta información, hace como máximo 3 preguntas.
2. **Descubre skills de diseño.** Busca en las rutas de skills de OpenCode,
   Claude y Agents, detecta las relevantes y las carga con la herramienta
   `skill`. Si no hay ninguna, lo dice y ofrece instalar una con permiso.
3. **Prepara un laboratorio aislado.** Crea `.design-lab/runs/<fecha>-<slug>/`
   si no existe. Nunca modifica la app real durante la exploración.
4. **Diseña A/B/C.** Tres direcciones que se diferencian en al menos 4 ejes
   (tipografía, color, densidad, layout, imagen, movimiento...), no tres
   variaciones de color del mismo diseño.
5. **Verifica.** Levanta un servidor local, abre las variantes, revisa consola,
   responsive, accesibilidad y estados, y guarda capturas en `shots/`.
6. **Presenta y decide.** Tabla comparativa, enlaces, recomendación razonada y
   una pregunta: ¿A, B, C o una mezcla?

### El laboratorio

El comando trabaja siempre dentro de un entorno de pruebas:

```text
.design-lab/
├── README.md
└── runs/2026-11-08-landing-finanzas/
    ├── index.html            # comparador A/B/C
    ├── a/index.html
    ├── b/index.html
    ├── c/index.html
    ├── shared/               # tokens, copy y assets compartidos
    └── shots/                # capturas de verificación
```

- Si el laboratorio ya existe, añade una run nueva; no borra las anteriores.
- Si el proyecto es un repo git, añade `.design-lab/` a `.git/info/exclude`
  (ignorado local) sin tocar el `.gitignore` del proyecto.
- El servidor por defecto es `python3 -m http.server 4173 --directory .design-lab`,
  pero el agente puede usar otro que ya esté disponible.
- Solo cuando eliges una variante, el agente la integra en el proyecto real.

## Skills de diseño recomendadas

El comando descubre las skills que ya tengas instaladas. Si quieres mejorar el
punto de partida, puedes instalar alguna de estas:

```bash
npx skills add anthropics/skills --skill frontend-design
npx skills add vercel-labs/agent-skills --skill web-design-guidelines
npx skills add pbakaus/impeccable --skill critique
npx skills add emilkowalski/skill --skill emil-design-eng
```

No es obligatorio: `/design` funciona sin skills, pero las aprovecha si existen.

## CLI

```text
npx command-forge <comando> [opciones]
```

| Comando | Descripción |
| --- | --- |
| `list`, `ls` | Lista los comandos del paquete. |
| `add <nombre...>`, `install` | Instala comandos en `.opencode/commands/`. |
| `remove <nombre...>`, `rm` | Elimina comandos instalados. |
| `help` | Muestra la ayuda. |

| Opción | Descripción |
| --- | --- |
| `-g, --global` | Usa `~/.config/opencode/commands` (o `$XDG_CONFIG_HOME`). |
| `-d, --dir <ruta>` | Directorio de destino personalizado. |
| `-f, --force` | Sobrescribe comandos existentes. |
| `--all` | Aplica a todos los comandos del paquete. |
| `--dry-run` | Muestra qué haría sin escribir nada. |
| `--json` | Salida JSON para `list`. |
| `-h, --help` | Ayuda. |
| `-v, --version` | Versión. |

Ejemplos:

```bash
npx command-forge list
npx command-forge add design
npx command-forge add design --global
npx command-forge add --all --force
npx command-forge remove design
npx command-forge add design --dry-run
```

## Requisitos

- Node.js 18 o superior.
- OpenCode.
- Python 3 (opcional) para el servidor estático del laboratorio; el agente puede
  usar cualquier servidor que ya tengas.
- Una herramienta de navegador (opcional pero recomendada) para verificar y
  capturar las variantes.

## Desarrollo

```bash
git clone https://github.com/J04L/command-forge.git
cd command-forge
npm test
node bin/cli.js list
npm pack --dry-run
```

Para probar el instalador contra un proyecto temporal:

```bash
mkdir -p /tmp/mi-proyecto && cd /tmp/mi-proyecto
node /ruta/a/command-forge/bin/cli.js add design
```

## Publicación y distribución

Hay dos formas implementadas y una tercera opcional:

1. **npm + npx** (recomendada): `npm publish --access public`, y tus usuarios
   ejecutan `npx command-forge add design`.
2. **GitHub + npx**, sin publicar en npm:
   `npx github:J04L/command-forge add design`.
3. **Instalador `curl`** (opcional, no incluido todavía) si algún día quieres
   una experiencia sin Node.

El CLI de `skills` (`npx skills add`) solo instala `SKILL.md`; no instala
comandos. Un plugin de OpenCode tampoco registra comandos automáticamente, así
que un pequeño CLI con `bin` es la forma fiable de hacerlo.

Tienes los detalles, el checklist de publicación y las alternativas en
[`docs/distribucion.md`](docs/distribucion.md).

## Estructura

```text
.
├── bin/cli.js              # instalador npx
├── commands/design.md      # comando /design
├── docs/distribucion.md    # cómo publicarlo y distribuirlo
├── test/cli.test.js        # tests del instalador
├── package.json
└── README.md
```

## Licencia

MIT. Consulta [LICENSE](LICENSE).
