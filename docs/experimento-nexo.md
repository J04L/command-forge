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

## Decisión

**Base: Lean / adversarial.** Ganó en las dos evaluaciones ciegas. Se le
injertan:

1. **De Creative-director:** tesis falsables, postura de marca, matriz de ejes,
   puerta de divergencia, crítica visual P0/P1 y scorecard.
2. **De Contract-first:** contrato de artefactos, `report.md`
   `PASS/FAIL/NO VERIFICADO`, presupuesto explícito y verificación mecánica.

La versión resultante es `versions/design-hybrid.md`.

## Correcciones incorporadas a la híbrida

Los evaluadores detectaron fallos concretos que la híbrida exige comprobar:

- anillo de foco con ≥3:1 contra su superficie real (header, precios, cita,
  formulario y footer);
- `required`/`aria-required` y devolución del foco al campo inválido;
- nav móvil sin ocultar sin sustituto;
- `<dl>` válido (sin `<span>`/`<p>` sueltos dentro de los `<div>`);
- sticky con `scroll-margin-top` y sin tapar contenido; capturas a scroll 0 o
  con sticky desactivado;
- enlaces legales reales o `aria-disabled`, nunca a `#producto`;
- `step` coherente en inputs numéricos;
- tabla ancha en móvil con pista visible y región enfocable;
- CTA principal que se lea como acción, no como *outline*;
- display mono con tracking que no rompa palabras.

## Siguiente paso

Probar la híbrida con otro brief y, si mantiene la calidad, promoverla a
`commands/design.md` como versión estable.
