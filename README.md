# command-forge

Comandos reutilizables para [OpenCode](https://opencode.ai). Instálalos en
cualquier proyecto con `npx`, sin copiar y pegar prompts a mano.

Repositorio: <https://github.com/J04L/command-forge>

## Comandos

| Comando | Qué hace |
| --- | --- |
| `/design <idea>` | Coordina **3 agentes de diseño en paralelo**: escucha y extiende el contexto, prepara un laboratorio aislado y lanza A/B/C, cada uno con una dirección propia. Después compara y recomienda antes de tocar el proyecto real. |

## Versiones en experimentación

La versión estable es `commands/design.md`: la **V2 coordinadora**. En `versions/`
quedan las variantes históricas del experimento:

- `design-v2.md` — **V2 coordinadora (actual)**: escucha, contexto compartido, 3 subagentes en paralelo.
- `design-contract.md` — contract-first: artefactos, presupuesto, gates y evidencia.
- `design-director.md` — creative-director: tesis, matriz de ejes, crítica y scorecard.
- `design-lean.md` — lean/adversarial: prompt corto, guardrails duros y vertical slices.
- `design-hybrid.md` — híbrida: Lean como base + método de Director + contrato de Contract.
- `design-final.md` — V1 final: Lean + endurecimiento técnico de la híbrida.

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

La **V1 final** partió de Lean para conservar el rango y le añadió el
endurecimiento técnico de la híbrida. La **V2.1** se probó con una sesión real
de OpenCode: 3 subagentes en paralelo, anti-referencias y contenido compartido
respetados, 0 errores de consola y 0 recursos externos. Es la versión estable
actual.

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

1. **Escucha y extiende.** Pregunta lo que falte, pero no interroga. Puede mirar
   el repo, los tokens y páginas existentes, referencias externas y competencia.
   Extrae las restricciones y anti-referencias de marca.
2. **Define tres territorios.** A/B/C con tesis, tono y territorio visual
   distintos. Si dos se parecen, los cambia antes de lanzar.
3. **Prepara el laboratorio.** Crea `context.md`, `shared/` con el copy y las
   cifras exactas, `a/`, `b/`, `c/` y el comparador. Levanta un servidor local.
4. **Lanza 3 subagentes en paralelo.** Cada uno recibe una dirección
   personalizada, las restricciones de marca y su carpeta. Las tres parten del
   mismo contenido; lo que cambia es la dirección.
5. **Revisa y compara.** Comprueba que cargan, que son responsive y que son
   distintas. Si una usa una anti-referencia o cambia datos, pide corregirla.
6. **Presenta y decide.** Tabla comparativa, enlaces, recomendación razonada y
   una pregunta: ¿cuál quieres desarrollar o integrar?

### El laboratorio

El comando trabaja siempre dentro de un entorno de pruebas:

```text
.design-lab/
└── runs/2026-11-09-134437-nexo/
    ├── context.md            # contexto compartido por los 3 agentes
    ├── index.html            # comparador A/B/C
    ├── a/                    # una dirección por carpeta
    ├── b/
    ├── c/
    └── shared/               # content, tokens y assets compartidos
```

- Si el laboratorio ya existe, añade una run nueva; no borra las anteriores.
- Si el proyecto es un repo git, añade `.design-lab/` a `.git/info/exclude`
  (ignorado local) sin tocar el `.gitignore` del proyecto.
- El coordinador levanta el servidor y pasa la URL a los tres agentes.
- Solo cuando eliges una dirección, se integra en el proyecto real.

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
├── commands/design.md      # comando /design (V2 coordinadora)
├── versions/               # variantes históricas del experimento
├── docs/                   # distribución y resultados
├── test/                   # tests del CLI y de las versiones
├── package.json
└── README.md
```

## Licencia

MIT. Consulta [LICENSE](LICENSE).
