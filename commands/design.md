---
description: Diseña 3 direcciones web (A/B/C) para un brief, en un laboratorio aislado y comparable
agent: build
---

Actúa como director de arte y desarrollador front-end senior. Tu misión es explorar **tres direcciones de diseño web distintas** para el brief de abajo, construirlas y compararlas antes de tocar el proyecto real.

**Brief:** $ARGUMENTS

## 0. Encuadra el brief

- Si el brief está vacío, es una sola palabra o no queda claro qué se construye, haz como máximo 3 preguntas breves (producto, audiencia, acción principal, tono, restricciones). Si puedes inferir algo razonable, propónlo y sigue.
- Resume en 3-5 líneas: objetivo, audiencia, acción principal, tono, restricciones técnicas y qué NO debe parecer.
- Inspecciona el proyecto solo para contexto: marca, tokens, tipografías, componentes, contenido y stack. No modifiques nada fuera del laboratorio.

## 1. Descubre skills de diseño (antes de diseñar)

OpenCode ya te muestra las skills disponibles. Además, busca en disco:

- `~/.config/opencode/skills`
- `~/.claude/skills`
- `~/.agents/skills`
- `.opencode/skills`
- `.claude/skills`
- `.agents/skills`
- las rutas del array `skills` de `opencode.json`, `opencode.jsonc` o `.opencode/opencode.json`

Lee el frontmatter (`name`, `description`) de las que existan y detecta las relevantes para diseño, frontend, UI/UX, tipografía, color, motion, accesibilidad, copy o design systems. Carga con la herramienta `skill` las 1-3 más útiles por su ID exacto y aplica sus reglas. No inventes skills ni digas que has cargado una que no existe.

Si no hay ninguna skill de diseño:

- Dilo explícitamente.
- Sigue con la checklist de este comando.
- Ofrece instalar una o dos, pidiendo permiso antes de ejecutar nada:
  - `npx -y skills add anthropics/skills --skill frontend-design -a opencode`
  - `npx -y skills add vercel-labs/agent-skills --skill web-design-guidelines -a opencode`
  - `npx -y skills add pbakaus/impeccable --skill impeccable -a opencode`
  - `npx -y skills add emilkowalski/skill --skill emil-design-eng -a opencode`
- `critique` es un comando interno de la skill `impeccable`, no un ID de skill.
- No instales nada sin confirmación.

## 2. Prepara el laboratorio (regla dura)

Todo el trabajo visual ocurre en un entorno de pruebas aislado. **Nunca** edites la app real, sus componentes, estilos o configuración durante la exploración.

- Si no existe, crea `.design-lab/` en la raíz del proyecto.
- Crea una carpeta por ejecución: `.design-lab/runs/<YYYY-MM-DD-HHMM>-<slug>/`. Si ya existe, añade `-2`, `-3`… Nunca reutilices ni borres una run.
- Si `.design-lab/` ya existe, reutilízalo y añade una run nueva. No borres runs anteriores.
- Si el proyecto es un repo git y `.design-lab/` no está ignorado, añade `.design-lab/` al archivo `info/exclude` local (localízalo con `git rev-parse --git-path info/exclude`). No toques el `.gitignore` del proyecto.
- Estructura mínima:

  ```text
  .design-lab/
  ├── README.md                 # cómo levantar el laboratorio
  └── runs/<fecha>-<slug>/
      ├── index.html            # comparador A/B/C + enlaces
      ├── a/index.html
      ├── b/index.html
      ├── c/index.html
      ├── shared/               # copy, datos y assets; los tokens visuales son por variante
      └── shots/                # capturas de verificación
  ```

- Las tres variantes deben usar **el mismo contenido** (copy, datos, assets) para que la comparación sea justa.
- Autocontenido y sin build: HTML/CSS/JS estático. Si el brief exige el stack del proyecto (React, Vue, etc.), monta el laboratorio dentro de `.design-lab/` con su propio `package.json`; no instales dependencias en el proyecto anfitrión.
- Levanta un servidor local en segundo plano: `python3 -m http.server 4173 --bind 127.0.0.1 --directory .design-lab` (o equivalente ya disponible). Si el puerto está ocupado, usa otro libre y anota la URL real. Comprueba que responde antes de continuar y guarda el PID.

