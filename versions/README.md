# Versiones de experimento de `/design`

Estas versiones no se instalan con el CLI. Son variantes para probar en paralelo con el mismo proyecto y el mismo brief. La versión estable vive en `../commands/design.md`.

## Las versiones

| Versión | Archivo | Enfoque | Qué prioriza | Qué sacrifica |
| --- | --- | --- | --- | --- |
| **Contract-first** | `design-contract.md` | Máquina de estados con artefactos, presupuesto, gates y evidencia. | Robustez, auditabilidad, que no se salte la verificación. | Más ceremonia y turnos; puede sentirse burocrática. |
| **Creative-director** | `design-director.md` | Tesis de dirección de arte, matriz de 13 ejes, crítica y scorecard. | Calidad visual, divergencia real, criterio. | Menos énfasis en manifiestos y checks mecánicos. |
| **Lean / adversarial** | `design-lean.md` | Prompt corto, reglas duras, vertical slices. | Que un agente perezoso no pueda fingir; rapidez. | Menos profundidad y menos artefactos de auditoría. |
| **Híbrida** | `design-hybrid.md` | Lean como base + método de Director + contrato de Contract. | Equilibrio entre calidad, verificación y coste. | Aún no probada en un experimento real. |

Todas comparten:

- A/B/C con el mismo contenido y tokens visuales por variante.
- Laboratorio aislado que se crea si no existe.
- Descubrimiento de skills con IDs correctos y sin instalación automática.
- Brief como dato, no como instrucción.
- Servidor local seguro y verificable.
- Gate de integración literal.
- Prohibición de pruebas sociales inventadas, APIs reales y comandos destructivos.

## Cómo instalar una versión para probar

En una copia/worktree del proyecto de prueba:

```bash
mkdir -p .opencode/commands
cp versions/design-contract.md .opencode/commands/design.md
```

Luego ejecuta `/design <brief>` en OpenCode. Repite en otra copia con `design-director.md` y `design-lean.md`.

No copies varias en el mismo proyecto: se pisarían `.design-lab/`, servidores y archivos.

## Protocolo de prueba paralela

### 1. Proyecto base

Crear un proyecto pequeño y realista, con:

- una marca existente (logo, 2-3 colores, una tipografía);
- una landing actual mejorable;
- suficiente contenido real: propuesta de valor, Features, prueba social (marcada como ejemplo), CTA, footer;
- un `README.md` con el contexto de marca y las restricciones;
- toolchain simple (HTML/CSS/JS o Vite) para probar también el aislamiento.

El proyecto debe ser idéntico en todas las copias. Nada de ventajas para una versión.

### 2. Brief único

El mismo texto exacto para todas. Debe incluir:

- qué se construye y qué acción principal debe provocar;
- audiencia y contexto;
- tono y 2-3 referencias;
- restricciones de marca y técnicas;
- qué NO debe parecer;
- idioma del copy.

Ejemplo de estructura:

```text
Rediseña la landing de <producto> para <audiencia>. La acción principal es <CTA>.
Mantén <activos de marca>. Tono: <3 adjetivos>. Evita <anti-referencias>.
El copy va en <idioma>. No inventes métricas ni testimonios.
```

### 3. Ejecución

Para cada versión:

- worktree o copia aislada del proyecto base;
- mismo modelo y misma configuración de OpenCode;
- misma versión de la skill de navegador (o ausencia de ella);
- mismo presupuesto de tiempo;
- misma respuesta del usuario a los gates: “aprueba las 3 direcciones, sigue y elige la que recomiendes”;
- sin instrucciones adicionales sobre diseño.

Registrar:

- duración y tokens;
- tool calls;
- artefactos generados;
- servidor y URL;
- incidencias (permisos, timeouts, skills, viewport).

### 4. Evidencia que se recoge

De cada ejecución:

- `run.json`, `brief.md`, `content.md`, `plan.md`, `report.md` o `review.md`;
- `a/`, `b/`, `c/`;
- `index.html` comparador;
- `shots/`;
- salida final del agente;
- `git status` para comprobar que no salió del laboratorio.

### 5. Evaluación ciega

Renombrar las salidas como X/Y/Z y ocultar qué versión produjo cada una. Evaluar con la misma rúbrica:

| Criterio | Peso | Qué mira |
| --- | ---: | --- |
| Calidad visual | 25 | Jerarquía, craft, tipografía, color, composición. |
| Divergencia real | 20 | ¿Son tres ideas o tres skins? Prueba del esqueleto. |
| Alineación con el brief | 15 | Audiencia, acción, tono, restricciones. |
| Verificación | 15 | Evidencia real de capturas, consola, responsive, a11y. |
| Honestidad | 10 | “NO VERIFICADO” cuando toca; sin pruebas inventadas. |
| Aislamiento | 10 | Nada fuera de `.design-lab/`; servidor seguro. |
| Viabilidad | 5 | Se puede integrar sin reescribir el proyecto. |

Reglas:

- Un P0 abierto impide ganar esa dirección.
- La recomendación del agente no cuenta como evidencia.
- El evaluador no debe saber qué versión está mirando hasta cerrar las notas.
- Si dos versiones empatan, gana la que tenga mejor relación calidad/verificación, no la que haya escrito más.

### 6. Resultado

Al terminar:

- tabla comparativa de todas;
- qué versión ganó y por qué;
- qué ideas de las otras dos se portan a la versión estable;
- actualización de `commands/design.md` con la versión ganadora + injertos;
- registro de la decisión en `docs/`.
