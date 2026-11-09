# Experimento Nexo — tres versiones de `/design`

Primer experimento comparativo del comando `/design`. Se probaron tres enfoques
del mismo comando, en paralelo, sobre el mismo proyecto y el mismo brief.

## Montaje

- **Proyecto base:** Nexo, una landing de finanzas para freelancers en España,
  con marca, tokens, contenido de ejemplo y un stack estático.
- **Tres copias aisladas**, cada una con su propio repositorio git y una versión
  del comando instalada en `.opencode/commands/design.md`.
- **Mismo brief** para las tres, con `sin gates` para que llegaran hasta el final.
- **Mismo modelo y configuración**, servidores en puertos 4401, 4402 y 4403.
- **Evaluación ciega** con dos jueces: dirección de arte y front-end/a11y. Las
  salidas se etiquetaron X/Y/Z sin revelar la versión.

## Versiones probadas

| Versión | Enfoque | Prompt (palabras) |
| --- | --- | ---: |
| Contract-first | Artefactos, presupuesto, gates, evidencia | 2.498 |
| Creative-director | Tesis, matriz de 13 ejes, crítica, scorecard | 2.407 |
| Lean / adversarial | Guardrails duros, vertical slices, poco texto | 1.271 |

## Resultados

### Evaluación ciega de dirección de arte

| Set | Versión real | Nota /5 |
| --- | --- | ---: |
| **Y** | Lean | **4,56** |
| Z | Contract | 4,54 |
| X | Director | 4,26 |

- **Lean** ganó como *set*: mejor equilibrio, tres artefactos de producto
  distintos y buena respuesta a 390 px. Su dirección **B · La resta** fue la más
  clara: “Te queda 13.630 €”.
- **Contract** quedó a 0,02: mejor craft individual y mejor defensa de marca,
  pero A y B se parecían demasiado y el sticky de B tapaba la cita.
- **Director** tuvo la mayor divergencia, pero peor sistema: CTA débil en B,
  tabla cortada en móvil y precios antes de features en C.

### Evaluación ciega técnica

| Set | Versión real | Nota /100 |
| --- | --- | ---: |
| **Y** | Lean | **90,7** |
| X | Director | 86,8 |
| Z | Contract | 81,5 |

- **Lean**: HTML más limpio, foco por contexto, formularios con foco devuelto al
  error, tablas semánticas, JS externo y CSP simple. Fallos acotados: enlace
  “Producto”, falta `aria-required` y foco del CTA Pro de B.
- **Director**: muy buen trabajo de tablas/datos y calculadora, pero errores de
  foco en superficies oscuras, `<dl>` mal formado y un `step` incoherente.
- **Contract**: identidad visual fuerte, pero más deuda: enlaces legales a
  `#producto`, foco insuficiente en oscuro, formularios sin foco en error,
  `thead` oculto en móvil, nav móvil sin sustituto y nonce CSP estático.

### Artefactos y aislamiento

| Versión | Archivos en la run | Capturas | `git status` | Requests externos |
| --- | ---: | ---: | --- | ---: |
| Contract | 40 | 22 | limpio | 0 |
| Director | 50 | 30 | limpio | 0 |
| Lean | 140 | 63 | limpio | 0 |

Las tres respetaron `.design-lab/`, añadieron la línea a `info/exclude` y no
tocaron el proyecto real. Lean produjo muchos más artefactos de verificación
(auditor CDP, axe, checks) pese a ser el prompt más corto: la brevedad del
prompt no redujo el trabajo del agente, pero sí eliminó el `plan.md` y parte de
la ceremonia.

## Segunda ronda: Lean vs híbrida

Se construyó una híbrida (`versions/design-hybrid.md`) con Lean como base, el
método de Director y el contrato de Contract. Se probó con el mismo Nexo y se
comparó a ciegas contra Lean (P = híbrida, Q = Lean).

| Criterio | Híbrida (P) | Lean (Q) |
| --- | ---: | ---: |
| Diseño ciego | 84,6 / 100 | **87,5 / 100** |
| Técnica ciega | **88 / 100** | 76 / 100 |