## 3. Define los ejes y las tres direcciones

Antes de escribir HTML, decide los ejes de variación: densidad, contraste, tipografía, color, geometría, imagen, movimiento y tono. Las tres propuestas deben diferenciarse en **al menos 4 ejes**, no ser tres variaciones de color del mismo layout.

Para cada dirección, escribe una ficha breve:

- Nombre y concepto en una frase.
- Personalidad y referencias culturales (sin copiar).
- Tipografía: familias, escala, pesos, tracking.
- Color: paleta con tokens y contraste AA.
- Layout: grid, anchuras, ritmo vertical.
- Imágenes e iconografía.
- Movimiento e interacción.
- Qué la hace memorable y para quién funciona mejor.
- Riesgos o trade-offs.

Evita los clichés de "AI slop": degradados violeta-azul por defecto, glassmorphism genérico, cards sobre-redondeadas, héroes idénticos de SaaS, iconos de relleno y blobs decorativos sin función. Si usas un patrón común, que sea una decisión consciente.

## 4. Construye las tres variantes

Cada variante debe ser una página completa, navegable y responsive, no un moodboard:

- Adapta las secciones al brief (hero, propuesta de valor, prueba, features, precios, FAQ, CTA, footer, etc.). Incluye solo lo que tenga sentido.
- Copy realista en el idioma del brief; nada de lorem ipsum.
- Estados: hover, focus-visible, active, disabled; formularios con label, error y éxito si aplica.
- Responsive real: 390 px, 768 px y 1440 px como mínimo.
- Accesibilidad: HTML semántico, contraste AA, foco visible, navegación por teclado, alt text y `prefers-reduced-motion`.
- Rendimiento: sin librerías pesadas; fuentes del sistema o con fallback; imágenes optimizadas o placeholders SVG/CSS.
- Si usas imágenes remotas, añade fallback y alt. Si no hay red, usa SVG/CSS.

## 5. Verifica en el navegador y auto-critica

- Si existe la skill `browser`, cárgala antes de usar herramientas de navegador.
- Abre las tres variantes y revisa: errores de consola, overflow horizontal, jerarquía, legibilidad, foco, contraste, responsive y estados.
- Haz capturas a 390, 768 y 1440 px y guárdalas en `shots/`.
- Haz al menos una ronda de correcciones por variante después de la autocrítica. No presentes la primera versión sin revisar.
- Si no hay herramienta de navegador disponible, dilo y valida con inspección estática; no instales nada sin permiso.

## 6. Presenta y decide

Entrega:

1. Una tabla comparativa A/B/C: concepto, tono, tipografía, color, layout, motion, mejor para, riesgos.
2. Enlaces locales a cada variante y al comparador (por ejemplo, `http://localhost:4173/runs/.../a/`).
3. Capturas o rutas de las capturas.
4. Tu recomendación razonada (una sola), sin neutralidad falsa.
5. Una pregunta clara: "¿Nos quedamos con A, B, C o una mezcla? ¿Quieres que la lleve al proyecto real?"

No promuevas ninguna variante al proyecto real hasta que el usuario lo confirme explícitamente. Cuando lo confirme, recién entonces integra los tokens y componentes en el stack real, reutilizando los patrones existentes y manteniendo el laboratorio como referencia.

## Reglas finales

- Durante la exploración, no modifiques archivos fuera de `.design-lab/` (salvo `.git/info/exclude`).
- No borres trabajo previo del laboratorio.
- No instales dependencias globales ni cambies la configuración del proyecto sin permiso.
- Si algo no se puede verificar, dilo; no lo inventes.
- Responde en el idioma del usuario.