- **Diseño:** Lean gana por rango real entre A/B/C y por Q·a como mejor página
  individual. La híbrida tiene mejor disciplina de marca y mejor móvil, pero sus
  tres direcciones se sienten más “un sistema con variantes”; además B tiene el
  grid invertido (rail auxiliar más ancho que el contenido) y C es una carta
  demasiado estrecha para una landing.
- **Técnica:** la híbrida gana por `required`/`aria-required`, enlaces legales
  honestos, foco ≥3:1 en superficies oscuras y `prefers-contrast`. Lean falla en
  los tres formularios, usa `href="#"` en los legales y tiene el foco del CTA Pro
  a 1:1.

## Decisión final

**Base: Lean + endurecimiento técnico**, no la híbrida completa. Lean produce el
mejor diseño y el mejor rango; la híbrida demuestra qué controles técnicos hay
que añadir. La versión resultante es `versions/design-final.md`.

Se incorporan de la híbrida:

- `required`/`aria-required` y devolución del foco al campo inválido;
- anillo de foco con ≥3:1 contra la superficie real (header, precios, cita,
  formulario y footer);
- enlaces legales reales o `aria-disabled`, nunca `href="#"` ni `#producto`;
- nav móvil sin ocultar sin sustituto;
- `<dl>` válido (sin `<span>`/`<p>` sueltos dentro de los `<div>`);
- sticky con `scroll-margin-top` y sin tapar contenido; capturas a scroll 0 o con
  sticky desactivado;
- `step` coherente en inputs numéricos;
- tabla ancha en móvil con pista visible y región enfocable;
- `prefers-contrast` y regiones live bien montadas.

Y se añaden tres reglas de rango que la híbrida no protegió:

- las tres voces tipográficas deben ser distintas (serif / sans / mono o
  equivalente); dos direcciones con la misma familia y rol no cuentan;
- cada dirección debe incluir un artefacto de producto o prueba en el primer
  scroll; una carta editorial sin producto no es una landing;
- sanity de layout: la columna principal no puede ser más estrecha que una
  auxiliar; el rail va a 280-320 px, no al revés. Fechas y trimestres deben ser
  coherentes entre secciones.

## Tercera ronda: V2 coordinadora

`design-v2.md` cambia la arquitectura: el agente principal no diseña, coordina.

- Escucha y extiende el contexto; puede mirar el repo, tokens, páginas
  existentes, referencias externas y competencia.
- Crea `context.md` solo porque hay tres subagentes que necesitan la misma base.
- Define tres territorios A/B/C y lanza tres subagentes `general` en paralelo,
  cada uno con su tesis, tono, restricciones de marca y carpeta (`a/`, `b/`, `c/`).
- Las tres parten del mismo `shared/` (copy, cifras, tokens, assets).
- El coordinador revisa, compara y recomienda; no integra sin elección.

Prueba real con el API de OpenCode (comando `/design` expandido, sesión primaria
`build`):

- 3 subagentes creados con **12 ms de diferencia** y ejecutados en paralelo.
- Direcciones distintas: **A · Editorial/Ledger**, **B · Taller/Agenda**,
  **C · Radar/Anticipación**.
- La V2.1 corrigió los fallos de la primera prueba: radios de 2-8 px, sin
  `backdrop-filter`, mismas cifras en las tres (4.820 / 18.450 / 2.140 / 14 jul /
  +12.000 como ejemplo).
- 0 errores de consola, 0 recursos externos, 0 overflow, 1 `h1` por página y
  todas las imágenes con `alt`.
- `git status` limpio: no se tocó la landing real.

**Decisión:** `design-v2.md` se promovió a `commands/design.md` como versión
estable. `design-final.md` queda como V1 de referencia.

## Siguiente paso

Validar la V2 con un segundo brief para comprobar que no está sobreajustada a
Nexo. En una sesión de escritorio con navegador, el coordinador también debería
hacer QA visual y capturas; la prueba por API no tenía navegador y esa parte
quedó fuera.
